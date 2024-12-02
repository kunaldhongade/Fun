# CrowdfundingPlatform - Smart Contract

This is the **CrowdfundingPlatform** smart contract built on the **Aptos Blockchain**. It allows users to create crowdfunding projects, back projects with Aptos (APT) tokens, and view project details. Project creators can raise funds while backers can contribute to projects they support.

## Key Features

- **Create Projects**: Users can create crowdfunding projects with a title, description, and funding goal.
- **Back Projects**: Backers can contribute Aptos tokens to support projects.
- **View Projects**: Anyone can view all active crowdfunding projects and their details.
- **Track Donations**: Backers can view their donation history, and creators can track their projects' progress.
- **Secure Transactions**: All contributions are securely transferred to the project creator's address through smart contract interactions.

## Smart Contract Structure

- **GlobalProjectCollection**: A struct that stores all crowdfunding projects and donations.
- **Project**: Represents a crowdfunding project with attributes like the project ID, creator, title, description, funding goal, and total funds raised.
- **Donation**: Represents a donation made to a project, including the backer's address, the project ID, amount donated, and timestamp.

## Functions

### Initialization

- **`init_platform(account: &signer)`**  
  Initializes the global collection of projects and donations. This function must be called once to set up the platform.

### Project Management

- **`create_project(account: &signer, title: String, description: String, goal: u64)`**  
  Allows a user to create a new crowdfunding project by specifying the project title, description, and funding goal.

### Backing Projects

- **`back_project(account: &signer, project_id: u64, amount: u64)`**  
  Allows a user to back a specific project by its project ID and contribute Aptos tokens. The contribution is transferred directly to the project creator's address.

### Viewing Projects

- **`view_all_projects(): vector<Project>`**  
  Returns a list of all crowdfunding projects.

- **`view_project_by_id(project_id: u64): Project`**  
  Returns the details of a specific project by its project ID.

- **`view_projects_by_creator(creator: address): vector<Project>`**  
  Returns all projects created by a specific creator (project owner).

### Viewing Donations

- **`view_donations_by_backer(backer: address): vector<Donation>`**  
  Returns all donations made by a specific backer.

## Errors

- **`ERR_PROJECT_NOT_FOUND`**: Raised when attempting to interact with a non-existent project.
- **`ERR_NO_PROJECTS`**: Raised when there are no projects in the system.
- **`ERR_ALREADY_INITIALIZED`**: Raised if the platform is already initialized.

## Setup Instructions

### Prerequisites

- **Aptos CLI**: For deploying and interacting with the contract on the Aptos blockchain.
- **Aptos Wallet**: For performing transactions on the blockchain.

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/crowdfunding-platform.git
cd crowdfunding-platform
```

### 2. Deploy the Contract

Ensure you have set up your Aptos environment. Then deploy the contract using the following steps:

- Initialize your Aptos account if you haven't done so already:
  ```bash
  aptos init
  ```
- Publish the contract:
  ```bash
  aptos move publish --package-dir path/to/your/contract
  ```

### 3. Initialize the Platform

After deploying, call the `init_platform` function to initialize the crowdfunding platform:

```bash
aptos move run --function-id <deployed_address>::CrowdfundingPlatform::init_platform --args address:<account_address>
```

## Example Usage

### 1. Create a New Project

```bash
aptos move run --function-id <deployed_address>::CrowdfundingPlatform::create_project --args address:<creator_address> string:<title> string:<description> u64:<goal_amount>
```

### 2. Back a Project

```bash
aptos move run --function-id <deployed_address>::CrowdfundingPlatform::back_project --args address:<backer_address> u64:<project_id> u64:<amount>
```

### 3. View All Projects

```bash
aptos move run --function-id <deployed_address>::CrowdfundingPlatform::view_all_projects
```

## Conclusion

The **CrowdfundingPlatform** smart contract provides a decentralized and transparent way for users to create, back, and manage crowdfunding projects on the Aptos blockchain. By using secure smart contracts, all contributions and funds are transparently managed, ensuring trust and reliability.
