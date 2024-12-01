// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TopShot {
    mapping(uint256 => address) public momentOwners;
    mapping(uint256 => uint256) public momentPrices;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function setPrice(uint256 momentID, uint256 price) public {
        momentPrices[momentID] = price;
    }

    function getPrice(uint256 momentID) public view returns (uint256) {
        return momentPrices[momentID];
    }

    function purchase(uint256 momentID) public payable {
        require(msg.value >= momentPrices[momentID], "Insufficient payment");
        address owner = momentOwners[momentID];
        payable(owner).transfer(msg.value);
        momentOwners[momentID] = msg.sender;
        emit Transfer(owner, msg.sender, momentID);
    }

    function transferMoment(uint256 momentID, address recipient) public {
        require(momentOwners[momentID] == msg.sender, "Not the owner");
        momentOwners[momentID] = recipient;
        emit Transfer(msg.sender, recipient, momentID);
    }
}
