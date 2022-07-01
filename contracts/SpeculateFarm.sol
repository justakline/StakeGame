// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./StakeToken.sol";

contract SpeculateFarm is Ownable {
    uint256 public nonce = 33;
    uint256 public randomNumber;
    uint256 public timeGap;
    uint256 public decimals = 10**4;
    address public team;

    StakeToken stakeToken;
    bool public speculateAllowed;

    struct User {
        uint256 amountStaked;
        uint256 previousBalance;
        uint256 startDate;
        uint256 timeGuess;
    }

    mapping(address => User) public users;
    uint256 public returnRate;

    event Received(address, uint256);
    event Calculating(address, uint256);
    event Say(string);
    event Claim(bool);

    modifier speculatingAllowed() {
        require(
            speculateAllowed == true,
            "Staking is not allowed at the moment"
        );
        _;
    }
    modifier isClaimable() {
        require(
            (block.timestamp - users[msg.sender].startDate >= timeGap) ||
                (users[msg.sender].amountStaked == 0),
            "You have to wait longer to be able to Claim/Reinvest/Unstake"
        );
        _;
    }

    constructor(address _stakeToken) payable {
        stakeToken = StakeToken(_stakeToken);
        timeGap = 1 * (60 * 60); // 1 hour
        speculateAllowed = false;
        returnRate = 10 * decimals; //90% rug
    }

    //TimeGuess is inputted in mins so we have to convert into secs
    //IsClaimable because we do not want them to add more when after they started
    function stake(uint256 _amount, uint256 _timeGuess)
        public
        speculatingAllowed
        isClaimable
    {
        require(
            _amount > 0 || stakeToken.balanceOf(msg.sender) > 0,
            "Amount to be staked needs to be greater than 0"
        );
        require(
            _amount <= stakeToken.balanceOf(msg.sender),
            "Can't stake more than you have"
        );
        require(
            _timeGuess >= 1 && _timeGuess <= 60,
            "Your guess needs to be between 1 and 60 inclusively"
        );
        // User memory user = users[msg.sender];
        // user = User(
        //     user.amountStaked + _amount,
        //     user.previousBalance + _amount,
        //     block.timestamp
        // );
        // users[msg.sender] = user;
        // users[msg.sender].amountStaked = calculateEarnings(_timeGuess);

        //what if they already staked and lost money?
        if (
            users[msg.sender].amountStaked < users[msg.sender].previousBalance
        ) {
            users[msg.sender].amountStaked = users[msg.sender].previousBalance;
        }
        users[msg.sender].amountStaked += _amount;
        users[msg.sender].previousBalance += _amount;
        users[msg.sender].startDate = block.timestamp;
        users[msg.sender].amountStaked = calculateEarnings(_timeGuess);
        users[msg.sender].timeGuess = _timeGuess;

        stakeToken.burn(msg.sender, _amount);

        int256 difference = int256(users[msg.sender].amountStaked) -
            int256(users[msg.sender].previousBalance);
        //did they lose money then the team gets 10% for advertising and fees?
        if (difference < 0) {
            stakeToken.mint(team, uint256((-1 * difference)) / 10);
        }
    }

    //TimeGuess is inputted in mins so we have to convert into secs
    //IsClaimable because we do not want them to add more when after they started
    //Just like stake but instead we are just using what is already staked
    // function restake(uint256 _timeGuess) public speculatingAllowed isClaimable {
    //     emit Claim(canClaim());
    //     require(users[msg.sender].amountStaked > 0, "Can't restake 0");
    //     users[msg.sender].amountStaked = calculateEarnings(_timeGuess);
    //     users[msg.sender].startDate = block.timestamp;
    // }

    function unstake(uint256 _amount) public speculatingAllowed isClaimable {
        require(
            _amount > 0,
            "Amount to be unstaked needs to be greater than 0"
        );

        //If the user unstakes before staking period is up, don't adjust values

        User memory user = users[msg.sender];
        uint256 stakeAmount = user.amountStaked;
        require(
            _amount <= user.amountStaked,
            "Can't unstake more than you have, check again"
        );
        //Team gets 10% for marketing

        user.amountStaked -= _amount;
        user.previousBalance = user.amountStaked;

        user.timeGuess = 0;
        stakeToken.mint(msg.sender, _amount);

        //After Calculating the new balance, the amount you want to unstake is too much
        //So we just reset the start date and allow you to unstake the amount you want again
        //And when you unstake again, if its a partial amount then we do not change your start date
        users[msg.sender] = user;
    }

    function calculateEarnings(uint256 _timeGuess) internal returns (uint256) {
        uint256 random = setBurnMin(msg.sender);
        User memory user = users[msg.sender];
        //Was the guess over? return only the percent returned value

        emit Say(Strings.toString(_timeGuess * 60));

        emit Say(Strings.toString(random));

        //You guessed before, so now we calculate your earnings
        if (user.startDate + (_timeGuess * 60) > user.startDate + random) {
            emit Calculating(
                msg.sender,
                (user.amountStaked * decimals) / returnRate
            );
            return (user.amountStaked * decimals) / returnRate;
        }

        if (_timeGuess <= 20) {
            return (((((_timeGuess**2 * decimals**2) / 16) +
                100 *
                decimals**2) * user.amountStaked) / (100 * decimals**2));
        }
        if (_timeGuess <= 40) {
            return
                ((((_timeGuess**2 * decimals**2) / 7) + 68 * decimals**2) *
                    user.amountStaked) / (100 * decimals**2);
        }

        if (_timeGuess <= 60) {
            return
                (((((_timeGuess**2 * decimals**2) / 2) - 503 * decimals**2)) *
                    user.amountStaked) / (100 * decimals**2);
        }
    }

    function showBalance(address _user) public returns (uint256) {
        uint256 currentMinute = getUserSecs(_user) / 60;
        User memory user = users[_user];

        //If the ammount staked is less, we already know they lost so show their balance, but we only show it once they pass the mins
        if (
            user.amountStaked < user.previousBalance &&
            currentMinute >= user.timeGuess
        ) {
            return user.amountStaked;
        }

        uint256 amount;
        if (currentMinute <= 20) {
            amount = (((((currentMinute**2 * decimals**2) / 16) +
                100 *
                decimals**2) * user.previousBalance) / (100 * decimals**2));
            return amount < user.amountStaked ? amount : user.amountStaked;
        }
        if (currentMinute <= 40) {
            amount =
                ((((currentMinute**2 * decimals**2) / 7) + 68 * decimals**2) *
                    user.previousBalance) /
                (100 * decimals**2);
            return amount < user.amountStaked ? amount : user.amountStaked;
        }

        if (currentMinute <= 60) {
            amount =
                ((
                    (((currentMinute**2 * decimals**2) / 2) - 503 * decimals**2)
                ) * user.previousBalance) /
                (100 * decimals**2);
            return amount < user.amountStaked ? amount : user.amountStaked;
        }

        //they already won so return this
        return user.amountStaked;
    }

    // function testCalculateEarnings(uint256 _timeGuess, uint256 _random)
    //     public
    //     returns (uint256)
    // {
    //     uint256 random = _random;
    //     User memory user = users[msg.sender];

    //     //Was the guess over? return only the percent returned value
    //     if (user.startDate + (_timeGuess) > user.startDate + random) {
    //         emit Calculating(
    //             msg.sender,
    //             (user.amountStaked * decimals) / returnRate
    //         );
    //         return (user.amountStaked * decimals) / returnRate;
    //     }
    //     emit Say("didn't think you were rugged");
    //     //You guessed before, so now we calculate your earnings

    //     if (_timeGuess <= 30) {
    //         return
    //             user.amountStaked +
    //             (2 * user.amountStaked * _timeGuess) /
    //             div30;
    //     }

    //     return ((user.amountStaked * _timeGuess**2) / div60) - 65;
    // }

    // function setUser(uint256 _amountStaked, uint256 _previousBalance) public {
    //     users[msg.sender] = User(
    //         _amountStaked,
    //         _previousBalance,
    //         block.timestamp
    //     );
    // }

    function setFarmOpen() public onlyOwner {
        require(speculateAllowed == false, "Farm is already open");
        speculateAllowed = true;
    }

    function setFarmClosed() public onlyOwner {
        require(speculateAllowed == true, "Farm is already closed");
        speculateAllowed = false;
    }

    //Send in if wantingthem to have 10% write 10 or them having 20% write 20
    function setReturnRate(uint256 _rate) public onlyOwner {
        returnRate = _rate * decimals;
    }

    function setBurnMin(address _user) internal returns (uint256) {
        nonce += 2;

        //The minus 60 then plus 60 so that the rug min is never <1 min...
        //-60 would make us mod by 59 mins, so the number could be 0-59,
        //+61 would make the number be betweem 1-60
        uint256 random = ((
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, address(_user), nonce)
                )
            )
        ) % (timeGap - 60)) + 61; //This will give the exact second.

        randomNumber = random; //testing purposes
        return random;
    }

    function setTeam(address _team) public onlyOwner {
        team = _team;
    }

    function canClaim() public view returns (bool) {
        if (block.timestamp - users[msg.sender].startDate >= timeGap) {
            return true;
        }

        return false;
    }

    function getUserPreviousBalance(address _user)
        public
        view
        returns (uint256)
    {
        return users[_user].previousBalance;
    }

    function getUserAmountStaked(address _user) public view returns (uint256) {
        return users[_user].amountStaked;
    }

    function getUserTimeGuess(address _user) public view returns (uint256) {
        return users[_user].timeGuess;
    }

    function getUserSecs(address _user) public view returns (uint256) {
        return block.timestamp - users[_user].startDate;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
