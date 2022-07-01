// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StakeToken.sol";

contract RiskFarm is Ownable {
    bool public riskAllowed;
    mapping(uint256 => uint256) public positiveYieldToChance;
    mapping(uint256 => uint256) public negativeYieldToChance;
    address public team;

    struct User {
        uint256 amountStaked;
        uint256 previousBalance;
        uint256 startDate;
    }

    mapping(address => User) public users;
    //in wei
    uint256[3] public positives;
    uint256[3] public negatives;

    StakeToken public stakeToken;
    uint256 public timeGap;
    uint256 private nonce = 13;
    uint256 public decimals = 10**4; // We just need to remember to multiply be decimals to get back the right answer
    uint256 public randomNumber; // We just need to remember to multiply be decimals to get back the right answer
    event Received(address, uint256);
    event LostMoney(address, int256);
    event GainedMoney(address, int256);

    modifier riskingAllowed() {
        require(riskAllowed == true, "Staking is not allowed at the moment");
        _;
    }
    modifier isClaimable() {
        require(
            block.timestamp - users[msg.sender].startDate >= timeGap,
            "You have to wait longer to be able to Claim/Reinvest/Unstake"
        );
        _;
    }

    constructor(address _stakeToken) public payable {
        stakeToken = StakeToken(_stakeToken);

        setPositives(
            1 * decimals,
            50 * decimals, // 50% chance of gaining 1%
            10 * decimals,
            10 * decimals, // 10% chance of gaining 10%
            100 * decimals,
            1 * decimals // 1% chance of gaining 100%
        );

        setNegatives(
            10 * decimals,
            5 * decimals, // 5% chance of gaining 10%
            30 * decimals,
            1 * decimals, // 1% chance of gaining 30%
            90 * decimals,
            1 * (decimals / 10) // 0.1% chance of gaining 100% ... /10 in this instance makes it equal to 0.1%
        );
        timeGap = 1 * (60 * 60 * 24); // days is the first part
        riskAllowed = false;
    }

    function stake(uint256 _amount) public riskingAllowed {
        require(_amount > 0, "Amount to be staked needs to be greater than 0");
        require(
            _amount <= stakeToken.balanceOf(msg.sender),
            "Can't stake more than you have"
        );
        User memory user = users[msg.sender];
        user = User(
            user.amountStaked + _amount,
            user.previousBalance + _amount,
            block.timestamp
        );
        users[msg.sender] = user;
        stakeToken.burn(msg.sender, _amount);
    }

    function unstake(uint256 _amount) public riskingAllowed {
        require(
            _amount > 0,
            "Amount to be unstaked needs to be greater than 0"
        );

        //If the user unstakes before staking period is up, don't adjust values
        if (canClaim()) {
            claim();
        }
        User memory user = users[msg.sender];
        uint256 stakeAmount = user.amountStaked;
        require(
            _amount <= user.amountStaked,
            "Can't unstake more than you have, check again"
        );

        user.amountStaked -= _amount;
        user.previousBalance = user.amountStaked;
        stakeToken.mint(msg.sender, _amount);

        //After Calculating the new balance, the amount you want to unstake is too much
        //So we just reset the start date and allow you to unstake the amount you want again
        //And when you unstake again, if its a partial amount then we do not change your start date
        user.startDate = block.timestamp;
        users[msg.sender] = user;
    }

    //Claim will be used to add or subtract to the amountStaked of the user
    //the user then can seperately unstake after claiming
    function claim() public isClaimable riskingAllowed {
        calculateNewBalance();
    }

    function calculateNewBalance() internal isClaimable riskingAllowed {
        uint256 balance = users[msg.sender].amountStaked;

        //positives
        for (uint256 i = 0; i < positives.length; i++) {
            uint256 pValue = positives[i];
            if (isReward(msg.sender, positiveYieldToChance[pValue])) {
                balance += (balance * pValue) / (decimals * 100);
            }
        }
        //negatives
        for (uint256 i = 0; i < negatives.length; i++) {
            uint256 nValue = negatives[i];
            if (isReward(msg.sender, negativeYieldToChance[nValue])) {
                uint256 value = (balance * nValue) / (decimals * 100);
                //they lose money and the protocol gets 10% for marketing/expenses
                stakeToken.mint(team, value / 10);
                balance -= value;
            }
        }

        users[msg.sender].amountStaked = balance;
        users[msg.sender].startDate = block.timestamp;

        int256 changeOfBalance = int256(balance) -
            int256(users[msg.sender].previousBalance);

        if (changeOfBalance >= 0) {
            emit GainedMoney(msg.sender, changeOfBalance);
        }
        emit LostMoney(msg.sender, changeOfBalance);
    }

    function isReward(address _user, uint256 _chance) internal returns (bool) {
        nonce += 2;
        uint256 random = (
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, address(_user), nonce)
                )
            )
        ) % (decimals * 100); //the 100 accounts for 0-99%

        randomNumber = random; //testing purposes

        //Lets assume we have a 10% chance of getting the reward... random(with our decimals) returns a number
        // between 0-999,999... 10%% = 10 *10**4 = 100,000, so if random is <100,000, then win

        if (random <= _chance) {
            return true;
        }
        return false;
    }

    //All values/chances will need to be given with such that it will be divided by 10**4 and recieve the percentage
    // If we want a 10% chance, we would need to pass 10 *10**4
    //We can't work with plain decimals, so we will account for this in our math
    //The lowest we percent we will go is 0.1% which is 0.1 * 10**4
    function setPositives(
        uint256 _firstValue,
        uint256 _firstChance,
        uint256 _secondValue,
        uint256 _secondChance,
        uint256 _thirdValue,
        uint256 _thirdChance
    ) public onlyOwner {
        require(_firstValue > 0, "Positive Outcomes can't be < 0");
        require(_secondValue > 0, "Positives Outcomes can't be < 0");
        require(_thirdValue > 0, "Positives Outcomes can't be < 0");
        require(_firstChance > 0, "Positives Likelhoods can't be < 0");
        require(_secondChance > 0, "Positives Likelhoods can't be < 0");
        require(_thirdChance > 0, "Positives Likelhoods can't be < 0");

        // positives = uint256[3]();

        positives[0] = _firstValue;
        positives[1] = _secondValue;
        positives[2] = _thirdValue;

        positiveYieldToChance[_firstValue] = _firstChance;
        positiveYieldToChance[_secondValue] = _secondChance;
        positiveYieldToChance[_thirdValue] = _thirdChance;
    }

    //All values/chances will need to be given with such that it will be divided by 10**4 and recieve the percentage
    // If we want a 10% chance, we would need to pass 10 *10**4
    //We can't work with plain decimals, so we will account for this in our math
    //The lowest we percent we will go is 0.1% which is 0.1 * 10**4

    //Inputs need to be postive!!!!!!!!!
    function setNegatives(
        uint256 _firstValue,
        uint256 _firstChance,
        uint256 _secondValue,
        uint256 _secondChance,
        uint256 _thirdValue,
        uint256 _thirdChance
    ) public onlyOwner {
        require(
            _firstValue > 0,
            "Negative Outcomes can't be need to be set a postive numbers"
        );
        require(
            _secondValue > 0,
            "Negative Outcomes can't be need to be set a postive numbers"
        );
        require(
            _thirdValue > 0,
            "Negative Outcomes can't be need to be set a postive numbers"
        );
        require(_firstChance > 0, "Negative Likelhoods can't be < 0");
        require(_secondChance > 0, "Negative Likelhoods can't be < 0");
        require(_thirdChance > 0, "Negative Likelhoods can't be < 0");

        // negatives = uint256[3]();
        negatives[0] = _firstValue;
        negatives[1] = _secondValue;
        negatives[2] = _thirdValue;

        negativeYieldToChance[_firstValue] = _firstChance;
        negativeYieldToChance[_secondValue] = _secondChance;
        negativeYieldToChance[_thirdValue] = _thirdChance;
    }

    function isStaker(address _user) public view returns (bool) {
        return users[_user].amountStaked > 0 ? true : false;
    }

    function canClaim() public view returns (bool) {
        if (block.timestamp - users[msg.sender].startDate >= timeGap) {
            return true;
        }

        return false;
    }

    function getUserStakingBalance(address _user)
        public
        view
        returns (uint256)
    {
        return users[_user].amountStaked;
    }

    function getUserPreviousStake(address _user) public view returns (uint256) {
        return users[_user].previousBalance;
    }

    // function getDaysSinceStart(address _user) public view returns (uint256) {
    //     return (getSecsSinceStart(_user) / 60 / 60 / 24);
    // }

    // function getSecsSinceStart(address _user) public view returns (uint256) {
    //     if (block.timestamp < users[msg.sender].startDate) {
    //         return users[msg.sender].startDate - block.timestamp;
    //     }
    //     return (block.timestamp - users[msg.sender].startDate);
    // }

    function getUserSecsUntilRebase(address _user)
        public
        view
        returns (uint256)
    {
        //if the timegap hasnt been passed, then return the difference, elese return -1
        if (block.timestamp - users[_user].startDate <= timeGap) {
            return timeGap - (block.timestamp - users[_user].startDate);
        }
        return 0;
    }

    function setFarmOpen() public onlyOwner {
        riskAllowed = true;
    }

    function setFarmClosed() public onlyOwner {
        riskAllowed = false;
    }

    function setTeam(address _team) public onlyOwner {
        team = _team;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
