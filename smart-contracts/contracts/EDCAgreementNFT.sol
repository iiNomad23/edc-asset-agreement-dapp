// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title EDCAgreementNFT
 * @dev ERC-721 NFT contract for Eclipse Dataspace Components (EDC) contract agreements
 * Each NFT represents a signed contract agreement between a provider and consumer
 */
contract EDCAgreementNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    // Custom errors for better gas efficiency
    error InvalidRecipientAddress();
    error AgreementIdRequired();
    error AssetIdRequired();
    error InvalidSigningTimestamp();
    error TokenDoesNotExist();
    error NotAuthorizedToRevoke();
    error AgreementAlreadyMinted();
    error AgreementAlreadyRevoked();
    error AgreementAlreadyExpired();
    error TransferFailed();
    error NoFundsToWithdraw();
    error InsufficientPayment();

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public totalSupply = 0;
    uint256 public mintPrice = 0 ether;
    address[] public interactedWallets;

    struct AgreementMetadata {
        string agreementId;
        string assetId;
        uint256 signedAt;
        string providerId;
        string consumerId;
        uint256 expiresAt;
        bool isRevoked;
        uint256 revokedAt;
        string revokeReason;
    }

    mapping(uint256 => AgreementMetadata) public agreements;
    mapping(string => uint256) public agreementIdToTokenId;
    mapping(address => uint256[]) public ownedTokens;
    mapping(address => bool) public hasInteracted;

    event AgreementMinted(
        uint256 indexed tokenId,
        string agreementId,
        string assetId,
        address indexed minter,
        address indexed recipient,
        string providerId,
        string consumerId,
        uint256 signedAt
    );

    event AgreementRevoked(
        uint256 indexed tokenId,
        string agreementId,
        address indexed revoker,
        uint256 revokedAt,
        string reason
    );

    event AgreementTransferred(
        uint256 indexed tokenId,
        string agreementId,
        address indexed from,
        address indexed to
    );

    event MintPriceUpdated(
        uint256 indexed oldPrice,
        uint256 indexed newPrice,
        address indexed updater
    );

    event FundsWithdrawn(
        address indexed to,
        uint256 amount
    );

    modifier tokenExists(uint256 tokenId) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist();
        }
        _;
    }

    /// @dev Admin can revoke any agreement, minters can only revoke agreements they own
    modifier canRevokeToken(uint256 tokenId) {
        bool isAdmin = hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        bool isTokenOwner = _ownerOf(tokenId) == msg.sender;
        if (!isAdmin && !isTokenOwner) {
            revert NotAuthorizedToRevoke();
        }
        _;
    }

    modifier notExpired(uint256 tokenId) {
        uint256 expiresAt = agreements[tokenId].expiresAt;
        if (expiresAt != 0 && expiresAt <= block.timestamp) {
            revert AgreementAlreadyExpired();
        }
        _;
    }

    modifier notRevoked(uint256 tokenId) {
        if (agreements[tokenId].isRevoked) {
            revert AgreementAlreadyRevoked();
        }
        _;
    }

    modifier validRecipient(address recipient) {
        if (recipient == address(0)) {
            revert InvalidRecipientAddress();
        }
        _;
    }

    modifier validAgreementId(string memory agreementId) {
        if (bytes(agreementId).length == 0) {
            revert AgreementIdRequired();
        }
        if (agreementIdToTokenId[agreementId] != 0) {
            revert AgreementAlreadyMinted();
        }
        _;
    }

    modifier validAssetId(string memory assetId) {
        if (bytes(assetId).length == 0) {
            revert AssetIdRequired();
        }
        _;
    }

    modifier validSigningTime(uint256 signedAt) {
        if (signedAt > block.timestamp) {
            revert InvalidSigningTimestamp();
        }
        _;
    }

    constructor() ERC721("EDC Agreement NFT", "EDC_AGR") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Owner mint function - allows contract owner to mint for any recipient
     * @param recipient Address to receive the NFT
     * @param agreementId Unique EDC agreement identifier
     * @param assetId ID of the asset in the agreement
     * @param providerId ID of the data provider
     * @param consumerId ID of the data consumer
     * @param signedAt Timestamp when agreement was signed
     * @param expiresAt Timestamp when agreement expires (0 if no expiration)
     * @param _tokenURI URI pointing to the agreement metadata
     */
    function ownerMint(
        address recipient,
        string memory agreementId,
        string memory assetId,
        string memory providerId,
        string memory consumerId,
        uint256 signedAt,
        uint256 expiresAt,
        string memory _tokenURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        return _mintAgreement(
            recipient,
            agreementId,
            assetId,
            providerId,
            consumerId,
            signedAt,
            expiresAt,
            _tokenURI
        );
    }

    /**
     * @dev Approved minter mint function - allows approved minters to mint only for themselves
     * @param agreementId Unique EDC agreement identifier
     * @param assetId ID of the asset in the agreement
     * @param providerId ID of the data provider
     * @param consumerId ID of the data consumer
     * @param signedAt Timestamp when agreement was signed
     * @param expiresAt Timestamp when agreement expires (0 if no expiration)
     * @param _tokenURI URI pointing to the agreement metadata
     */
    function mint(
        string memory agreementId,
        string memory assetId,
        string memory providerId,
        string memory consumerId,
        uint256 signedAt,
        uint256 expiresAt,
        string memory _tokenURI
    ) external payable onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        if (msg.value != mintPrice) {
            revert InsufficientPayment();
        }

        return _mintAgreement(
            msg.sender,
            agreementId,
            assetId,
            providerId,
            consumerId,
            signedAt,
            expiresAt,
            _tokenURI
        );
    }

    /**
     * @dev Revokes an agreement NFT
     * @param tokenId ID of the token to revoke
     * @param reason Reason for revocation
     */
    function revokeAgreement(
        uint256 tokenId,
        string calldata reason
    ) external tokenExists(tokenId) canRevokeToken(tokenId) notExpired(tokenId) notRevoked(tokenId) {
        AgreementMetadata storage agreement = agreements[tokenId];

        agreement.isRevoked = true;
        agreement.revokedAt = block.timestamp;
        agreement.revokeReason = reason;

        emit AgreementRevoked(
            tokenId,
            agreement.agreementId,
            msg.sender,
            block.timestamp,
            reason
        );
    }

    /**
     * @dev Owner can update mint price (in wei).
     * @param newPrice Price in wei
     */
    function updateMintPrice(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 old = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(old, newPrice, msg.sender);
    }

    /**
     * @dev Owner can withdraw contract balance to an address
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert NoFundsToWithdraw();
        }

        (bool success,) = payable(msg.sender).call{value: balance}("");
        if (!success) {
            revert TransferFailed();
        }

        emit FundsWithdrawn(msg.sender, balance);
    }

    /**
     * @dev Returns true if the account has the MINTER_ROLE.
     * @param account The address to check.
     */
    function isMinter(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    /**
     * @dev Returns true if the account has the DEFAULT_ADMIN_ROLE.
     * @param account The address to check.
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev Internal function to track wallet interaction
     */
    function _trackWalletInteraction(address wallet) private {
        if (hasInteracted[wallet]) {
            return;
        }

        interactedWallets.push(wallet);
        hasInteracted[wallet] = true;
    }

    /**
     * @dev Internal function to mint a new agreement NFT
     */
    function _mintAgreement(
        address recipient,
        string memory agreementId,
        string memory assetId,
        string memory providerId,
        string memory consumerId,
        uint256 signedAt,
        uint256 expiresAt,
        string memory _tokenURI
    ) private validRecipient(recipient) validAgreementId(agreementId) validAssetId(assetId) validSigningTime(signedAt) returns (uint256) {
        uint256 tokenId = totalSupply + 1;
        totalSupply = tokenId;

        agreements[tokenId] = AgreementMetadata({
            agreementId: agreementId,
            assetId: assetId,
            signedAt: signedAt,
            providerId: providerId,
            consumerId: consumerId,
            expiresAt: expiresAt,
            isRevoked: false,
            revokedAt: 0,
            revokeReason: ""
        });

        agreementIdToTokenId[agreementId] = tokenId;

        _trackWalletInteraction(recipient);
        ownedTokens[recipient].push(tokenId);

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit AgreementMinted(
            tokenId,
            agreementId,
            assetId,
            msg.sender,
            recipient,
            providerId,
            consumerId,
            signedAt
        );

        return tokenId;
    }

    /**
     * @dev Removes a token from an owner's list
     */
    function _removeTokenFromOwner(address owner, uint256 tokenId) private {
        uint256[] storage tokens = ownedTokens[owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Override transfer to emit custom event and update owned tokens
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721) returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != address(0) && to != address(0) && from != to) {
            _removeTokenFromOwner(from, tokenId);

            _trackWalletInteraction(to);
            ownedTokens[to].push(tokenId);

            emit AgreementTransferred(tokenId, agreements[tokenId].agreementId, from, to);
        }

        return from;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
