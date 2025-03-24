import { expect } from "chai";
import { ethers } from "hardhat";
import { SkillTestToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SkillTestToken", function () {
  let token: SkillTestToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let feeWallet: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2, feeWallet] = await ethers.getSigners();
    const SkillTestToken = await ethers.getContractFactory("SkillTestToken");
    token = await SkillTestToken.deploy(feeWallet.address);
    await token.waitForDeployment();
  });

  it("Should deploy with correct initial supply", async function () {
    const totalSupply = await token.totalSupply();
    expect(totalSupply).to.equal(ethers.parseEther("1000000"));
  });

  it("Should charge 2% fee on transfer", async function () {
    await token.transfer(addr1.address, ethers.parseEther("100"));
    const feeWalletBalance = await token.balanceOf(feeWallet.address);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(feeWalletBalance).to.equal(ethers.parseEther("2"));
    expect(addr1Balance).to.equal(ethers.parseEther("98"));
  });

  it("Should allow owner to pause transfers", async function () {
    await token.pause();
    await expect(
      token.transfer(addr1.address, ethers.parseEther("100"))
    ).to.be.revertedWithCustomError(token, "EnforcedPause");
  });

  it("Should prevent blacklisted address from sending", async function () {
    await token.blacklistAddress(addr1.address);
  
    await expect(
      token.transfer(addr1.address, ethers.parseEther("100"))
    ).to.be.revertedWith("recipient is blacklisted");
  
    await token.transfer(addr2.address, ethers.parseEther("100"));
  
    await token.blacklistAddress(addr2.address);
    await expect(
      token.connect(addr2).transfer(addr1.address, ethers.parseEther("50"))
    ).to.be.revertedWith("sender is blacklisted");
  });
});