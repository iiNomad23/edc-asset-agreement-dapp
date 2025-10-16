import type { HardhatUserConfig } from 'hardhat/config';
import { configVariable } from 'hardhat/config';

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
          viaIR: true,
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL_ALCHEMY"),
      accounts: [configVariable("ETH_PRIVATE_KEY_ACC1")],
    },
    mainnet: {
      type: "http",
      url: configVariable("MAINNET_RPC_URL_ALCHEMY"),
      accounts: [configVariable("ETH_PRIVATE_KEY_ACC1")],
      chainId: 1,
      chainType: "l1",
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
  },
  paths: {
    artifacts: './artifacts',
  },
};

export default config;
