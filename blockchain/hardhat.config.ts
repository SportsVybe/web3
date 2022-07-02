import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers"
import { HardhatUserConfig } from "hardhat/config";
require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.7",
    settings:{
      optimizer:{
        enabled: true,
        runs:200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks:{
    hardhat:{
      chainId: 31337
    },
    localhost:{
      chainId: 31337
    }
  },
  namedAccounts:{
    deployer:{
      default: 0
    }
  }
};

export default config;
// module.exports = {
//   solidity: "0.8.7",
//   settings:{
//     optimizer:{
//       enable: true,
//       runs:100
//     }
//   }
// };
