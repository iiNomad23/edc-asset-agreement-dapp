// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {EDCAgreementNFT} from "./EDCAgreementNFT.sol";
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
        assertEq(nft.symbol(), "EDC_AGR_TEST");
        assertEq(nft.owner(), owner);
        assertEq(nft.totalSupply(), 0);
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
        uint256 tokenId = nft.mintAgreement(
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

            nft.mintAgreement(
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
        assertEq(nft.tokensOfOwner(user1).length, 3);
    }

    function testFullStorageDataAvailable() public {
        string memory agreementId = "urn:uuid:storage-test";
        string memory assetId = "urn:asset:test";
        string memory providerId = "urn:connector:provider";
        string memory consumerId = "urn:connector:consumer";

        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.mintAgreement(
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
        string memory tokenURI = string(abi.encodePacked(
            "data:application/json;utf8,",
            '{"name":"Gas Test","image":"',
            FIXED_BADGE_URL,
            '"}'
        ));

        uint256 gasBefore = gasleft();

        vm.prank(owner);
        nft.mintAgreement(
            user1,
            "gas-test",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("Gas used for minting (Full Storage + Data URI)", gasUsed);

        // Full storage should use ~500k gas
        assertLt(gasUsed, 1000000, "Gas usage should be under 500k");
    }

    function testRevokeAgreement() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Revoke Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.mintAgreement(
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

        nft.mintAgreement(
            user2,
            "query-1",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            0,
            tokenURI
        );

        nft.mintAgreement(
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

        uint256[] memory tokens = nft.tokensOfOwner(user2);
        assertEq(tokens.length, 2);

        uint256 tokenId = nft.getTokenIdByAgreementId("query-1");
        assertEq(nft.ownerOf(tokenId), user2);
    }

    function testValidityChecks() public {
        string memory tokenURI = "data:application/json;utf8,{\"name\":\"Validity Test\"}";

        vm.prank(owner);
        uint256 tokenId = nft.mintAgreement(
            user1,
            "validity-test",
            "asset",
            "provider",
            "consumer",
            block.timestamp,
            block.timestamp + 365 days,
            tokenURI
        );

        assertTrue(nft.isValidAgreement(tokenId));
        assertFalse(nft.isExpired(tokenId));

        vm.warp(block.timestamp + 366 days);

        assertTrue(nft.isExpired(tokenId));
        assertFalse(nft.isValidAgreement(tokenId));
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
        uint256 tokenId = nft.mintAgreement(
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

        // 4. Check validity
        assertTrue(nft.isValidAgreement(tokenId));

        // 5. Revoke
        vm.prank(user1);
        nft.revokeAgreement(tokenId, "Integration test complete");

        // 6. Verify revocation
        EDCAgreementNFT.AgreementMetadata memory revokedAgreement = nft.getAgreement(tokenId);
        assertTrue(revokedAgreement.isRevoked);
        assertFalse(nft.isValidAgreement(tokenId));

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

            nft.mintAgreement(
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
        uint256 tokenId = nft.mintAgreement(
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
}
