// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {EDCAgreementNFT} from "./EDCAgreementNFT.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {CommonBase} from "forge-std/src/Base.sol";
import {StdAssertions} from "forge-std/src/StdAssertions.sol";
import {StdChains} from "forge-std/src/StdChains.sol";
import {StdCheats, StdCheatsSafe} from "forge-std/src/StdCheats.sol";
import {StdUtils} from "forge-std/src/StdUtils.sol";
import {Test} from "forge-std/src/Test.sol";

contract EDCAgreementNFTTest is Test {
    EDCAgreementNFT public nft;

    address private owner = address(1);
    address private user1 = address(2);
    address private user2 = address(3);

    string constant private FIXED_BADGE_URL = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop";

    function setUp() public {
        vm.prank(owner);
        nft = new EDCAgreementNFT();
    }

    function testDeployment() public view {
        assertEq(nft.name(), "EDC Agreement NFT");
        assertEq(nft.symbol(), "EDC_AGR");
        assertTrue(nft.isAdmin(owner));
        assertEq(nft.totalSupply(), 0);
        assertEq(nft.mintPrice(), 0);
    }

    function testMintWithFixedURL() public {
        string memory agreementId = "urn:uuid:agreement-001";
        string memory assetId = "urn:asset:data-123";

        string memory tokenURI = string(abi.encodePacked(
            "data:application/json;utf8,",
            '{"name":"EDC Agreement","image":"',
            FIXED_BADGE_URL,
            '","attributes":[]}'
        ));

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            agreementId,
            assetId,
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        assertEq(nft.ownerOf(tokenId), user1);
        assertEq(nft.tokenURI(tokenId), tokenURI);
    }

    function testMintMultipleWithSameImage() public {
        vm.startPrank(owner);

        for (uint256 i = 0; i < 3; i++) {
            string memory agreementId = string(abi.encodePacked("agreement-", i));
            string memory tokenURI = string(abi.encodePacked(
                "data:application/json;utf8,",
                '{"name":"Agreement ',
                Strings.toString(i),
                '","image":"',
                FIXED_BADGE_URL,
                '"}'
            ));

            nft.ownerMint(
                user1,
                agreementId,
                "asset",
                "provider",
                "consumer",
                block.timestamp,
                0,
                tokenURI
            );
        }

        vm.stopPrank();

        assertEq(nft.totalSupply(), 3);
        assertEq(nft.getOwnedTokens(user1).length, 3);
    }

    function testFullStorageDataAvailable() public {
        string memory agreementId = "urn:uuid:storage-test";
        string memory assetId = "urn:asset:test";
        string memory providerId = "urn:connector:provider";
        string memory consumerId = "urn:connector:consumer";

        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            agreementId,
            assetId,
            providerId,
            consumerId,
            block.timestamp,
            0,
            tokenURI
        );

        EDCAgreementNFT.AgreementMetadata memory agreement = nft.getAgreement(tokenId);
        assertEq(agreement.agreementId, agreementId);
        assertEq(agreement.assetId, assetId);
        assertEq(agreement.providerId, providerId);
        assertEq(agreement.consumerId, consumerId);
        assertFalse(agreement.isRevoked);
    }

    function testGasMeasurement() public {
        string memory agreementId = "eb2f88d5-cd15-4b19-b1b2-75e92e8ed8be";
        string memory assetId = "asset-3";
        string memory providerId = "did:web:10.0.40.172%3A7083:provider";
        string memory consumerId = "did:web:10.0.40.171%3A7083:consumer";
        uint256 signedAt = block.timestamp;

        string memory fullAgreement = string(
            abi.encodePacked(
                '{"@type":"ContractAgreement",',
                '"@id":"', agreementId, '",',
                '"assetId":"', assetId, '",',
                '"policy":{',
                '"@id":"820ae012-e76b-48c7-a11a-0b27cc3b0fef",',
                '"@type":"odrl:Agreement",',
                '"odrl:permission":[],',
                '"odrl:prohibition":[],',
                '"odrl:obligation":{',
                '"odrl:action":{"@id":"odrl:use"},',
                '"odrl:constraint":{',
                '"odrl:leftOperand":{"@id":"DataAccess.level"},',
                '"odrl:operator":{"@id":"odrl:eq"},',
                '"odrl:rightOperand":"processing"',
                '}',
                '},',
                '"odrl:assignee":"', consumerId, '",',
                '"odrl:assigner":"', providerId, '",',
                '"odrl:target":{"@id":"', assetId, '"}',
                '},',
                '"contractSigningDate":', Strings.toString(signedAt), ',',
                '"consumerId":"', consumerId, '",',
                '"providerId":"', providerId, '",',
                '"@context":{',
                '"@vocab":"https://w3id.org/edc/v0.0.1/ns/",',
                '"edc":"https://w3id.org/edc/v0.0.1/ns/",',
                '"odrl":"http://www.w3.org/ns/odrl/2/"',
                '}',
                '}'
            )
        );

        string memory metadata = string(
            abi.encodePacked(
                '{"name":"EDC Agreement #', agreementId,
                '","description":"Access token for asset ', assetId,
                ' under negotiated policy.","external_url":"http://localhost:5173/agreements/',
                agreementId,
                '","image":"', FIXED_BADGE_URL,
                '","attributes":[',
                '{"trait_type":"Agreement ID","value":"', agreementId, '"},',
                '{"trait_type":"Asset ID","value":"', assetId, '"},',
                '{"trait_type":"Provider ID","value":"', providerId, '"},',
                '{"trait_type":"Consumer ID","value":"', consumerId, '"},',
                '{"trait_type":"Signed At","value":"', Strings.toString(signedAt), '"}',
                '],',
                '"full_agreement":', fullAgreement,
                '}'
            )
        );

        // Encode metadata as base64 data URI
        string memory base64JSON = Base64.encode(bytes(metadata));
        string memory tokenURI = string(
            abi.encodePacked("data:application/json;base64,", base64JSON)
        );

        uint256 gasBefore = gasleft();

        vm.prank(owner);
        nft.ownerMint(
            user1,
            agreementId,
            assetId,
            providerId,
            consumerId,
            signedAt,
            0,
            tokenURI
        );

        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("Gas used for minting (Full Storage + Data URI)", gasUsed);

        // Full storage should use <2M gas
        assertLt(gasUsed, 2000000, "Gas usage should be lower than 2M");
    }

    function testGasMeasurementWithIPFS() public {
        string memory agreementId = "eb2f88d5-cd15-4b19-b1b2-75e92e8ed8bf";
        string memory assetId = "asset-3";
        string memory providerId = "did:web:10.0.40.172%3A7083:provider";
        string memory consumerId = "did:web:10.0.40.171%3A7083:consumer";
        uint256 signedAt = block.timestamp;

        string memory tokenURI = "https://ipfs.io/ipfs/QmTestMetadataHash123456789";

        uint256 gasBefore = gasleft();

        vm.prank(owner);
        nft.ownerMint(
            user1,
            agreementId,
            assetId,
            providerId,
            consumerId,
            signedAt,
            0,
            tokenURI
        );

        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("Gas used for minting (IPFS)", gasUsed);

        // IPFS should use <500k gas
        assertLt(gasUsed, 500000, "Gas usage should be lower than 500k");
    }

    function testRevokeAgreement() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Revoke Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            "revoke-test",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        vm.prank(user1);
        nft.revokeAgreement(tokenId, "Testing revocation");

        EDCAgreementNFT.AgreementMetadata memory agreement = nft.getAgreement(tokenId);
        assertTrue(agreement.isRevoked);
        assertEq(agreement.revokeReason, "Testing revocation");
        assertGt(agreement.revokedAt, 0);
    }

    function testQueryFunctions() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Query Test\"}";

        vm.startPrank(owner);

        nft.ownerMint(
            user2,
            "query-1",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        nft.ownerMint(
            user2,
            "query-2",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        vm.stopPrank();

        uint256[] memory tokens = nft.getOwnedTokens(user2);
        assertEq(tokens.length, 2);

        uint256 tokenId = nft.agreementIdToTokenId("query-1");
        assertEq(nft.ownerOf(tokenId), user2);
    }

    function testValidityChecks() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Validity Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            "validity-test",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            block.timestamp + 365 days,
            tokenURI
        );

        EDCAgreementNFT.AgreementMetadata memory agreement = nft.getAgreement(tokenId);
        assertTrue(agreement.expiresAt > block.timestamp);
        assertFalse(agreement.isRevoked);

        vm.warp(block.timestamp + 366 days);

        EDCAgreementNFT.AgreementMetadata memory expiredAgreement = nft.getAgreement(tokenId);
        assertTrue(expiredAgreement.expiresAt <= block.timestamp);
    }

    function testIntegrationFlow() public {
        string memory agreementId = "urn:uuid:integration";

        string memory tokenURI = string(abi.encodePacked(
            "data:application/json;utf8,",
            '{"name":"Integration Test","description":"Full flow without IPFS","image":"',
            FIXED_BADGE_URL,
            '","attributes":[{"trait_type":"Status","value":"Active"}]}'
        ));

        // 1. Mint
        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            agreementId,
            "integration-asset",
            "integration-provider",
            "integration-consumer",
            block.timestamp,
            0,
            tokenURI
        );

        // 2. Verify mint
        assertEq(nft.ownerOf(tokenId), user1);
        assertEq(nft.tokenURI(tokenId), tokenURI);

        // 3. Verify on-chain data
        EDCAgreementNFT.AgreementMetadata memory agreement = nft.getAgreement(tokenId);
        assertEq(agreement.agreementId, agreementId);
        assertFalse(agreement.isRevoked);

        // 4. Revoke
        vm.prank(user1);
        nft.revokeAgreement(tokenId, "Integration test complete");

        // 5. Verify revocation
        EDCAgreementNFT.AgreementMetadata memory revokedAgreement = nft.getAgreement(tokenId);
        assertTrue(revokedAgreement.isRevoked);

        emit log_string("Integration test passed: Mint -> Verify -> Revoke (No IPFS needed)");
    }

    function testDifferentImageURLFormats() public {
        string[3] memory imageUrls = [
                    "https://example.com/badge.png",
                    "https://cdn.example.com/nft/123.jpg",
                    "https://i.imgur.com/abc123.png"
            ];

        vm.startPrank(owner);

        for (uint256 i = 0; i < imageUrls.length; i++) {
            string memory tokenURI = string(abi.encodePacked(
                "data:application/json;utf8,",
                '{"name":"Test ',
                Strings.toString(i),
                '","image":"',
                imageUrls[i],
                '"}'
            ));

            nft.ownerMint(
                user1,
                string(abi.encodePacked("url-test-", Strings.toString(i))),
                "asset",
                "provider",
                "consumer",
                block.timestamp,
                0,
                tokenURI
            );
        }

        vm.stopPrank();

        assertEq(nft.totalSupply(), 3);
    }

    function testFuzzMintWithFixedURL(
        address recipient,
        string memory agreementId,
        string memory assetId
    ) public {
        vm.assume(recipient != address(0));
        vm.assume(recipient.code.length == 0);
        vm.assume(bytes(agreementId).length > 0);
        vm.assume(bytes(assetId).length > 0);

        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Fuzz Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            recipient,
            agreementId,
            assetId,
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        assertEq(nft.ownerOf(tokenId), recipient);
    }

    function testRoleManagement() public {
        assertTrue(nft.isAdmin(owner));
        assertTrue(nft.isMinter(owner));

        vm.prank(owner);
        nft.grantMinterRole(user1);
        assertTrue(nft.isMinter(user1));

        vm.prank(owner);
        nft.revokeMinterRole(user1);
        assertFalse(nft.isMinter(user1));
    }

    function testMinterCanMintForSelf() public {
        vm.prank(owner);
        nft.grantMinterRole(user1);

        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Minter Test\"}";

        vm.prank(user1);
        uint256 tokenId = nft.mint(
            "minter-agreement",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        assertEq(nft.ownerOf(tokenId), user1);
    }

    function testRevertNormalMintWithoutMinterRole() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"No Role Test\"}";

        bytes32 minterRole = keccak256("MINTER_ROLE");
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")),
                user1,
                minterRole
            )
        );
        vm.prank(user1);
        nft.mint(
            "no-role-agreement",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );
    }

    function testMintPriceManagement() public {
        assertEq(nft.mintPrice(), 0);

        vm.prank(owner);
        nft.updateMintPrice(0.01 ether);
        assertEq(nft.mintPrice(), 0.01 ether);

        vm.prank(owner);
        nft.grantMinterRole(user1);

        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Paid Mint\"}";

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        nft.mint{value: 0.01 ether}(
            "paid-agreement",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        assertEq(address(nft).balance, 0.01 ether);
    }

    function testWithdraw() public {
        vm.prank(owner);
        nft.updateMintPrice(0.01 ether);

        vm.prank(owner);
        nft.grantMinterRole(user1);

        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Withdraw Test\"}";

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        nft.mint{value: 0.01 ether}(
            "withdraw-agreement",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        nft.withdraw();

        assertEq(address(nft).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + 0.01 ether);
    }

    function testRevertInvalidRecipientAddress() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Invalid Recipient\"}";

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.InvalidRecipientAddress.selector));

        vm.prank(owner);
        nft.ownerMint(
            address(0),
            "urn:uuid:invalid-recipient",
            "urn:asset:test",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );
    }

    function testRevertEmptyAgreementId() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Empty Agreement\"}";

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.AgreementIdRequired.selector));

        vm.prank(owner);
        nft.ownerMint(
            user1,
            "",
            "urn:asset:test",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );
    }

    function testRevertEmptyAssetId() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Empty Asset\"}";

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.AssetIdRequired.selector));

        vm.prank(owner);
        nft.ownerMint(
            user1,
            "urn:uuid:empty-asset",
            "",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );
    }

    function testRevertAgreementAlreadyMinted() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Duplicate Agreement\"}";

        vm.startPrank(owner);
        nft.ownerMint(
            user1,
            "urn:uuid:duplicate",
            "urn:asset:duplicate",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.AgreementAlreadyMinted.selector));
        nft.ownerMint(
            user2,
            "urn:uuid:duplicate",
            "urn:asset:duplicate2",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );
        vm.stopPrank();
    }

    function testRevertInvalidSigningTimestamp() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Future Timestamp\"}";

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.InvalidSigningTimestamp.selector));

        vm.prank(owner);
        nft.ownerMint(
            user1,
            "urn:uuid:future-timestamp",
            "urn:asset:future",
            "provider",
            "consumer",
            block.timestamp + 1 days,
            0,
            tokenURI
        );
    }

    function testRevertTokenDoesNotExist_GetAgreement() public {
        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.TokenDoesNotExist.selector));
        nft.getAgreement(999);
    }

    function testRevertNotAuthorizedToRevoke() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Unauthorized Revoke\"}";

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            "urn:uuid:unauthorized",
            "urn:asset:test",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.NotAuthorizedToRevoke.selector));
        vm.prank(user2);
        nft.revokeAgreement(tokenId, "Not your token");
    }

    function testRevertAgreementAlreadyRevoked() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Already Revoked\"}";

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            "urn:uuid:already-revoked",
            "urn:asset:test",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        vm.prank(user1);
        nft.revokeAgreement(tokenId, "First revoke");

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.AgreementAlreadyRevoked.selector));
        vm.prank(user1);
        nft.revokeAgreement(tokenId, "Second revoke");
    }

    function testRevertRevokeNonexistentToken() public {
        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.TokenDoesNotExist.selector));
        nft.revokeAgreement(12345, "No token");
    }

    function testRevertAgreementAlreadyExpired() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Expired Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.ownerMint(
            user1,
            "urn:uuid:expired",
            "urn:asset:test",
            "provider",
            "consumer",
            block.timestamp,
            block.timestamp + 1 days,
            tokenURI
        );

        // Fast forward past expiration
        vm.warp(block.timestamp + 2 days);

        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.AgreementAlreadyExpired.selector));
        vm.prank(user1);
        nft.revokeAgreement(tokenId, "Cannot revoke expired");
    }

    function testRevertInsufficientPayment() public {
        vm.prank(owner);
        nft.updateMintPrice(0.01 ether);

        vm.prank(owner);
        nft.grantMinterRole(user1);

        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Payment Test\"}";

        vm.deal(user1, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.InsufficientPayment.selector));
        vm.prank(user1);
        nft.mint{value: 0.005 ether}(
            "payment-test",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );
    }

    function testRevertNoFundsToWithdraw() public {
        vm.expectRevert(abi.encodeWithSelector(EDCAgreementNFT.NoFundsToWithdraw.selector));
        vm.prank(owner);
        nft.withdraw();
    }
}
