const { expect } = require("chai");

describe("FlowUtilityToken", function () {
  it("Should deposit and withdraw funds", async function () {
    const [owner] = await ethers.getSigners();
    const FlowUtilityToken = await ethers.getContractFactory("FlowUtilityToken");
    const token = await FlowUtilityToken.deploy();
    await token.deployed();

    // Deposit 1 ether
    await token.deposit({ value: ethers.utils.parseEther("1.0") });
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1.0"));

    // Withdraw 1 ether
    await token.withdraw(ethers.utils.parseEther("1.0"));
    expect(await token.balanceOf(owner.address)).to.equal(0);
  });
});
