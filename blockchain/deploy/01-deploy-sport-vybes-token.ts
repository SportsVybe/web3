import {HardhatRuntimeEnvironment} from "hardhat/types"
import {DeployFunction} from "hardhat-deploy/types"

const deployToken: DeployFunction = async(hre: HardhatRuntimeEnvironment ) => {
   const {deployments, getNamedAccounts, network} = hre
   const {deployer} = await getNamedAccounts()
   const {deploy, log} = deployments

   log("Deploying Sport Vybes Token!")
   const token = await deploy("SportsVybeToken",{
       from: deployer,
       args:[],
       log: true,
       //waitConfirmations: 3 /* Use in production dApp */
   })

   log(`01 - Deployed Sport Vybes Token at ${token.address}`);

}

export default deployToken
deployToken.tags = ["all","token"]
