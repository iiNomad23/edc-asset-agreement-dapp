import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule("EDCAgreementNFTModule", (m) => {
    const edcAgreementNFT = m.contract("EDCAgreementNFT");

    return { edcAgreementNFT };
});
