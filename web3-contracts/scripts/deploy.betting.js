const hre = require('hardhat');
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const tokenAddress = '0x19F82072e6612156eC5F8b43fa404c3e3Eef9957';
const userAddress = '0xF7249B507F1f89Eaea5d694cEf5cb96F245Bc5b6';
// const contract_Address = '0xce6c79EA7C4cE0DC5d6863ACb0cBEABc27C351b6';
function getSecondsOfDays(day) {
  return day * 24 * 60 * 60;
}
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Deploying Betting Platform Token Contract...');

  const BettingPool = await hre.ethers.deployContract('BettingPool', [
    tokenAddress,
    userAddress,
  ]);

  await BettingPool.waitForDeployment();

  console.log(
    'BettingPool Deployed Successfully on Mentioned Network',
    BettingPool.target
  );

  console.log('Waiting for 30 Seconds to Verify the Contract on Etherscan');
  await sleep(30 * 1000);

  // // Verify the RektLock Contract
  await hre.run('verify:verify', {
    address: BettingPool.target,
    constructorArguments: [tokenAddress, userAddress],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
