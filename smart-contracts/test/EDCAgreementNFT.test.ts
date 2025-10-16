import { before, describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { network } from 'hardhat';

describe('EDCAgreementNFT', () => {
    let contract: any;
    let owner: any;
    let addr1: any;
    let addr2: any;
    let publicClient: any;

    const FIXED_BADGE_URL = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop';

    before(async () => {
        const { viem } = await network.connect();
        [owner, addr1, addr2] = await viem.getWalletClients();
        publicClient = await viem.getPublicClient();
        contract = await viem.deployContract('EDCAgreementNFT');
    });

    describe('Deployment', () => {
        test('should deploy with correct name and symbol', async () => {
            const name = await contract.read.name();
            const symbol = await contract.read.symbol();

            assert.equal(name, 'EDC Agreement NFT');
            assert.equal(symbol, 'EDC_AGR_TEST');
        });

        test('should set deployer as owner', async () => {
            const contractOwner = await contract.read.owner();
            assert.equal(contractOwner.toLowerCase(), owner.account.address.toLowerCase());
        });

        test('should start with zero total supply', async () => {
            const supply = await contract.read.totalSupply();
            assert.equal(supply, 0n);
        });
    });

    describe('Minting with Fixed URL', () => {
        test("should mint agreement NFT with HTTP image URL", async () => {
            const recipient = addr1.account.address;
            const agreementId = "urn:uuid:agreement-001";
            const assetId = "urn:asset:data-product-123";
            const providerId = "urn:connector:provider-abc";
            const consumerId = "urn:connector:consumer-xyz";
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const expiresAt = block.timestamp + BigInt(86400 * 365);

            const metadata = {
                name: `EDC Agreement #${agreementId}`,
                description: `Access token for asset ${assetId}`,
                image: FIXED_BADGE_URL,
                attributes: [
                    { trait_type: "Agreement ID", value: agreementId },
                    { trait_type: "Asset ID", value: assetId },
                    { trait_type: "Provider ID", value: providerId },
                    { trait_type: "Consumer ID", value: consumerId },
                    { trait_type: "Signed At", value: signedAt.toString() },
                ],
            };

            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            const txHash = await contract.write.mintAgreement([
                recipient,
                agreementId,
                assetId,
                providerId,
                consumerId,
                signedAt,
                expiresAt,
                tokenURI
            ]);

            await publicClient.waitForTransactionReceipt({ hash: txHash });

            const tokenOwner = await contract.read.ownerOf([0n]);
            assert.equal(tokenOwner.toLowerCase(), recipient.toLowerCase());

            const uri = await contract.read.tokenURI([0n]);
            assert.ok(uri.startsWith("data:application/json"));

            const base64Data = uri.split(",")[1];
            const decodedMetadata = JSON.parse(atob(base64Data));
            assert.equal(decodedMetadata.image, FIXED_BADGE_URL);
        });

        test('should mint multiple NFTs with same image URL', async () => {
            const createTokenURI = (agreementId: string, assetId: string) => {
                const metadata = {
                    name: `EDC Agreement #${agreementId}`,
                    description: `Access token for asset ${assetId}`,
                    image: FIXED_BADGE_URL, // Same image for all
                    attributes: [
                        { trait_type: 'Agreement ID', value: agreementId },
                        { trait_type: 'Asset ID', value: assetId },
                    ],
                };
                return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
            };

            // Mint 3 NFTs with same image
            for (let i = 0; i < 3; i++) {
                const agreementId = `urn:uuid:agreement-${i}`;
                const assetId = `urn:asset:asset-${i}`;
                const block = await publicClient.getBlock();
                const signedAt = block.timestamp;
                const tokenURI = createTokenURI(agreementId, assetId);

                await contract.write.mintAgreement([
                    addr1.account.address,
                    agreementId,
                    assetId,
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    tokenURI,
                ]);
            }

            const totalSupply = await contract.read.totalSupply();
            assert.ok(totalSupply >= 3n);
        });

        test('should work with different image URL formats', async () => {
            const imageUrls = [
                'https://example.com/badge.png',
                'https://cdn.example.com/nft/123.jpg',
                'https://i.imgur.com/abc123.png',
            ];

            for (let i = 0; i < imageUrls.length; i++) {
                const block = await publicClient.getBlock();
                const signedAt = block.timestamp;
                const metadata = {
                    name: `Test NFT ${i}`,
                    description: 'Test',
                    image: imageUrls[i],
                    attributes: [],
                };
                const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

                await contract.write.mintAgreement([
                    addr1.account.address,
                    `agreement-url-test-${i}`,
                    `asset-${i}`,
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    tokenURI,
                ]);
            }

            assert.ok(true, 'All different URL formats work');
        });
    });

    describe('Agreement Metadata Storage', () => {
        test('should store full agreement data on-chain', async () => {
            const agreementId = 'urn:uuid:metadata-test';
            const assetId = 'urn:asset:test-asset';
            const providerId = 'urn:connector:provider-test';
            const consumerId = 'urn:connector:consumer-test';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'Test Agreement',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await contract.write.mintAgreement([
                addr1.account.address,
                agreementId,
                assetId,
                providerId,
                consumerId,
                signedAt,
                0n,
                tokenURI,
            ]);

            await new Promise(resolve => setTimeout(resolve, 100));

            const tokenId = await contract.read.getTokenIdByAgreementId([agreementId]);
            const agreement = await contract.read.getAgreement([tokenId]);

            assert.equal(agreement.agreementId, agreementId);
            assert.equal(agreement.assetId, assetId);
            assert.equal(agreement.providerId, providerId);
            assert.equal(agreement.consumerId, consumerId);
            assert.equal(agreement.signedAt, signedAt);
        });
    });

    describe('Gas Measurements', () => {
        test('should measure gas for minting with data URI', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const agreement = {
                '@id': 'eb2f88d5-cd15-4b19-b1b2-75e92e8ed8be',
                'assetId': 'asset-3',
                'contractSigningDate': 1760534755,
                'consumerId': 'did:web:10.0.40.171%3A7083:consumer',
                'providerId': 'did:web:10.0.40.172%3A7083:provider',
            };

            const metadata = {
                name: `EDC Agreement #${agreement['@id'].split(':').pop() || agreement['@id']}`,
                description: `Access token for asset ${agreement.assetId} under negotiated policy.`,
                external_url: `http://localhost:5173/agreements/${agreement['@id']}`,
                image: FIXED_BADGE_URL,
                attributes: [
                    {
                        trait_type: 'Asset ID',
                        value: agreement.assetId,
                    },
                    {
                        trait_type: 'Agreement ID',
                        value: agreement['@id'],
                    },
                    {
                        trait_type: 'Signed At',
                        value: agreement.contractSigningDate,
                    },
                    {
                        trait_type: 'Provider ID',
                        value: agreement.providerId,
                    },
                    {
                        trait_type: 'Consumer ID',
                        value: agreement.consumerId,
                    },
                ],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            const txHash = await contract.write.mintAgreement([
                addr1.account.address,
                'gas-test-agreement',
                'gas-test-asset',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ]);

            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            console.log(`\n📊 Gas Usage (Full Storage + Data URI):`);
            console.log(`- Mint: ${receipt.gasUsed} gas`);
            console.log(`- Estimated cost @ 20 gwei: ~${(Number(receipt.gasUsed) * 20 * 3000 / 1e9).toFixed(4)} USD\n`);

            // Full storage version uses ~500k gas
            assert.ok(receipt.gasUsed < 1000000n, `Gas usage should be reasonable - Used gas ${receipt.gasUsed}`);
        });
    });

    describe('Revocation', () => {
        test('should revoke agreement', async () => {
            const agreementId = 'urn:uuid:revoke-test';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'Revoke Test',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await contract.write.mintAgreement([
                addr1.account.address,
                agreementId,
                'asset',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ]);

            const tokenId = await contract.read.getTokenIdByAgreementId([agreementId]);

            // Revoke
            const revokeHash = await contract.write.revokeAgreement([
                tokenId,
                'Testing revocation',
            ]);
            await publicClient.waitForTransactionReceipt({ hash: revokeHash });

            const agreement = await contract.read.getAgreement([tokenId]);
            assert.equal(agreement.isRevoked, true);
            assert.equal(agreement.revokeReason, 'Testing revocation');
        });
    });

    describe('Query Functions', () => {
        test('should query tokens by owner', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'Query Test',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await contract.write.mintAgreement([
                addr2.account.address,
                'query-test-1',
                'asset',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ]);

            await contract.write.mintAgreement([
                addr2.account.address,
                'query-test-2',
                'asset',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ]);

            const tokens = await contract.read.tokensOfOwner([addr2.account.address]);
            assert.ok(tokens.length >= 2, 'Should have at least 2 tokens');
        });

        test('should check agreement validity', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const expiresAt = block.timestamp + BigInt(3600); // expires in 1 hour
            const metadata = {
                name: 'Validity Test',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await contract.write.mintAgreement([
                addr1.account.address,
                'validity-test',
                'asset',
                'provider',
                'consumer',
                signedAt,
                expiresAt,
                tokenURI,
            ]);

            const tokenId = await contract.read.getTokenIdByAgreementId(['validity-test']);
            const isValid = await contract.read.isValidAgreement([tokenId]);

            assert.equal(isValid, true, 'Agreement should be valid');
        });
    });

    describe('Integration Test', () => {
        test('should complete full mint-to-revoke flow without IPFS', async () => {
            // 1. Create metadata with fixed URL
            const agreementId = 'urn:uuid:integration-test';
            const metadata = {
                name: 'EDC Agreement Integration Test',
                description: 'Full flow test without IPFS uploads',
                image: FIXED_BADGE_URL,
                external_url: 'https://example.com',
                attributes: [
                    { trait_type: 'Agreement ID', value: agreementId },
                    { trait_type: 'Asset ID', value: 'integration-asset' },
                    { trait_type: 'Status', value: 'Active' },
                ],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            // 2. Mint
            const mintHash = await contract.write.mintAgreement([
                addr1.account.address,
                agreementId,
                'integration-asset',
                'integration-provider',
                'integration-consumer',
                signedAt,
                0n,
                tokenURI,
            ]);
            await publicClient.waitForTransactionReceipt({ hash: mintHash });

            // 3. Verify mint
            const tokenId = await contract.read.getTokenIdByAgreementId([agreementId]);
            const owner = await contract.read.ownerOf([tokenId]);
            assert.equal(owner.toLowerCase(), addr1.account.address.toLowerCase());

            // 4. Check metadata
            const uri = await contract.read.tokenURI([tokenId]);
            assert.ok(uri.startsWith('data:application/json'));

            // 5. Verify on-chain data
            const agreement = await contract.read.getAgreement([tokenId]);
            assert.equal(agreement.agreementId, agreementId);
            assert.equal(agreement.isRevoked, false);

            // 6. Revoke
            const revokeHash = await contract.write.revokeAgreement([
                tokenId,
                'Integration test complete',
            ], { account: addr1.account });
            await publicClient.waitForTransactionReceipt({ hash: revokeHash });

            // 7. Verify revocation
            const revokedAgreement = await contract.read.getAgreement([tokenId]);
            assert.equal(revokedAgreement.isRevoked, true);

            console.log('\n✅ Integration test complete:');
            console.log(`- Minted NFT with fixed URL`);
            console.log(`- Metadata stored as data URI`);
            console.log(`- On-chain data verified`);
            console.log(`- Revocation successful`);
            console.log(`- No IPFS uploads required\n`);
        });
    });
});