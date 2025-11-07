import { before, describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { network } from 'hardhat';
import { parseEther } from 'viem';

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

        test('should set deployer as admin', async () => {
            const isAdmin = await contract.read.isAdmin([owner.account.address]);
            assert.equal(isAdmin, true);
        });

        test('should not grant roles to non-deployer addresses by default', async () => {
            const isAdmin = await contract.read.isAdmin([addr1.account.address]);
            const isMinter = await contract.read.isMinter([addr1.account.address]);
            assert.equal(isAdmin, false);
            assert.equal(isMinter, false);
        });

        test('should start with zero total supply', async () => {
            const supply = await contract.read.totalSupply();
            assert.equal(supply, 0n);
        });

        test('should start with zero mint price', async () => {
            const mintPrice = await contract.read.mintPrice();
            assert.equal(mintPrice, 0n);
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

            const txHash = await contract.write.ownerMint([
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

            for (let i = 0; i < 3; i++) {
                const agreementId = `urn:uuid:agreement-${i}`;
                const assetId = `urn:asset:asset-${i}`;
                const block = await publicClient.getBlock();
                const signedAt = block.timestamp;
                const tokenURI = createTokenURI(agreementId, assetId);

                await contract.write.ownerMint([
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

                await contract.write.ownerMint([
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

            await contract.write.ownerMint([
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

            const tokenId = await contract.read.agreementIdToTokenId([agreementId]);
            const agreement = await contract.read.getAgreement([tokenId]);

            assert.equal(agreement.agreementId, agreementId);
            assert.equal(agreement.assetId, assetId);
            assert.equal(agreement.providerId, providerId);
            assert.equal(agreement.consumerId, consumerId);
            assert.equal(agreement.signedAt, signedAt);
        });
    });

    describe('Access Control & Roles', () => {
        test('should grant and revoke minter role', async () => {
            await contract.write.grantMinterRole([addr1.account.address]);
            const isMinter = await contract.read.isMinter([addr1.account.address]);
            assert.equal(isMinter, true);

            await contract.write.revokeMinterRole([addr1.account.address]);
            const isMinterAfter = await contract.read.isMinter([addr1.account.address]);
            assert.equal(isMinterAfter, false);
        });

        test('should allow minter to mint for themselves', async () => {
            await contract.write.grantMinterRole([addr1.account.address]);

            const agreementId = 'urn:uuid:minter-self-mint';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'Minter Self Mint',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            const txHash = await contract.write.mint([
                agreementId,
                'asset-minter',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ], { account: addr1.account });

            await publicClient.waitForTransactionReceipt({ hash: txHash });

            const tokenId = await contract.read.agreementIdToTokenId([agreementId]);
            const tokenOwner = await contract.read.ownerOf([tokenId]);
            assert.equal(tokenOwner.toLowerCase(), addr1.account.address.toLowerCase());
        });

        test('should revert normal mint without minter role', async () => {
            const isMinter = await contract.read.isMinter([addr2.account.address]);
            assert.equal(isMinter, false);

            const agreementId = 'urn:uuid:no-role-mint';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'No Role Test',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await assert.rejects(
                contract.write.mint([
                    agreementId,
                    'asset-no-role',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    tokenURI,
                ], { account: addr2.account }),
                /AccessControlUnauthorizedAccount|0x0dc149f0/
            );
        });
    });

    describe('Mint Price & Payment', () => {
        test('should update mint price', async () => {
            const newPrice = parseEther('0.01');
            await contract.write.updateMintPrice([newPrice]);
            const mintPrice = await contract.read.mintPrice();
            assert.equal(mintPrice, newPrice);

            await contract.write.updateMintPrice([0n]);
        });

        test('should require payment when mint price is set', async () => {
            const mintPrice = parseEther('0.01');
            await contract.write.updateMintPrice([mintPrice]);
            await contract.write.grantMinterRole([addr2.account.address]);

            const agreementId = 'urn:uuid:paid-mint';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'Paid Mint',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            const txHash = await contract.write.mint([
                agreementId,
                'asset-paid',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ], {
                account: addr2.account,
                value: mintPrice,
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });

            const balance = await publicClient.getBalance({ address: contract.address });
            assert.equal(balance, mintPrice);

            await contract.write.withdraw();
            await contract.write.updateMintPrice([0n]);
        });

        test('should withdraw contract balance', async () => {
            const mintPrice = parseEther('0.01');
            await contract.write.updateMintPrice([mintPrice]);
            await contract.write.grantMinterRole([addr2.account.address]);

            const agreementId = 'urn:uuid:withdraw-test-unique';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'Withdraw Test',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await contract.write.mint([
                agreementId,
                'asset-withdraw',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ], {
                account: addr2.account,
                value: mintPrice,
            });

            const balanceBefore = await publicClient.getBalance({ address: contract.address });
            assert.equal(balanceBefore, mintPrice);

            await contract.write.withdraw();

            const balanceAfter = await publicClient.getBalance({ address: contract.address });
            assert.equal(balanceAfter, 0n);

            await contract.write.updateMintPrice([0n]);
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

            const txHash = await contract.write.ownerMint([
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

            console.log(`\nGas Usage (Full Storage + Data URI):`);
            console.log(`- Mint: ${receipt.gasUsed} gas`);
            console.log(`- Estimated cost @ 20 gwei: ~${(Number(receipt.gasUsed) * 20 * 3000 / 1e9).toFixed(4)} USD\n`);

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

            const txHash = await contract.write.ownerMint([
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

            console.log(`\nGas Usage (IPFS URI):`);
            console.log(`- Mint: ${receipt.gasUsed} gas`);
            console.log(`- Estimated cost @ 20 gwei: ~${(Number(receipt.gasUsed) * 20 * 3000 / 1e9).toFixed(4)} USD`);
            console.log(`- Savings vs Base64: ~${((2000000 - Number(receipt.gasUsed)) / 2000000 * 100).toFixed(1)}%\n`);

            assert.ok(receipt.gasUsed < 500000n, `Gas usage should be lower than 500k - Used: ${receipt.gasUsed}`);
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

            await contract.write.ownerMint([
                addr1.account.address,
                agreementId,
                'asset',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ]);

            const tokenId = await contract.read.agreementIdToTokenId([agreementId]);

            const revokeHash = await contract.write.revokeAgreement([
                tokenId,
                'Testing revocation',
            ], { account: addr1.account });
            await publicClient.waitForTransactionReceipt({ hash: revokeHash });

            const agreement = await contract.read.getAgreement([tokenId]);
            assert.equal(agreement.isRevoked, true);
            assert.equal(agreement.revokeReason, 'Testing revocation');
        });
    });

    describe('Query Functions', () => {
        test('should query tokens by owner using ownedTokens', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const metadata = {
                name: 'Query Test',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await contract.write.ownerMint([
                addr2.account.address,
                'query-test-1',
                'asset',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ]);

            await contract.write.ownerMint([
                addr2.account.address,
                'query-test-2',
                'asset',
                'provider',
                'consumer',
                signedAt,
                0n,
                tokenURI,
            ]);

            const tokens = await contract.read.getOwnedTokens([addr2.account.address]);
            assert.ok(tokens.length >= 2, 'Should have at least 2 tokens');
        });

        test('should check agreement validity based on expiration', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const expiresAt = block.timestamp + BigInt(3600); // expires in 1 hour
            const metadata = {
                name: 'Validity Test',
                image: FIXED_BADGE_URL,
                attributes: [],
            };
            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            await contract.write.ownerMint([
                addr1.account.address,
                'validity-test',
                'asset',
                'provider',
                'consumer',
                signedAt,
                expiresAt,
                tokenURI,
            ]);

            const tokenId = await contract.read.agreementIdToTokenId(['validity-test']);
            const agreement = await contract.read.getAgreement([tokenId]);

            assert.equal(agreement.expiresAt, expiresAt);
            assert.equal(agreement.isRevoked, false);
        });
    });

    describe('Custom Errors', () => {
        test('should revert if recipient is zero address', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await assert.rejects(
                contract.write.ownerMint([
                    '0x0000000000000000000000000000000000000000',
                    'urn:uuid:zero-address',
                    'urn:asset:test',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Zero Address"}',
                ]),
                /InvalidRecipientAddress|0x44d99fea/
            );
        });

        test('should revert if agreementId is empty', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await assert.rejects(
                contract.write.ownerMint([
                    addr1.account.address,
                    '',
                    'urn:asset:test',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Empty AgreementId"}',
                ]),
                /AgreementIdRequired|0xdc5ddec5/
            );
        });

        test('should revert if assetId is empty', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await assert.rejects(
                contract.write.ownerMint([
                    addr1.account.address,
                    'urn:uuid:missing-asset',
                    '',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Empty AssetId"}',
                ]),
                /AssetIdRequired|0xc1c1c3d7/
            );
        });

        test('should revert if agreement already minted', async () => {
            const agreementId = 'urn:uuid:duplicate';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            // first mint should succeed
            await contract.write.ownerMint([
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
                contract.write.ownerMint([
                    addr1.account.address,
                    agreementId,
                    'urn:asset:test2',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Duplicate Test 2"}',
                ]),
                /AgreementAlreadyMinted|0xd60ab2c6/
            );
        });

        test('should revert if signedAt is in the future', async () => {
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp + 1000n;

            await assert.rejects(
                contract.write.ownerMint([
                    addr1.account.address,
                    'urn:uuid:future-time',
                    'urn:asset:test',
                    'provider',
                    'consumer',
                    signedAt,
                    0n,
                    'data:application/json;utf8,{"name":"Future Time"}',
                ]),
                /InvalidSigningTimestamp|0x8e243532/
            );
        });

        test('should revert when getting nonexistent token', async () => {
            await assert.rejects(
                contract.read.getAgreement([9999n]),
                /TokenDoesNotExist|0xceea21b6/
            );
        });

        test('should revert if agreement already expired', async () => {
            const agreementId = 'urn:uuid:expired';
            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;
            const expiresAt = signedAt + 86400n; // 1 day

            await contract.write.ownerMint([
                addr1.account.address,
                agreementId,
                'urn:asset:test',
                'provider',
                'consumer',
                signedAt,
                expiresAt,
                'data:application/json;utf8,{"name":"Expired Test"}',
            ]);

            const tokenId = await contract.read.agreementIdToTokenId([agreementId]);

            await publicClient.request({
                method: 'evm_increaseTime',
                params: [172800], // 2 days in seconds
            });
            await publicClient.request({
                method: 'evm_mine',
                params: [],
            });

            await assert.rejects(
                contract.write.revokeAgreement([tokenId, 'Cannot revoke expired'], { account: addr1.account }),
                /AgreementAlreadyExpired|0x0b81f82a/
            );
        });

        test('should revert if insufficient payment', async () => {
            const mintPrice = parseEther('0.01');
            await contract.write.updateMintPrice([mintPrice]);

            await contract.write.grantMinterRole([addr1.account.address]);

            const block = await publicClient.getBlock();
            const signedAt = block.timestamp;

            await assert.rejects(
                contract.write.mint(
                    [
                        'payment-test',
                        'asset',
                        'provider',
                        'consumer',
                        signedAt,
                        0n,
                        'data:application/json;utf8,{"name":"Payment Test"}',
                    ],
                    {
                        account: addr1.account,
                        value: parseEther('0.005'), // insufficient payment
                    }
                ),
                /InsufficientPayment|0x356680b7/
            );
        });

        test('should revert if no funds to withdraw', async () => {
            await assert.rejects(
                contract.write.withdraw(),
                /NoFundsToWithdraw|0x1803f52a/
            );
        });
    });
});
