// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakeToken is ERC20 {
    mapping(address => bool) public minters;

    modifier onlyMinter() {
        require(minters[msg.sender] == true, "User is not allowed to mint");
        _;
    }

    constructor() ERC20("StakeToken", "STK") {
        minters[msg.sender] = true;
    }

    function mint(address account, uint256 amount) public onlyMinter {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyMinter {
        require(
            amount <= super.balanceOf(account),
            "Can't burn more than what they have"
        );
        _burn(account, amount);
    }

    function addMinter(address newMinter) public onlyMinter {
        require(minters[newMinter] != true, "Minter already added");
        minters[newMinter] = true;
    }
}
