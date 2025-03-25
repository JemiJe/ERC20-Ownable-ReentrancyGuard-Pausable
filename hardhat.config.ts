import { HardhatUserConfig, task, types } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const CONTRACT_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS || "0xDc6850463AdC192D34505c1d1261ab6BBFa311eb";

task("interact", "Interacts with the SkillTestToken contract")
  .addParam("command", "The command to run")
  // .addOptionalVariadicPositionalParam("args", "Arguments for the command")
  .addVariadicPositionalParam("args", "Arguments for the command", [], types.string)
  .setAction(async ({ command, args }, hre) => {
    const { ethers } = hre;
    const [signer] = await ethers.getSigners();
    const skillTestToken = await ethers.getContractAt("SkillTestToken", CONTRACT_ADDRESS, signer);

    console.log("-".repeat(50));
    console.log("SkillTestToken Interaction");
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Using account:", signer.address);
    console.log("Executing command:", command);
    console.log("Arguments:", args);
    console.log("-".repeat(50));

    switch (command) {
      case "total-supply":
        await getTotalSupply(skillTestToken, ethers);
        break;
      case "balance":
        await getBalance(skillTestToken, args, ethers);
        break;
      case "transfer":
        await transfer(skillTestToken, args, ethers);
        break;
      case "blacklist":
        await setBlacklist(skillTestToken, args);
        break;
      case "pause":
        await setPause(skillTestToken, args);
        break;
      default:
        console.log("Invalid command. Available commands:");
        console.log("  npx hardhat interact --command total-supply --network sepolia");
        console.log("  npx hardhat interact --command balance [address] --network sepolia");
        console.log("  npx hardhat interact --command transfer [recipientAddress] [amount] --network sepolia");
        console.log("  npx hardhat interact --command blacklist [address] [true|false] --network sepolia");
        console.log("  npx hardhat interact --command pause [true|false] --network sepolia");
    }
  });

async function getTotalSupply(contract: any, ethers: any) {
  const totalSupply = await contract.totalSupply();
  console.log("Total Supply:", ethers.formatEther(totalSupply), "STT");
}

async function getBalance(contract: any, args: string[], ethers: any) {
  if (args.length !== 1) {
    console.log("Usage: npx hardhat interact --command balance --args [address] --network sepolia");
    return;
  }
  const address = args[0];
  const balance = await contract.balanceOf(address);
  console.log(`Balance of ${address}:`, ethers.formatEther(balance), "STT");
}

async function transfer(contract: any, args: string[], ethers: any) {
  if (args.length !== 2) {
    console.log("Usage: npx hardhat interact --command transfer --args [recipientAddress] [amount] --network sepolia");
    return;
  }
  const recipient = args[0];
  const amount = ethers.parseEther(args[1]);
  console.log(`Transferring ${ethers.formatEther(amount)} STT to ${recipient}...`);
  const tx = await contract.transfer(recipient, amount);
  console.log("Transaction sent, hash:", tx.hash);
  await tx.wait();
  console.log("Transfer completed");
}

async function setBlacklist(contract: any, args: string[]) {
  if (args.length !== 2 || (args[1] !== "true" && args[1] !== "false")) {
    console.log("Usage: npx hardhat interact --command blacklist --args [address] [true|false] --network sepolia");
    return;
  }
  const address = args[0];
  const blacklist = args[1] === "true";
  console.log(`${blacklist ? "Blacklisting" : "Unblacklisting"} ${address}...`);
  let tx;
  if(args[1] === "true") {
    tx = await contract.blacklistAddress(address);
  } else {
    tx = await contract.unblacklistAddress(address);
  }
  console.log("Transaction sent, hash:", tx.hash);
  await tx.wait();
  console.log(`Address ${address} ${blacklist ? "blacklisted" : "unblacklisted"}`);
}

async function setPause(contract: any, args: string[]) {
  if (args.length !== 1 || (args[0] !== "true" && args[0] !== "false")) {
    console.log("Usage: npx hardhat interact --command pause --args [true|false] --network sepolia");
    return;
  }
  const pause = args[0] === "true";
  console.log(`${pause ? "Pausing" : "Unpausing"} contract...`);
  const tx = await (pause ? contract.pause() : contract.unpause());
  console.log("Transaction sent, hash:", tx.hash);
  await tx.wait();
  console.log(`Contract ${pause ? "paused" : "unpaused"}`);
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: 1337,
    },
    sepolia: {
      // url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;