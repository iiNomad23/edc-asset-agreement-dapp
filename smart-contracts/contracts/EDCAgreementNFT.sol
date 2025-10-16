// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title EDCAgreementNFT
 * @dev ERC-721 NFT contract for Eclipse Dataspace Components (EDC) contract agreements
 * Each NFT represents a signed contract agreement between a provider and consumer
 */
contract EDCAgreementNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

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
    mapping(address => uint256[]) private _ownedTokens;
    mapping(string => bool) public revokedAgreements;

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

    constructor() ERC721("EDC Agreement NFT", "EDC_AGR_TEST") Ownable(msg.sender) {}

    /**
     * @dev Mints a new agreement NFT
     * @param recipient Address to receive the NFT
     * @param agreementId Unique EDC agreement identifier
     * @param assetId ID of the asset in the agreement
     * @param providerId ID of the data provider
     * @param consumerId ID of the data consumer
     * @param signedAt Timestamp when agreement was signed
     * @param expiresAt Timestamp when agreement expires (0 if no expiration)
     * @param _tokenURI URI pointing to the agreement metadata (IPFS or HTTP)
     */
    function mintAgreement(
        address recipient,
        string memory agreementId,
        string memory assetId,
        string memory providerId,
        string memory consumerId,
        uint256 signedAt,
        uint256 expiresAt,
        string memory _tokenURI
    ) public returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(agreementId).length > 0, "Agreement ID required");
        require(bytes(assetId).length > 0, "Asset ID required");
        require(agreementIdToTokenId[agreementId] == 0, "Agreement already minted");
        require(signedAt <= block.timestamp, "Invalid signing timestamp");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

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
        _ownedTokens[recipient].push(tokenId);

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
     * @dev Revokes an agreement NFT
     * @param tokenId Token ID to revoke
     * @param reason Reason for revocation
     */
    function revokeAgreement(uint256 tokenId, string memory reason) public {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(
            ownerOf(tokenId) == msg.sender || owner() == msg.sender,
            "Not authorized to revoke"
        );
        require(!agreements[tokenId].isRevoked, "Agreement already revoked");

        AgreementMetadata storage agreement = agreements[tokenId];
        agreement.isRevoked = true;
        agreement.revokedAt = block.timestamp;
        agreement.revokeReason = reason;

        revokedAgreements[agreement.agreementId] = true;

        emit AgreementRevoked(
            tokenId,
            agreement.agreementId,
            msg.sender,
            block.timestamp,
            reason
        );
    }

    /**
     * @dev Checks if an agreement is expired
     * @param tokenId Token ID to check
     */
    function isExpired(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        AgreementMetadata memory agreement = agreements[tokenId];

        if (agreement.expiresAt == 0) {
            return false;
        }

        return block.timestamp > agreement.expiresAt;
    }

    /**
     * @dev Checks if an agreement is valid (not revoked and not expired)
     * @param tokenId Token ID to check
     */
    function isValidAgreement(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        AgreementMetadata memory agreement = agreements[tokenId];

        if (agreement.isRevoked) {
            return false;
        }

        if (agreement.expiresAt > 0 && block.timestamp > agreement.expiresAt) {
            return false;
        }

        return true;
    }

    /**
     * @dev Gets all token IDs owned by an address
     * @param owner Address to query
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    /**
     * @dev Gets agreement metadata by token ID
     * @param tokenId Token ID to query
     */
    function getAgreement(uint256 tokenId) public view returns (AgreementMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return agreements[tokenId];
    }

    /**
     * @dev Gets token ID by agreement ID
     * @param agreementId Agreement ID to query
     */
    function getTokenIdByAgreementId(string memory agreementId) public view returns (uint256) {
        uint256 tokenId = agreementIdToTokenId[agreementId];
        require(tokenId > 0 || (tokenId == 0 && _ownerOf(0) != address(0)), "Agreement not found");
        return tokenId;
    }

    /**
     * @dev Helper to remove token from owner's list
     */
    function _removeTokenFromOwnerList(address owner, uint256 tokenId) private {
        uint256[] storage tokens = _ownedTokens[owner];
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
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != address(0) && to != address(0) && from != to) {
            // Remove from old owner's list
            _removeTokenFromOwnerList(from, tokenId);

            // Add to new owner's list
            _ownedTokens[to].push(tokenId);

            // Emit custom transfer event
            AgreementMetadata memory agreement = agreements[tokenId];
            emit AgreementTransferred(tokenId, agreement.agreementId, from, to);
        }

        return from;
    }

    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}