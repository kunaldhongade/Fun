// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract DunkVerse is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    address public constant OWNER = 0xF7249B507F1f89Eaea5d694cEf5cb96F245Bc5b6;

    constructor() ERC20('DunkVerse-Token', 'FTO') {
        // Calculate initial supply with correct decimals
        uint256 initialSupply = 10000000000 * (10 ** decimals());
        
        // Mint tokens directly to the owner address
        _mint(OWNER, initialSupply);
        
        // Grant roles to owner
        _grantRole(DEFAULT_ADMIN_ROLE, OWNER);
        _grantRole(MINTER_ROLE, OWNER);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}