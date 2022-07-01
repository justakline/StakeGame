// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StakeToken.sol";

contract TestFarm is Ownable {
    StakeToken public stakeToken;
    bool public testingAllowed;
    uint256 public maxAmount;
    mapping(address => uint256) public addressToAmount;
    uint256 totalMinted;

    constructor(address _stakeToken) public {
        stakeToken = StakeToken(_stakeToken);

        testingAllowed = false;
        maxAmount = 1000 * 10**18;
        totalMinted = 0;
    }

    function mint(address _user, uint256 _amount) public {
        require(testingAllowed, "Testing is not allowed right now");
        require(
            addressToAmount[_user] + _amount <= maxAmount,
            "You have requested too much!"
        );
        stakeToken.mint(_user, _amount);
        addressToAmount[_user] += _amount;
        totalMinted += _amount;
    }

    function setTestingAllowed(bool _allowed) public onlyOwner {
        testingAllowed = _allowed;
    }

    function setMaxAmount(uint256 _amount) public onlyOwner {
        maxAmount = _amount;
    }

    function getUserAmountMinted(address _user) public view returns (uint256) {
        return addressToAmount[_user];
    }

    function getTotalMinted() public view returns (uint256) {
        return totalMinted;
    }
}
