// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';

contract BettingPool is ERC721Holder {
    using SafeERC20 for IERC20;

    event NewUser(uint256 userID, address userAddress);
    event Deposit(uint256 userID, uint256 amount, uint256 poolId);
    event Withdrawal(uint256 userID, uint256 amount, uint256 poolId);
    event MomentPurchased(address indexed buyer, uint256 indexed momentID, uint256 amount);
    event AccruedFeesWithdrawn(uint256 amount, address to);

    IERC20 public flowToken;
    uint256 public accruedFees;
    address public commissionsAddress;
    uint256 public commission = 5;

    struct User {
        uint256 owedValue;
        uint256 uuid;
    }

    mapping(address => User) public users;
    mapping(uint256 => uint256) public poolAmount;

    constructor(address _flowToken, address _commissionsAddress) {
        flowToken = IERC20(_flowToken);
        commissionsAddress = _commissionsAddress;
    }

    function createUser() external returns (uint256) {
        require(users[msg.sender].uuid == 0, "User already exists");

        uint256 userId = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp)));
        users[msg.sender] = User({owedValue: 0, uuid: userId});
        
        emit NewUser(userId, msg.sender);
        return userId;
    }

    function deposit(uint256 amount, uint256 poolId) external {
        require(amount > 0, "Amount must be greater than zero");
        User storage user = users[msg.sender];
        require(user.uuid != 0, "User not registered");

        flowToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 afterCommission = (amount * (100 - commission)) / 100;
        user.owedValue += afterCommission;
        poolAmount[poolId] += afterCommission;
        accruedFees += (amount - afterCommission);

        emit Deposit(user.uuid, amount, poolId);
    }

    function withdraw(uint256 amount, uint256 poolId) external {
        User storage user = users[msg.sender];
        require(user.owedValue >= amount, "Insufficient owed value");
        require(poolAmount[poolId] >= amount, "Insufficient pool balance");

        user.owedValue -= amount;
        poolAmount[poolId] -= amount;

        flowToken.safeTransfer(msg.sender, amount);

        emit Withdrawal(user.uuid, amount, poolId);
    }

    function purchaseMoment(uint256 momentID, uint256 amount) external {
        User storage user = users[msg.sender];
        require(user.owedValue >= amount, "Insufficient balance");

        user.owedValue -= amount;
        accruedFees += amount;

        emit MomentPurchased(msg.sender, momentID, amount);
    }

    function withdrawAccruedFees() external {
        require(msg.sender == commissionsAddress, "Not authorized");
        require(accruedFees > 0, "No accrued fees to withdraw");

        flowToken.safeTransfer(commissionsAddress, accruedFees);
        emit AccruedFeesWithdrawn(accruedFees, commissionsAddress);
        accruedFees = 0;
    }
}
