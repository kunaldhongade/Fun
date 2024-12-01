const hre = require('hardhat');
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getSecondsOfDays(day) {
  return day * 24 * 60 * 60;
}
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Deploying Betting Platform Token Contract...');

  const TestUSDC = await hre.ethers.deployContract('TestUSDC');

  await TestUSDC.waitForDeployment();

  console.log(
    'TestUSDC Deployed Successfully on Mentioned Network',
    TestUSDC.target
  );

  console.log('Waiting for 30 Seconds to Verify the Contract on Etherscan');
  await sleep(30 * 1000);

  // // Verify the RektLock Contract
  await hre.run('verify:verify', {
    address: TestUSDC.target,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
