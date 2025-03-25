import { ethers } from "hardhat";
import * as dotenv from "dotenv";

async function main() {
  const [deployer] = await ethers.getSigners();
  const feeWallet = process.env.FEE_ADDRESS;

  if(!feeWallet) {
    throw new Error("FEE_ADDRESS is not set in .env file");
  }

  console.log("Deploying with account:", deployer.address);

  const SkillTestToken = await ethers.getContractFactory("SkillTestToken");
  const token = await SkillTestToken.deploy(feeWallet);

  console.log("Deploying SkillTestToken...");

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  
  console.log("-".repeat(30));
  console.log("SkillTestToken deployed to:", tokenAddress);

  console.log(`
    run this in terminal to verify the contract on etherscan:
    npx hardhat verify --network sepolia ${tokenAddress} "${feeWallet}"
  `);
  console.log("-".repeat(30));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });