// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITopShot {
    function getPrice(uint256 momentID) external view returns (uint256);
    function purchase(uint256 momentID) external payable returns (uint256);
    function transferMoment(uint256 momentID, address recipient) external;
}

interface IFlowUtilityToken {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function balanceOf(address user) external view returns (uint256);
}

contract BettingPool {
    address public commissionsAddress;
    uint256 public commissionRate = 5;
    uint256 public accruedFees;
    address public admin;

    IFlowUtilityToken public flowUtilityToken;
    ITopShot public topShot;

    event MomentPurchased(address indexed contractAddress, uint256 momentID);
    event NewUser(uint256 userID);
    event Deposit(uint256 userID, uint256 amount);
    event Withdrawal(uint256 userID, uint256 amount);
    event AccruedFeesWithdrawn(uint256 amount);

    struct User {
        uint256 owedValue;
        uint256 balance;
    }

    mapping(address => User) public users;

    constructor(address _commissionsAddress, address _flowUtilityToken, address _topShot) {
        commissionsAddress = _commissionsAddress;
        admin = msg.sender;
        flowUtilityToken = IFlowUtilityToken(_flowUtilityToken);
        topShot = ITopShot(_topShot);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    function deposit() external payable {
        User storage user = users[msg.sender];
        user.balance += msg.value;
        user.owedValue += msg.value * (100 - commissionRate) / 100;
        emit Deposit(uint256(uint160(msg.sender)), msg.value);
    }

    function withdraw(uint256 amount) external {
        User storage user = users[msg.sender];
        require(user.owedValue >= amount, "Requested amount greater than owed");
        user.balance -= amount;
        user.owedValue -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(uint256(uint160(msg.sender)), amount);
    }

    function purchaseMoment(uint256 momentID) external onlyAdmin {
        uint256 price = topShot.getPrice(momentID);
        require(address(this).balance >= price, "Insufficient balance");

        uint256 userCount = 0;
        uint256 totalOwed = 0;
        for (uint256 i = 0; i < userCount; i++) {
            User storage user = users[msg.sender];
            user.owedValue -= price / userCount;
            totalOwed += user.owedValue;
        }

        accruedFees += (price * commissionRate) / 100;
        topShot.purchase{value: price}(momentID);
        emit MomentPurchased(address(topShot), momentID);
    }

    function transferMoment(uint256 momentID, address recipient) external onlyAdmin {
        topShot.transferMoment(momentID, recipient);
    }

    function withdrawAccruedFees() external onlyAdmin {
        uint256 amount = accruedFees;
        accruedFees = 0;
        payable(commissionsAddress).transfer(amount);
        emit AccruedFeesWithdrawn(amount);
    }
}
