import { before, describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { network } from 'hardhat';

describe('EDCAgreementNFT', () => {
    let contract: any;
    let owner: any;
    let addr1: any;
    let addr2: any;
    let publicClient: any;

    // Same image for all NFTs
    const FIXED_BADGE_URL = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop';
    const HTTP_IPFS_METADATA_URI = 'https://ipfs.io/ipfs/QmTestMetadataHash123456789';

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
            assert.equal(symbol, 'EDC_AGR');
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

            const tokenOwner = await contract.read.ownerOf([1n]);
            assert.equal(tokenOwner.toLowerCase(), recipient.toLowerCase());

            const uri = await contract.read.tokenURI([1n]);
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
                    image: FIXED_BADGE_URL,
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
            const agreement = {
                "@type": "ContractAgreement",
                "@id": "eb2f88d5-cd15-4b19-b1b2-75e92e8ed8be",
                "assetId": "asset-3",
                "policy": {
                    "@id": "820ae012-e76b-48c7-a11a-0b27cc3b0fef",
                    "@type": "odrl:Agreement",
                    "odrl:permission": [],
                    "odrl:prohibition": [],
                    "odrl:obligation": {
                        "odrl:action": {
                            "@id": "odrl:use"
                        },
                        "odrl:constraint": {
                            "odrl:leftOperand": {
                                "@id": "DataAccess.level"
                            },
                            "odrl:operator": {
                                "@id": "odrl:eq"
                            },
                            "odrl:rightOperand": "processing"
                        }
                    },
                    "odrl:assignee": "did:web:10.0.40.171%3A7083:consumer",
                    "odrl:assigner": "did:web:10.0.40.172%3A7083:provider",
                    "odrl:target": {
                        "@id": "asset-3"
                    }
                },
                "contractSigningDate": 1760534755,
                "consumerId": "did:web:10.0.40.171%3A7083:consumer",
                "providerId": "did:web:10.0.40.172%3A7083:provider",
                "@context": {
                    "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
                    "edc": "https://w3id.org/edc/v0.0.1/ns/",
                    "odrl": "http://www.w3.org/ns/odrl/2/"
                }
            };

            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            const metadata = {
                name: `EDC Agreement #${agreement['@id']}`,
                description: `Access token for asset ${agreement.assetId} under negotiated policy.`,
                external_url: `http://localhost:5173/agreements/${agreement['@id']}`,
                image: FIXED_BADGE_URL,
                attributes: [
                    {
                        trait_type: 'Agreement ID',
                        value: agreement['@id'],
                    },
                    {
                        trait_type: 'Asset ID',
                        value: agreement.assetId,
                    },
                    {
                        trait_type: 'Provider ID',
                        value: agreement.providerId,
                    },
                    {
                        trait_type: 'Consumer ID',
                        value: agreement.consumerId,
                    },
                    {
                        trait_type: 'Signed At',
                        value: agreement.contractSigningDate,
                    },
                ],
                full_agreement: agreement,
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            const txHash = await contract.write.mintAgreement([
                addr1.account.address,
                agreement['@id'],
                agreement.assetId,
                agreement.providerId,
                agreement.consumerId,
                signedAt,
                0n,
                tokenURI,
            ]);

            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            console.log(`\n📊 Gas Usage (Full Storage + Data URI):`);
            console.log(`- Mint: ${receipt.gasUsed} gas`);
            console.log(`- Estimated cost @ 20 gwei: ~${(Number(receipt.gasUsed) * 20 * 3000 / 1e9).toFixed(4)} USD\n`);

            // Full storage version uses ~2M gas
            assert.ok(receipt.gasUsed < 2000000n, `Gas usage should be lower than 2M - Used gas ${receipt.gasUsed}`);
        });

        test('should use less gas than base64 version', async () => {
            const agreement = {
                '@id': 'eb2f88d5-cd15-4b19-b1b2-75e92e8ed8bf',
                'assetId': 'asset-3',
                'contractSigningDate': 1760534755,
                'consumerId': 'did:web:10.0.40.171%3A7083:consumer',
                'providerId': 'did:web:10.0.40.172%3A7083:provider',
            };
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            const txHash = await contract.write.mintAgreement([
                addr1.account.address,
                agreement['@id'],
                agreement.assetId,
                agreement.providerId,
                agreement.consumerId,
                signedAt,
                0n,
                HTTP_IPFS_METADATA_URI,
            ]);

            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            console.log(`\n📊 Gas Usage (IPFS URI):`);
            console.log(`- Mint: ${receipt.gasUsed} gas`);
            console.log(`- Estimated cost @ 20 gwei: ~${(Number(receipt.gasUsed) * 20 * 3000 / 1e9).toFixed(4)} USD`);
            console.log(`- Savings vs Base64: ~${((2000000 - Number(receipt.gasUsed)) / 2000000 * 100).toFixed(1)}%\n`);

            // IPFS version should use significantly less gas than base64 version (~2M gas)
            assert.ok(receipt.gasUsed < 500000n, `IPFS version should use less gas - Used: ${receipt.gasUsed}`);
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

    describe('Custom Errors', () => {
        test('should revert if recipient is zero address', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await assert.rejects(
                contract.write.mintAgreement([
                    '0x0000000000000000000000000000000000000000',
                    'urn:uuid:zero-address',
                    'urn:asset:test',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Zero Address"}',
                ]),
                /InvalidRecipientAddress/
            );
        });

        test('should revert if agreementId is empty', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await assert.rejects(
                contract.write.mintAgreement([
                    addr1.account.address,
                    '',
                    'urn:asset:test',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Empty AgreementId"}',
                ]),
                /AgreementIdRequired/
            );
        });

        test('should revert if assetId is empty', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await assert.rejects(
                contract.write.mintAgreement([
                    addr1.account.address,
                    'urn:uuid:missing-asset',
                    '',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Empty AssetId"}',
                ]),
                /AssetIdRequired/
            );
        });

        test('should revert if agreement already minted', async () => {
            const agreementId = 'urn:uuid:duplicate';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            // first mint should succeed
            await contract.write.mintAgreement([
                addr1.account.address,
                agreementId,
                'urn:asset:test',
                'provider',
                'consumer',
                signedAt,
                0n,
                'data:application/json;utf8,{"name":"Duplicate Test"}',
            ]);

            // second mint with same agreementId should fail
            await assert.rejects(
                contract.write.mintAgreement([
                    addr1.account.address,
                    agreementId,
                    'urn:asset:test2',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Duplicate Test 2"}',
                ]),
                /AgreementAlreadyMinted/
            );
        });

        test('should revert if signedAt is in the future', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp + 1000n;

            await assert.rejects(
                contract.write.mintAgreement([
                    addr1.account.address,
                    'urn:uuid:future-time',
                    'urn:asset:test',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Future Time"}',
                ]),
                /InvalidSigningTimestamp/
            );
        });

        test('should revert when getting nonexistent token', async () => {
            await assert.rejects(
                contract.read.getAgreement([9999n]),
                /TokenDoesNotExist/
            );
        });

        test('should revert when agreement not found', async () => {
            await assert.rejects(
                contract.read.getTokenIdByAgreementId(['urn:uuid:does-not-exist']),
                /AgreementNotFound/
            );
        });

        test('should revert if non-owner tries to revoke', async () => {
            const agreementId = 'urn:uuid:not-owner';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await contract.write.mintAgreement([
                addr1.account.address,
                agreementId,
                'urn:asset:test',
                'provider',
                'consumer',
                signedAt,
                0n,
                'data:application/json;utf8,{"name":"Unauthorized Revoke"}',
            ]);

            const tokenId = await contract.read.getTokenIdByAgreementId([agreementId]);

            await assert.rejects(
                contract.write.revokeAgreement([tokenId, 'Not authorized'], { account: addr2.account }),
                /NotAuthorizedToRevoke/
            );
        });

        test('should revert if already revoked', async () => {
            const agreementId = 'urn:uuid:already-revoked';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await contract.write.mintAgreement([
                addr1.account.address,
                agreementId,
                'urn:asset:test',
                'provider',
                'consumer',
                signedAt,
                0n,
                'data:application/json;utf8,{"name":"Already Revoked"}',
            ]);

            const tokenId = await contract.read.getTokenIdByAgreementId([agreementId]);

            await contract.write.revokeAgreement([tokenId, 'First revoke'], { account: addr1.account });

            await assert.rejects(
                contract.write.revokeAgreement([tokenId, 'Second revoke'], { account: addr1.account }),
                /AgreementAlreadyRevoked/
            );
        });

        test('should revert if revoking nonexistent token', async () => {
            await assert.rejects(
                contract.write.revokeAgreement([12345n, 'No token']),
                /TokenDoesNotExist/
            );
        });
    });
});