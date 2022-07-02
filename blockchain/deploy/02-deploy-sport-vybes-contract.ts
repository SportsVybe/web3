import {HardhatRuntimeEnvironment} from "hardhat/types"
import {DeployFunction} from "hardhat-deploy/types"
import { ethers } from "hardhat"

const sportsVybe: DeployFunction = async(hre: HardhatRuntimeEnvironment ) => {
   const {deployments, getNamedAccounts, network} = hre
   const {deployer} = await getNamedAccounts()
   const {deploy, log} = deployments


   const sportsVybeToken = await ethers.getContract("SportsVybeToken")

   log("Deploying Sports Vybe Contract!")
   const sportVybeContract = await deploy("SportsVybe",{
       from: deployer,
       args:[sportsVybeToken.address],
       log: true,
       //waitConfirmations: 3 /* Use in production dApp */
   })

   log(`02 - Deployed Sport Vybes Contract at ${sportVybeContract.address}`);

}

export default sportsVybe
sportsVybe.tags = ["all","sportsVybe"]
