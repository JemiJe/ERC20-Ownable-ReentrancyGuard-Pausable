import { ethers } from "hardhat";
import * as dotenv from "dotenv";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    const feeWallet = deployer.address;
    console.log("Fee wallet:", feeWallet);

    // Fetch current fee data
    const feeData = await ethers.provider.getFeeData();
    console.log("Fee data:", feeData);

    // Set EIP-1559 gas parameters
    const maxPriorityFeePerGas = ethers.parseUnits("5", "gwei");
    const maxFeePerGas = ethers.parseUnits("200", "gwei");
    console.log("Max priority fee:", ethers.formatUnits(maxPriorityFeePerGas, "gwei"), "gwei");
    console.log("Max fee:", ethers.formatUnits(maxFeePerGas, "gwei"), "gwei");

    const SkillTestToken = await ethers.getContractFactory("SkillTestToken");
    console.log("Contract factory created");

    // Estimate gas
    let gasEstimate;
    try {
    console.log("Estimating gas with high limit...");
    const deploymentData = SkillTestToken.getDeployTransaction(feeWallet, {
        maxFeePerGas,
        maxPriorityFeePerGas,
    });
    gasEstimate = await ethers.provider.estimateGas({
        ...deploymentData,
        gasLimit: 5000000,
    });
    console.log("Estimated gas:", gasEstimate.toString());

    const estimatedCost = gasEstimate * maxFeePerGas;
    console.log("Estimated cost:", ethers.formatEther(estimatedCost), "ETH");
    } catch (error) {
    console.warn("Gas estimation failed:", error);
    gasEstimate = BigInt(4000000); // Fallback
    console.log("Falling back to default gas estimate:", gasEstimate.toString());
    }

    // Validate gas estimate
    const minGasForDeployment = BigInt(1500000); // Minimum for ERC-20 deployment
    if (gasEstimate < minGasForDeployment) {
    console.warn("Gas estimate too low for contract deployment, overriding...");
    gasEstimate = BigInt(4000000);
    }

    const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // 20% buffer
    console.log("Gas limit with 20% buffer:", gasLimit.toString());

    console.log("Attempting to deploy contract...");
    const deployTx = SkillTestToken.deploy(feeWallet, {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    });

    const token = await deployTx;
    const txHash = token.deploymentTransaction()?.hash;
    console.log("Transaction sent, hash:", txHash);

    console.log("Waiting for deployment confirmation...");
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("SkillTestToken deployed to:", tokenAddress);

console.log(`
    run this in terminal to verify the contract on etherscan:
    npx hardhat verify --network sepolia ${tokenAddress} "${feeWallet}"
`);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});