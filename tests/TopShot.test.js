const { expect } = require("chai");

describe("TopShot", function () {
  it("Should set and get prices and transfer moments", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const TopShot = await ethers.getContractFactory("TopShot");
    const topShot = await TopShot.deploy();
    await topShot.deployed();

    // Set price for momentID 1
    await topShot.setPrice(1, ethers.utils.parseEther("1.0"));
    expect(await topShot.getPrice(1)).to.equal(ethers.utils.parseEther("1.0"));

    // Purchase momentID 1
    await topShot.purchase(1, { value: ethers.utils.parseEther("1.0") });
    expect(await topShot.momentOwners(1)).to.equal(owner.address);

    // Transfer momentID 1 to addr1
    await topShot.transferMoment(1, addr1.address);
    expect(await topShot.momentOwners(1)).to.equal(addr1.address);
  });
});
