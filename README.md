# EDC asset agreement DApp

This repository contains a Decentralized Application (DApp) that demonstrates how to interact with the 
Eclipse Dataspace Components (EDC) to request access to data assets which require agreement NFTs.

This project was created as part of the following Master's thesis:
- [Building Inter-Organizational Trust: Integrating Blockchain for Transparent and Traceable Contract Agreements in Dataspaces](https://github.com/iiNomad23/FHV_MasterThesis)

## Overview
The DApp allows users to connect their Ethereum wallet, view available data assets, mint agreement NFTs, and request data access by
signing a data request message with the connected Ethereum wallet.  

The DApp interacts with the EDC's management API to create contract agreements.  
After that, the DApp allows the user to mint the NFT associated with the contract agreement and fetch the asset data via the providers public dataplane API.

## Prerequisites
A Minimum Viable Dataspace (MVD) with the following repositories as consumer and provider:
- [MVD Provider](https://github.com/iiNomad23/mvd-provider)
- [MVD Consumer](https://github.com/iiNomad23/mvd-consumer)
