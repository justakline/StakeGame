// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./StakeToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Presale is Ownable {
    StakeToken public token;
    bool public isOpen;
    uint256 public maxAvax = 20 * (10**18); //20 Avax is the max
    mapping(address => uint256) public addressToAmount; //in avax
    uint256 totalAvax;

    constructor() {
        isOpen = false;
    }

    event Received(address, uint256);

    //_amount is in avax...
    function buy(uint256 _amount) public payable {
        require(isOpen, "The presale is not open");
        require(_amount > 0, "Need to request more than 0");
        // require(_amount == _amount, "Value deos not equal the given amount");
        //The amount of token, converted into avax + the new avax must be less than maxAvax
        require(
            addressToAmount[msg.sender] + _amount <= maxAvax,
            "You have either reached your limit or trying to buy too much"
        );

        token.mint(msg.sender, _amount * 100);
        addressToAmount[msg.sender] += _amount;
        totalAvax += _amount;
    }

    function setPresaleState(bool state) public onlyOwner {
        isOpen = state;
    }

    function getUserAmountInvested(address _user)
        public
        view
        returns (uint256)
    {
        return addressToAmount[_user];
    }

    function setStake(address _address) public onlyOwner {
        token = StakeToken(_address);
    }

    function setMaxAvax(uint256 _value) public onlyOwner {
        maxAvax = _value;
    }

    function getTotalAvax() public view returns (uint256) {
        return totalAvax;
    }

    function sendFunds() public payable onlyOwner {
        require(isOpen);
        payable(msg.sender).transfer((address(this)).balance);
    }

    function sendPartialFunds(uint256 _amount) public payable onlyOwner {
        require(isOpen);
        require(_amount <= ((address(this)).balance));

        payable(msg.sender).transfer(_amount);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
