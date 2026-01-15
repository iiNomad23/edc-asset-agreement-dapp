# EDC Agreement NFT

This is a [Hardhat](https://hardhat.org/) project implementing a smart contract for NFT-based agreements and tests using [viem](https://viem.sh/) and `node:test`.

## Features

- ERC-721 agreement NFTs with on-chain metadata
- Admin/minter roles (AccessControl)
- Admin mint and paid minter mint (default 0 ETH)
- Enforces unique agreement IDs
- Agreement revocation with reason
- Read helpers (agreement metadata, owned token IDs)
- Admin only functions (price update, role management, withdraw)

## Prerequisites

- Node v22.19 or higher
