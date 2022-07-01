
from scripts.deploys.deploy_gur import deploy_stake_token
from scripts.deploys.deploy_stake_farm import deploy_stake_farm
from scripts.helpful_scripts import *
from brownie import StakeToken, StakeFarm, network, exceptions
import pytest
from web3 import Web3





def test_staking_allowed_and_set_farm():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_stake_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
        

    #Default is closed
    assert farm.stakeAllowed() == False

    #Test if chainges to open
    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)
    assert farm.stakeAllowed() == True

    #Test if changing to closed
    tx = farm.setFarmClosed({"from":account})
    tx.wait(1)
    assert farm.stakeAllowed() == False

    #Testing if nonowner can change it
    with pytest.raises(exceptions.VirtualMachineError):
         tx = farm.stake(1, {"from" : non_owner})
         tx.wait(1)

     #Testing if we can use functions that require the farm to be open
    with pytest.raises(exceptions.VirtualMachineError):
         tx = farm.stake(1, {"from" : account})
         tx.wait(1) 
   
    #Testing if we can close the farm if its already closeds
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.setFarmClosed({"from":account})
        tx.wait(1)
    
    #Testing if we can open the farm if already opened
    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.setFarmOpen({"from":account})
        tx.wait(1)

def test_yield_no_stakers():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_stake_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
    
    #Seeing if default is 1%
    percentYield = farm.yieldPercentNumerator()/farm.yieldPercentDenominator()
    expectedYield = 1.01
    assert percentYield == expectedYield

    #chainging yield and expecting correct result
    tx= farm.setPercent(102, 100, {"from":account})
    tx.wait(1)
    percentYield = farm.yieldPercentNumerator()/farm.yieldPercentDenominator()
    expectedYield = 1.02
    assert percentYield == expectedYield

    #Can non-owner change the percent?
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.setPercent(102, 100, {"from":non_owner})
        tx.wait(1)

    #Testing if it will allow numbers 0 and under
    with pytest.raises(OverflowError):
        tx= farm.setPercent(0, -1, {"from":account})
        tx.wait(1)
       
def test_get_staking_balance():
    pass

def test_staking_function():
    #arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_stake_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")

    #Setup being able to move token
    tokens_given = Web3.toWei(10, "ether")
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":account})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":non_owner})
    tx.wait(1)
    tx = stakeToken.transfer( non_owner.address, tokens_given, {"from":account})
    tx.wait(1)

    #Can't start without the owner saying tis okay
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.stake(tokens_given, {"from":account})
        tx.wait(1)

    #Try to stake 0
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.stake(0, {"from":account})
        tx.wait(1)


    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)
    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)
    tx = farm.stake(tokens_given, {"from":non_owner})
    tx.wait(1)



    #test if the oririnal amount is correct
    assert farm.users(account.address)[0] == tokens_given


    #Test if the farm has increased the amount staked
    total_amount = tokens_given*2
    assert stakeToken.balanceOf(farm.address) == total_amount

    #test if the amounts are correct when staking more
    tx = farm.stake(tokens_given, {"from" : account})
    tx.wait(1)
    assert farm.users(account.address)[0] == 2 * tokens_given
    assert farm.users(account.address)[1] == 2 * tokens_given

def test_unstaking_function():
    #arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_stake_farm()
    non_owner = get_account(1)
    other = get_account(2)

    #Setup being able to move token
    tokens_given = Web3.toWei(10, "ether")
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":account})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":non_owner})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":other})
    tx.wait(1)
    tx = stakeToken.transfer( non_owner.address, tokens_given, {"from":account})
    tx.wait(1)
    tx = stakeToken.transfer( other.address, tokens_given, {"from":account})
    tx.wait(1)
    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)


   #stake both of them
    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)
    tx = farm.stake(tokens_given, {"from":non_owner})
    tx.wait(1)
    
    #unstake when not even staked
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.unstake(Web3.toWei(50, "ether"), {"from":other})
        tx.wait(1)
    #unstake 0
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.unstake(0, {"from":non_owner})
        tx.wait(1)
    # unstake too much
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.unstake(tokens_given + 1, {"from":non_owner})
        tx.wait(1)

    #unstake all and make sure all values are correct
    tx = farm.unstake(tokens_given, {"from":non_owner})
    tx.wait(1)
    amountOriginal = farm.users(non_owner.address)[0]
    amountStaked = farm.users(non_owner.address)[1]
    
    isStaker = farm.isStaker(non_owner.address)
    
    assert amountStaked == 0 
    assert amountOriginal == 0 
    assert isStaker == False
    #Non_owner got his amount back and the farm only has one perons's balance
    assert stakeToken.balanceOf(non_owner.address) == tokens_given
    assert stakeToken.balanceOf(farm.address) == tokens_given


    #unstake some and make sure all values are correct
    tx = farm.stake(tokens_given, {"from":non_owner})
    tx.wait(1)
    tx = farm.unstake(tokens_given/2, {"from":non_owner})
    tx.wait(1)
    amountOriginal = farm.users(non_owner.address)[0]
    amountStaked = farm.users(non_owner.address)[1]
    isStaker = farm.isStaker(non_owner.address)
    
    assert amountStaked == tokens_given/2 
    assert amountOriginal == tokens_given/2
    assert isStaker == True
    #Non_owner got his amount back and the farm only has one perons's balance
    assert stakeToken.balanceOf(non_owner.address) == tokens_given/2
    assert stakeToken.balanceOf(farm.address) == tokens_given*1.5

def test_next_reward_yield():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_stake_farm()
   

    #Setup being able to move token
    tokens_given = Web3.toWei(10, "ether")
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":account})
    tx.wait(1)

    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)
    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)

    assert farm.getNextRewardYield(account.address) == tokens_given *0.01
    
    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)
    assert farm.getNextRewardYield(account.address) == 2*tokens_given *0.01

    tx = farm.setPercent(105, 100, {"from":account})
    tx.wait(1)
    assert farm.getNextRewardYield(account.address) == 2*tokens_given *0.05

def test_set_percent():
     #arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_stake_farm()
    non_owner = get_account(1)
    other = get_account(2)

    #Setup being able to move token
    tokens_given = Web3.toWei(10, "ether")
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":account})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":non_owner})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, 10 * tokens_given, {"from":other})
    tx.wait(1)
    tx = stakeToken.transfer( non_owner.address, 10 *tokens_given, {"from":account})
    tx.wait(1)
    tx = stakeToken.transfer( other.address, 10* tokens_given, {"from":account})
    tx.wait(1)
    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)


    #Numerator cant be 0 or less
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.setPercent(0,1, {"from" :account})
        tx.wait(1)
    #denominator cant be 0 or less
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.setPercent(1,0, {"from" :account})
        tx.wait(1)
    
    #Start start
    tx = farm.stake(tokens_given, {"from":account})
    tx.wait(1)



    tx = farm.stake(2 * tokens_given, {"from":non_owner})
    tx.wait(1)

    assert farm.getStakingBalance(non_owner.address) == 2*tokens_given


    tx = farm.stake(5 * tokens_given, {"from":other})
    tx.wait(1)
    tx = farm.setPercent(102,100, {"from": account})
    tx.wait(1)
    assert farm.users(account.address)[1] == tokens_given
    assert farm.users(account.address)[0] == tokens_given
    assert farm.users(non_owner.address)[1] == 2*tokens_given
    assert farm.users(non_owner.address)[0] == 2*tokens_given
    assert farm.users(other.address)[1] == 5*tokens_given
    assert farm.users(other.address)[0] == 5*tokens_given

    #Change the time
    days = 1
    days_in_secs = days* (24*60*60)+ 300
    tx = farm.setTime(account.address, days_in_secs,{"from":account})
    tx.wait(1)
    tx = farm.setTime(non_owner.address, days_in_secs,{"from":account})
    tx.wait(1)
    tx = farm.setTime(other.address, days_in_secs,{"from":account})
    tx.wait(1)

    assert days == farm.getDaysSinceStart(account.address)


   
    assert farm.yieldPercentNumerator() == 102
    assert farm.yieldPercentDenominator() == 100
    assert farm.getStakingBalance(account.address) == tokens_given*1.02
    
   

    tx = farm.setPercent(105,100, {"from": account})
    tx.wait(1)

    ### Because the previous percent was 2%, we go off that for determining if the new amounts are correct
    ### Because when we change the percentage, we are automatically updating the values previously,
    ## So the new percentage begins the time you call it
    assert farm.users(account.address)[1] == 1.02* tokens_given
    assert farm.users(account.address)[0] ==1.02* tokens_given
    assert farm.users(non_owner.address)[1] ==1.02* 2*tokens_given
    assert farm.users(non_owner.address)[0] ==1.02* 2*tokens_given
    assert farm.users(other.address)[1] ==1.02* 5*tokens_given
    assert farm.users(other.address)[0] ==1.02* 5*tokens_given
    

    