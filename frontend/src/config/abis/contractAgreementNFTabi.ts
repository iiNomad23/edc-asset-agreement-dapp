import { Abi } from 'viem';

export const EDC_AGREEMENT_NFT_ABI: Abi = [
    {
        'inputs': [],
        'stateMutability': 'nonpayable',
        'type': 'constructor',
    },
    {
        'inputs': [],
        'name': 'AccessControlBadConfirmation',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            },
            {
                'internalType': 'bytes32',
                'name': 'neededRole',
                'type': 'bytes32',
            },
        ],
        'name': 'AccessControlUnauthorizedAccount',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'AgreementAlreadyExpired',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'AgreementAlreadyMinted',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'AgreementAlreadyRevoked',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'AgreementIdRequired',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'AssetIdRequired',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'sender',
                'type': 'address',
            },
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            },
            {
                'internalType': 'address',
                'name': 'owner',
                'type': 'address',
            },
        ],
        'name': 'ERC721IncorrectOwner',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address',
            },
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'ERC721InsufficientApproval',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'approver',
                'type': 'address',
            },
        ],
        'name': 'ERC721InvalidApprover',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address',
            }
        ],
        'name': 'ERC721InvalidOperator',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'owner',
                'type': 'address',
            }
        ],
        'name': 'ERC721InvalidOwner',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'receiver',
                'type': 'address',
            }
        ],
        'name': 'ERC721InvalidReceiver',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'sender',
                'type': 'address',
            }
        ],
        'name': 'ERC721InvalidSender',
        'type': 'error',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'ERC721NonexistentToken',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'InsufficientPayment',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'InvalidRecipientAddress',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'InvalidSigningTimestamp',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'NoFundsToWithdraw',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'NotAuthorizedToRevoke',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'ReentrancyGuardReentrantCall',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'TokenDoesNotExist',
        'type': 'error',
    },
    {
        'inputs': [],
        'name': 'TransferFailed',
        'type': 'error',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'agreementId',
                'type': 'string',
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'assetId',
                'type': 'string',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'minter',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'recipient',
                'type': 'address',
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'providerId',
                'type': 'string',
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'consumerId',
                'type': 'string',
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'signedAt',
                'type': 'uint256',
            }
        ],
        'name': 'AgreementMinted',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'agreementId',
                'type': 'string',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'revoker',
                'type': 'address',
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'revokedAt',
                'type': 'uint256',
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'reason',
                'type': 'string',
            },
        ],
        'name': 'AgreementRevoked',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'agreementId',
                'type': 'string',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'from',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'to',
                'type': 'address',
            }
        ],
        'name': 'AgreementTransferred',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'owner',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'approved',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'Approval',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'owner',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'operator',
                'type': 'address',
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'approved',
                'type': 'bool',
            }
        ],
        'name': 'ApprovalForAll',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': '_fromTokenId',
                'type': 'uint256',
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': '_toTokenId',
                'type': 'uint256',
            }
        ],
        'name': 'BatchMetadataUpdate',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'to',
                'type': 'address',
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256',
            }
        ],
        'name': 'FundsWithdrawn',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': '_tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'MetadataUpdate',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'oldPrice',
                'type': 'uint256',
            },
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'newPrice',
                'type': 'uint256',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'updater',
                'type': 'address',
            }
        ],
        'name': 'MintPriceUpdated',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            },
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'previousAdminRole',
                'type': 'bytes32',
            },
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'newAdminRole',
                'type': 'bytes32',
            }
        ],
        'name': 'RoleAdminChanged',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'sender',
                'type': 'address',
            }
        ],
        'name': 'RoleGranted',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'sender',
                'type': 'address',
            }
        ],
        'name': 'RoleRevoked',
        'type': 'event',
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'from',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'to',
                'type': 'address',
            },
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'Transfer',
        'type': 'event',
    },
    {
        'inputs': [],
        'name': 'DEFAULT_ADMIN_ROLE',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32',
            },
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [],
        'name': 'MINTER_ROLE',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'string',
                'name': '',
                'type': 'string',
            }
        ],
        'name': 'agreementIdToTokenId',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'name': 'agreements',
        'outputs': [
            {
                'internalType': 'string',
                'name': 'agreementId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'assetId',
                'type': 'string',
            },
            {
                'internalType': 'uint256',
                'name': 'signedAt',
                'type': 'uint256',
            },
            {
                'internalType': 'string',
                'name': 'providerId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'consumerId',
                'type': 'string',
            },
            {
                'internalType': 'uint256',
                'name': 'expiresAt',
                'type': 'uint256',
            },
            {
                'internalType': 'bool',
                'name': 'isRevoked',
                'type': 'bool',
            },
            {
                'internalType': 'uint256',
                'name': 'revokedAt',
                'type': 'uint256',
            },
            {
                'internalType': 'string',
                'name': 'revokeReason',
                'type': 'string',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'to',
                'type': 'address',
            },
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'approve',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'owner',
                'type': 'address',
            }
        ],
        'name': 'balanceOf',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'getAgreement',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'string',
                        'name': 'agreementId',
                        'type': 'string',
                    },
                    {
                        'internalType': 'string',
                        'name': 'assetId',
                        'type': 'string',
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'signedAt',
                        'type': 'uint256',
                    },
                    {
                        'internalType': 'string',
                        'name': 'providerId',
                        'type': 'string',
                    },
                    {
                        'internalType': 'string',
                        'name': 'consumerId',
                        'type': 'string',
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'expiresAt',
                        'type': 'uint256',
                    },
                    {
                        'internalType': 'bool',
                        'name': 'isRevoked',
                        'type': 'bool',
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'revokedAt',
                        'type': 'uint256',
                    },
                    {
                        'internalType': 'string',
                        'name': 'revokeReason',
                        'type': 'string',
                    }
                ],
                'internalType': 'struct EDCAgreementNFT.AgreementMetadata',
                'name': '',
                'type': 'tuple',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            },
        ],
        'name': 'getApproved',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address',
            },
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'owner',
                'type': 'address',
            },
        ],
        'name': 'getOwnedTokens',
        'outputs': [
            {
                'internalType': 'uint256[]',
                'name': '',
                'type': 'uint256[]',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            }
        ],
        'name': 'getRoleAdmin',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            }
        ],
        'name': 'grantMinterRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            },
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            }
        ],
        'name': 'grantRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            },
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            }
        ],
        'name': 'hasRole',
        'outputs': [
            {
                'internalType': 'bool',
                'name': '',
                'type': 'bool',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            }
        ],
        'name': 'isAdmin',
        'outputs': [
            {
                'internalType': 'bool',
                'name': '',
                'type': 'bool',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'owner',
                'type': 'address',
            },
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address',
            }
        ],
        'name': 'isApprovedForAll',
        'outputs': [
            {
                'internalType': 'bool',
                'name': '',
                'type': 'bool',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            },
        ],
        'name': 'isMinter',
        'outputs': [
            {
                'internalType': 'bool',
                'name': '',
                'type': 'bool',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'string',
                'name': 'agreementId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'assetId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'providerId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'consumerId',
                'type': 'string',
            },
            {
                'internalType': 'uint256',
                'name': 'signedAt',
                'type': 'uint256',
            },
            {
                'internalType': 'uint256',
                'name': 'expiresAt',
                'type': 'uint256',
            },
            {
                'internalType': 'string',
                'name': '_tokenURI',
                'type': 'string',
            }
        ],
        'name': 'mint',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'stateMutability': 'payable',
        'type': 'function',
    },
    {
        'inputs': [],
        'name': 'mintPrice',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [],
        'name': 'name',
        'outputs': [
            {
                'internalType': 'string',
                'name': '',
                'type': 'string',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address',
            },
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'name': 'ownedTokens',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'recipient',
                'type': 'address',
            },
            {
                'internalType': 'string',
                'name': 'agreementId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'assetId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'providerId',
                'type': 'string',
            },
            {
                'internalType': 'string',
                'name': 'consumerId',
                'type': 'string',
            },
            {
                'internalType': 'uint256',
                'name': 'signedAt',
                'type': 'uint256',
            },
            {
                'internalType': 'uint256',
                'name': 'expiresAt',
                'type': 'uint256',
            },
            {
                'internalType': 'string',
                'name': '_tokenURI',
                'type': 'string',
            },
        ],
        'name': 'ownerMint',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'ownerOf',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            },
            {
                'internalType': 'address',
                'name': 'callerConfirmation',
                'type': 'address',
            }
        ],
        'name': 'renounceRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            },
            {
                'internalType': 'string',
                'name': 'reason',
                'type': 'string',
            }
        ],
        'name': 'revokeAgreement',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            }
        ],
        'name': 'revokeMinterRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32',
            },
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address',
            }
        ],
        'name': 'revokeRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'from',
                'type': 'address',
            },
            {
                'internalType': 'address',
                'name': 'to',
                'type': 'address',
            },
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'safeTransferFrom',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'from',
                'type': 'address',
            },
            {
                'internalType': 'address',
                'name': 'to',
                'type': 'address',
            },
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            },
            {
                'internalType': 'bytes',
                'name': 'data',
                'type': 'bytes',
            }
        ],
        'name': 'safeTransferFrom',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address',
            },
            {
                'internalType': 'bool',
                'name': 'approved',
                'type': 'bool',
            }
        ],
        'name': 'setApprovalForAll',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'bytes4',
                'name': 'interfaceId',
                'type': 'bytes4',
            },
        ],
        'name': 'supportsInterface',
        'outputs': [
            {
                'internalType': 'bool',
                'name': '',
                'type': 'bool',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [],
        'name': 'symbol',
        'outputs': [
            {
                'internalType': 'string',
                'name': '',
                'type': 'string',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'tokenURI',
        'outputs': [
            {
                'internalType': 'string',
                'name': '',
                'type': 'string',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [],
        'name': 'totalSupply',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256',
            }
        ],
        'stateMutability': 'view',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'from',
                'type': 'address',
            },
            {
                'internalType': 'address',
                'name': 'to',
                'type': 'address',
            },
            {
                'internalType': 'uint256',
                'name': 'tokenId',
                'type': 'uint256',
            }
        ],
        'name': 'transferFrom',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'newPrice',
                'type': 'uint256',
            }
        ],
        'name': 'updateMintPrice',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    },
    {
        'inputs': [],
        'name': 'withdraw',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function',
    }
] as const;