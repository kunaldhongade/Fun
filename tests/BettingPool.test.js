const { expect } = require("chai");

describe("BettingPool", function () {
  it("Should handle deposits, withdrawals, and NFT purchases", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const FlowUtilityToken = await ethers.getContractFactory("FlowUtilityToken");
    const TopShot = await ethers.getContractFactory("TopShot");
    const flowUtilityToken = await FlowUtilityToken.deploy();
    const topShot = await TopShot.deploy();
    await flowUtilityToken.deployed();
    await topShot.deployed();

    const BettingPool = await ethers.getContractFactory("BettingPool");
    const bettingPool = await BettingPool.deploy(owner.address, flowUtilityToken.address, topShot.address);
    await bettingPool.deployed();

    // Deposit 1 ether
    await flowUtilityToken.deposit({ value: ethers.utils.parseEther("1.0") });
    await flowUtilityToken.transfer(bettingPool.address, ethers.utils.parseEther("1.0"));
    expect(await flowUtilityToken.balanceOf(bettingPool.address)).to.equal(ethers.utils.parseEther("1.0"));

    // Purchase momentID 1
    await topShot.setPrice(1, ethers.utils.parseEther("1.0"));
    await bettingPool.purchaseMoment(1);
    expect(await topShot.momentOwners(1)).to.equal(bettingPool.address);

    // Withdraw fees
    await bettingPool.withdrawAccruedFees();
    expect(await flowUtilityToken.balanceOf(owner.address)).to.be.above(0);
  });
});
