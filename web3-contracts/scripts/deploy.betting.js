const hre = require('hardhat');

// Sleep utility for delays
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deployment Configuration
const TOKEN_ADDRESS = '0xA4D6480Bf490Aba5554B6Fa732180AC0Bc45B1Ba';
const USER_ADDRESS = '0xF7249B507F1f89Eaea5d694cEf5cb96F245Bc5b6';
const VERIFY_DELAY_SECONDS = 30; // Delay for verification in seconds

async function main() {
  // Check for redeployment or verification
  const existingContractAddress = '0xCBa557190D42Dcc1Dc646B53308e765B578a5A5f'; // Deployed contract address
  const redeploy = false; // Set to true if you want to redeploy the contract

  // Fetch deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  if (!TOKEN_ADDRESS || !USER_ADDRESS) {
    throw new Error(
      'TOKEN_ADDRESS or USER_ADDRESS is missing. Please update the script.'
    );
  }

  if (redeploy) {
    console.log('Redeploying BettingPool contract...');
    const BettingPool = await hre.ethers.deployContract('BettingPool', [
      TOKEN_ADDRESS,
      USER_ADDRESS,
    ]);

    await BettingPool.waitForDeployment();
    console.log('Contract deployed successfully at:', BettingPool.target);

    console.log(
      `Waiting ${VERIFY_DELAY_SECONDS} seconds for Etherscan verification...`
    );
    await sleep(VERIFY_DELAY_SECONDS * 1000);

    console.log('Verifying on Etherscan...');
    await hre.run('verify:verify', {
      address: BettingPool.target,
      constructorArguments: [TOKEN_ADDRESS, USER_ADDRESS],
    });
    console.log('Contract verified successfully!');
  } else {
    console.log('Skipping deployment. Verifying existing contract...');

    // Verify the existing contract
    await hre.run('verify:verify', {
      address: existingContractAddress,
      constructorArguments: [TOKEN_ADDRESS, USER_ADDRESS],
    });
    console.log('Existing contract verified successfully!');
  }
}

// Main execution
main()
  .then(() => console.log('Script execution completed successfully!'))
  .catch((error) => {
    console.error('Error in script execution:', error.message || error);
    process.exit(1);
  });
