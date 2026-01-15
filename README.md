# EDC asset agreement DApp

This repository contains a Decentralized Application (DApp) that demonstrates how to interact with the 
Eclipse Dataspace Components (EDC) to request access to data assets which require agreement NFTs.

This project was created as part of the following Master's thesis:
- [Building Inter-Organizational Trust: Integrating Blockchain for Transparent and Traceable Contract Agreements in Dataspaces](https://github.com/iiNomad23/FHV_MasterThesis)

## Overview

The DApp allows users to connect their Ethereum wallet, view available data assets, mint agreement NFTs, and request data access by
signing a data request message with the connected Ethereum wallet.  

The DApp interacts with the EDC management API to create contract agreements.  
It then allows the user to mint the associated NFT and retrieve the asset data via the provider's public data plane API.

### Projects

The DApp consists of three main projects:

- **[Smart Contracts](./smart-contracts)**: A Hardhat project implementing the NFT-based agreement smart contract.
- **[Backend](./backend)**: A Node.js Fastify server for EDC API interactions and NFT verification.
- **[Frontend](./frontend)**: A React application built with Vite, Wagmi and RainbowKit for Web3 integration.

Additionally, the repository contains helper scripts for deploying the DApp in the [deployment](./deployment) folder.

## Prerequisites

A Minimum Viable Dataspace (MVD) with the following repositories as consumer and provider:

- [MVD Consumer](https://github.com/iiNomad23/mvd-consumer)
- [MVD Provider](https://github.com/iiNomad23/mvd-provider)
