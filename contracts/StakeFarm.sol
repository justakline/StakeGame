// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StakeToken.sol";

contract StakeFarm is Ownable {
    address[] public stakers;
    StakeToken public stakeToken;

    //Yield increase will be in terms of 1.01 rather than 1% ie 0.01
    uint256 public yieldPercentNumerator;
    uint256 public yieldPercentDenominator;

    bool public stakeAllowed;
    event Received(address, uint256);

    struct User {
        uint256 originalBalance;
        uint256 amountStaked;
        uint256 startDate;
        int256 index;
    }

    mapping(address => User) public users;

    modifier stakingAllowed() {
        require(stakeAllowed == true, "Staking is not allowed at the moment");
        _;
    }

    constructor(address _stakeToken) public payable {
        stakeToken = StakeToken(_stakeToken);
        //Default yield = 1%
        yieldPercentNumerator = 101;
        yieldPercentDenominator = 100;
        stakeAllowed = false;
    }

    function stake(uint256 _amount) public stakingAllowed {
        require(_amount > 0, "Not Enough to stake anything");
        require(
            _amount <= stakeToken.balanceOf(msg.sender),
            "Can't stake more than you have"
        );

        User memory user = users[msg.sender];
        if (!isStaker(msg.sender)) {
            stakers.push(msg.sender);
        }
        user.amountStaked = getStakingBalance(msg.sender) + _amount;
        user.originalBalance += _amount;
        user.startDate = block.timestamp;
        user.index = int256(stakers.length - 1);
        stakeToken.transferFrom(msg.sender, address(this), _amount);
        users[msg.sender] = user;
    }

    function unstake(uint256 _amount) public stakingAllowed {
        User memory user = users[msg.sender];
        require(user.amountStaked > 0, "Can't unstake if you have no balance");
        require(_amount > 0, "Can't unstake 0");

        user.amountStaked = getStakingBalance(msg.sender);
        require(
            _amount <= user.amountStaked,
            "Can't unstake more than the amount staked"
        );

        user.amountStaked -= _amount;
        user.originalBalance = user.amountStaked;
        user.startDate = block.timestamp;
        stakeToken.mint(msg.sender, _amount);
        stakeToken.burn(address(this), _amount);
        users[msg.sender] = user;
        if (user.amountStaked <= 0) {
            removeStaker(msg.sender);
        }
    }

    // Solidity does not automatically shift and delete from a specific index,
    //So instead we just override the address
    function removeStaker(address _user) internal {
        User memory removeUser = users[_user];
        User memory lastUser = users[stakers[stakers.length - 1]];
        stakers[uint256(removeUser.index)] = stakers[stakers.length - 1];
        lastUser.index = removeUser.index;
        removeUser.index = -1;
        stakers.pop();
    }

    function isStaker(address _user) public view returns (bool) {
        return users[_user].amountStaked > 0 ? true : false;
    }

    function getNextRewardYield(address _user) public view returns (uint256) {
        uint256 balance = getStakingBalance(_user);
        return
            ((balance / yieldPercentDenominator) * yieldPercentNumerator) -
            balance;
    }

    function getStakingBalance(address _user) public view returns (uint256) {
        if (users[_user].originalBalance == 0) {
            return 0;
        }
        uint256 time = getDaysSinceStart(_user);

        uint256 balance = users[_user].originalBalance *
            (yieldPercentNumerator**time);
        return balance / (yieldPercentDenominator**time);
    }

    function getDaysSinceStart(address _user) public view returns (uint256) {
        return (getSecsSinceStart(_user) / 60 / 60 / 24);
    }

    function getSecsSinceStart(address _user) public view returns (uint256) {
        if (block.timestamp < users[_user].startDate) {
            return users[_user].startDate - block.timestamp;
        }

        return block.timestamp - users[_user].startDate;
    }

    function setPercent(uint256 _numerator, uint256 _denominator)
        public
        onlyOwner
    {
        require(_numerator > 0, "Numerator can not be less than 0");
        require(_denominator > 0, "Denominator can not be less than 0");

        for (uint256 i = 0; i < stakers.length; i++) {
            User memory user = users[stakers[i]];
            uint256 newBalance = getStakingBalance(stakers[i]);
            user.amountStaked = newBalance;
            user.originalBalance = newBalance;
            user.startDate = block.timestamp;
            users[stakers[i]] = user;
        }

        yieldPercentNumerator = _numerator;
        yieldPercentDenominator = _denominator;
    }

    function setFarmOpen() public onlyOwner {
        require(stakeAllowed == false, "Farm is already open");
        stakeAllowed = true;
    }

    function setFarmClosed() public onlyOwner {
        require(stakeAllowed == true, "Farm is already closed");
        stakeAllowed = false;
    }

    function transferFunds(address _user, uint256 _amount) public onlyOwner {
        require(
            _amount <= stakeToken.balanceOf(address(this)),
            "Not funds in farm to send"
        );
        stakeToken.mint(_user, _amount);
        stakeToken.burn(_user, _amount);
    }

    //returns in seconds... We mod because what if >= 1days since staking
    function timeToNextRebase(address _user) public view returns (uint256) {
        return
            86400 -
            ((block.timestamp - users[_user].startDate) % (60 * 60 * 24));
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
