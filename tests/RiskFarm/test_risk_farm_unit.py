
from scripts.deploys.deploy_gur import deploy_stake_token
from scripts.deploys.deploy_risk_farm import deploy_risk_farm_and_stake_token
from scripts.deploys.deploy_stake_farm import deploy_stake_farm
from scripts.helpful_scripts import *
from brownie import StakeToken, StakeFarm, chain, network, exceptions
import pytest
from web3 import Web3


### 
# Finished testing setting the farm state, testing the positive and
# negative values for the chance and yields, and 
# calcualting the new balance based on putting in specific fields ### 



def test_unstake_function():
    account, stakeToken, farm = deploy_risk_farm_and_stake_token()
    non_owner = get_account(1)
    tokens_given = Web3.toWei(10, "ether")
    decimals = farm.decimals()
    tx = stakeToken.mint(non_owner.address, tokens_given, {"from":account})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, tokens_given*10000, {"from":non_owner})
    tx.wait(1)

    
    #Can we unstake when the farm is closed?
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.unstake(tokens_given, {"from":account})
        tx.wait(1)


    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)

    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)

    #Can we unstake 0
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.unstake(0, {"from":account})
        tx.wait(1)
    #Can we unstake more than what you staked
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.unstake(2 * tokens_given, {"from":account})
        tx.wait(1)


    tx = farm.unstake(tokens_given/2, {"from":account})
    tx.wait(1)

    #Are the values correct after unstaking a PARTIAL amount BEFORE THE TIME IS UP
    assert farm.users(account.address)[0] == tokens_given/2
    assert farm.users(account.address)[1] == tokens_given/2
    assert chain.time() - farm.users(account.address)[2] <= 20 #make sure they are basically the same
    assert stakeToken.balanceOf(account.address) == (stakeToken.totalSupply() -stakeToken.balanceOf(non_owner.address))

    tx = farm.unstake(tokens_given/2, {"from":account})
    tx.wait(1)

    #Are the values correct after unstaking a TOTAL amount BEFORE THE TIME IS UP
    assert farm.users(account.address)[0] == 0
    assert farm.users(account.address)[1] == 0
    assert chain.time() - farm.users(account.address)[2] <= 20 #make sure they are basically the same
    assert stakeToken.balanceOf(account.address) == (stakeToken.totalSupply() -stakeToken.balanceOf(non_owner.address))


    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)

    days = 1
    daysInSecs = days * (60*60*24)+300

    timeBefore = chain.time()
    chain.sleep(daysInSecs)
    chain.mine()

    assert farm.canClaim({"from" : account})

    tx = farm.testUnstake(tokens_given/2, {"from":account})
    tx.wait(1)

    #Are the values correct after unstaking a PARTIAL amount AFTER THE TIME IS UP
    assert farm.users(account.address)[0] == (tokens_given*1.01)- tokens_given/2
    assert farm.users(account.address)[1] == (tokens_given*1.01)- tokens_given/2
    assert chain.time() - farm.users(account.address)[2] <= 20 #make sure they are basically the same
    assert stakeToken.balanceOf(account.address) == (stakeToken.totalSupply() -stakeToken.balanceOf(non_owner.address))
    tx = farm.testUnstake(tokens_given/2, {"from":account})
    tx.wait(1)



    tx = farm.stake(tokens_given, {"from":non_owner})
    tx.wait(1)
    assert farm.users(non_owner.address)[0] == tokens_given
    chain.sleep(daysInSecs)
    chain.mine()
    assert farm.canClaim({"from" : non_owner})

    
    tx = farm.testUnstake(tokens_given, {"from":non_owner})
    tx.wait(1)

    #Are the values correct after unstaking a Full amount AFTER THE TIME IS UP
    assert farm.users(non_owner.address)[0] == 1.01 * tokens_given - tokens_given
    assert farm.users(non_owner.address)[1] == 1.01 * tokens_given - tokens_given
    assert chain.time() - farm.users(non_owner.address)[2] <= 20 #make sure they are basically the same
    assert stakeToken.balanceOf(non_owner.address) == tokens_given

    


def test_stake_function():
    account, stakeToken, farm = deploy_risk_farm_and_stake_token()
    non_owner = get_account(1)
    tokens_given = Web3.toWei(10, "ether")
    decimals = farm.decimals()
    tx = stakeToken.mint(non_owner.address, tokens_given*10, {"from":account})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, tokens_given*10000, {"from":non_owner})
    tx.wait(1)



    #Can we stake when the farm is closed?
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.stake(tokens_given, {"from":account})
        tx.wait(1)


    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)

    #Can we stake more than we have?
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.stake(tokens_given *100, {"from":non_owner})
        tx.wait(1)

    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)

    #When initially staking, are the amounts correct?
    #[0] = amount staked
    #[1] = previous Balance
    #[2] = startDate
    assert farm.users(account.address)[0] == tokens_given
    assert farm.users(account.address)[1] == tokens_given
    assert chain.time() - farm.users(account.address)[2] <= 20 #make sure they are basically the same
    assert stakeToken.balanceOf(account.address) == (stakeToken.totalSupply() -stakeToken.balanceOf(non_owner.address)) - tokens_given

    #Can we stake more tokens from the same account and have the values be correct?
    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)
    assert farm.users(account.address)[0] == 2* tokens_given
    assert farm.users(account.address)[1] == 2* tokens_given
    assert chain.time() - farm.users(account.address)[2] <= 20 #make sure they are basically the same
    assert stakeToken.balanceOf(account.address) == (stakeToken.totalSupply() -stakeToken.balanceOf(non_owner.address)) - 2*tokens_given

    #Will the farm values be correct if a new person stakes?
    tx = farm.stake(tokens_given, {"from":non_owner})
    tx.wait(1)
    assert farm.users(non_owner.address)[0] ==  tokens_given
    assert farm.users(non_owner.address)[1] ==  tokens_given
    assert chain.time() - farm.users(non_owner.address)[2] <= 20 #make sure they are basically the same
    assert stakeToken.balanceOf(non_owner.address) == ((stakeToken.totalSupply() -stakeToken.balanceOf(account.address)))


def test_calculate_new_balance():
    account, stakeToken, farm = deploy_risk_farm_and_stake_token()
    non_owner = get_account(1)
    tokens_given = Web3.toWei(10, "ether")
    decimals = farm.decimals()



    positiveValues =[farm.positives(i) for i in range(3)]
    positiveChances = [farm.positiveYieldToChance(positiveValues[i]) for i in range(3)]
    negativeValues =[farm.negatives(i) for i in range(3)]
    negativeChances = [farm.negativeYieldToChance(negativeValues[i]) for i in range(3)]

    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)

    tx = farm.stake(tokens_given, {"from" :account})
    tx.wait(1)

    tx = farm.testCalaculateNewBalance(True, False, False, False, False, False)
    tx.wait(1)
    new_balance = farm.users(account.address)[0]
    # expectedBalance = (1 + (positiveValues[0]/decimals)/100) * tokens_given # 1% *10 ... should be 10.1
    expectedBalance = Web3.toWei(10.1, "ether")
    assert new_balance == expectedBalance

    balance = new_balance
    tx = farm.testCalaculateNewBalance(False, False, False, True, False, False)
    tx.wait(1)
    new_balance = farm.users(account.address)[0]
    expectedBalance = (balance - balance *(negativeValues[0]/decimals)/100)  # 1% *10 ... should be 10.1
    assert new_balance == expectedBalance


def test_set_positives_and_negatives():
    account, stakeToken, farm = deploy_risk_farm_and_stake_token()
    non_owner = get_account(1)
    tokens_given = Web3.toWei(10, "ether")
    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)

    decimals = farm.decimals()

    positiveValues =[farm.positives(i) for i in range(3)]
    positiveChances = [farm.positiveYieldToChance(positiveValues[i]) for i in range(3)]
    negativeValues =[farm.negatives(i) for i in range(3)]
    negativeChances = [farm.negativeYieldToChance(negativeValues[i]) for i in range(3)]
   
    expectedPositiveValues = [1 * decimals, 10* decimals, 100* decimals]
    expectedPositiveChances = [50* decimals, 10* decimals, 1* decimals]
    expectedNegativeValues = [10* decimals, 30* decimals, 90* decimals]
    expectedNegativeChances = [5* decimals, 1* decimals, 0.1* decimals]

    #test original state
    assert positiveValues == expectedPositiveValues
    assert positiveChances == expectedPositiveChances
    assert negativeValues == expectedNegativeValues
    assert negativeChances == expectedNegativeChances


    #Can't be 0 or less.. did test with negative and leads to an overflow error
    with pytest.raises(exceptions.VirtualMachineError or OverflowError):
        tx = farm.setPositives(0* decimals,10* decimals, 20* decimals, 5* decimals, 50* decimals, 0.2* decimals, {"from":account})
        tx.wait(1)
  

    #Change state and see if it is what we expect
    tx = farm.setPositives(2* decimals,10* decimals, 20* decimals, 5* decimals, 50* decimals, 0.2* decimals, {"from":account})
    tx.wait(1)
    tx = farm.setNegatives(2* decimals,10* decimals, 20* decimals, 5* decimals, 50* decimals, 0.2* decimals, {"from":account})
    tx.wait(1)

    positiveValues =[farm.positives(i) for i in range(3)]
    positiveChances = [farm.positiveYieldToChance(positiveValues[i]) for i in range(3)]
    negativeValues =[farm.negatives(i) for i in range(3)]
    negativeChances = [farm.negativeYieldToChance(negativeValues[i]) for i in range(3)]
 
   
    expectedPositiveValues = [2 * decimals, 20* decimals, 50* decimals]
    expectedPositiveChances = [10* decimals, 5* decimals, 0.2* decimals]
    expectedNegativeValues = [2 * decimals, 20* decimals, 50* decimals]
    expectedNegativeChances =[10* decimals, 5* decimals, 0.2* decimals]

    #if new values are what we want
    assert positiveValues == expectedPositiveValues
    assert positiveChances == expectedPositiveChances
    assert negativeValues == expectedNegativeValues
    assert negativeChances == expectedNegativeChances



def test_risk_state():

    account, stakeToken, farm = deploy_risk_farm_and_stake_token()
    non_owner = get_account(1)

    tokens_given = Web3.toWei(10, "ether")

    #default closed
    assert farm.riskAllowed() == False

    #can't set farm closed if closed
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.setFarmClosed({"from" : account})
        tx.wait(1)

    #Testing if the require statement about having farm open is working
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.stake(tokens_given,{"from" : account})
        tx.wait(1)

    #Value change happened
    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)
    assert farm.riskAllowed() == True
    
    #Set farm open cannot happen if it is already open
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.setFarmOpen({"from" : account})
        tx.wait(1)

    #RiskingAllowed modifyer is working
    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)
    assert farm.isStaker(account.address, {"from":account})
