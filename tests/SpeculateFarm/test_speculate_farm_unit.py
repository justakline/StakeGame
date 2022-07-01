
import math


from scripts.deploys.deploy_gur import deploy_stake_token
from scripts.deploys.deploy_speculate_farm import deploy_speculate_farm
from scripts.helpful_scripts import *
from brownie import StakeToken, SpeculateFarm, network, exceptions
import pytest
from web3 import Web3
from brownie import chain, Contract



def test_new_function():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_speculate_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
    
    tokens_given = Web3.toWei(100, "ether")
    
    stakeToken.mint(account, tokens_given*100, {"from":account})

    tx = farm.setFarmOpen({"from" :account})
    tx.wait(1)
    totalAmount = stakeToken.balanceOf(account.address)
   
    tx= farm.stake(tokens_given,1, {"from":account})
    tx.wait(1)
    time = farm.randomNumber()/60
    assert time >= 1 
    assert Web3.fromWei(farm.users(account.address)[0], "ether") <=0
    assert Web3.fromWei(farm.users(account.address)[0], "ether") >=0.0001 +378.58




def test_unstake_function():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_speculate_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
    
    tokens_given = Web3.toWei(100, "ether")
    


    tx = farm.setFarmOpen({"from" :account})
    tx.wait(1)
    totalAmount = stakeToken.balanceOf(account.address)
   
    tx= farm.stake(tokens_given,60, {"from":account})
    tx.wait(1)

    assert farm.users(account.address)[0] == tokens_given*0.1
    assert farm.users(account.address)[1] == tokens_given
    assert farm.users(account.address)[2] <= chain.time()
    assert stakeToken.balanceOf(account.address) ==totalAmount - tokens_given

    #can we unstake immedietly?
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.unstake(tokens_given*0.1, {"from":account})
    
    #After half alloted time has passed
    chain.sleep(1*60*60/2)
    chain.mine()

    #Can't unstake during game
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.unstake(20, {"from":account})
    
    #Full alloted time passed
    chain.sleep(1*60*60/2)
    chain.mine()
    #Unstake 0?
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.unstake(0, {"from":account})
    #Unstake > amount staked?
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.unstake(tokens_given*10, {"from":account})
    
    #values correct?
    tx= farm.unstake(tokens_given*0.1, {"from":account})
    tx.wait(1)

    assert farm.users(account.address)[0] ==0
    assert farm.users(account.address)[1] ==0
    assert stakeToken.balanceOf(account.address) ==  totalAmount - tokens_given + tokens_given*0.1


def test_restake_function():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_speculate_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
    
    tokens_given = Web3.toWei(100, "ether")


    #can't stake if farm not open
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.restake(30, {"from":account})

    tx = farm.setFarmOpen({"from" :account})
    tx.wait(1)

    #can't restake without enough time passing
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.restake(30, {"from":account})

    #can't restake 0 
    tx = farm.stake(tokens_given, 60,{"from":account})
    tx.wait(1)
    chain.sleep(1*60*60)
    chain.mine()
    tx = farm.unstake(tokens_given/10,{"from":account})
    tx.wait(1)
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.restake(30, {"from":account})

    #Test if values are correct
    tx = farm.stake(tokens_given, 60,{"from":account})
    tx.wait(1)
    chain.sleep(1*60*60)
    chain.mine()
    tx = farm.unstake(tokens_given/20,{"from":account}) #Leaving us with tokens_given/20
    tx.wait(1)
    tx = farm.restake(60, {"from" :account}) #Should elave us with (tokens_give/20)/10 = tokens_given/200
    tx.wait(1)
    assert farm.users(account.address)[0] == tokens_given/200
    assert farm.users(account.address)[1] == tokens_given/20 #The previous stake
    assert abs(farm.users(account.address)[2] - chain.time()) <=10



def test_stake_function():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_speculate_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
    
    tokens_given = Web3.toWei(100, "ether")


    #can't stake if farm not open
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.stake(tokens_given,3, {"from":account})

    tx = farm.setFarmOpen({"from" :account})
    tx.wait(1)

    #Can't stake 0
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.stake(0,1, {"from":account})
        #Can't stake more than you have
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.stake(stakeToken.totalSupply()*2,1, {"from":account})

    #Can't guess <1
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.stake(tokens_given,0, {"from":account})
    #Can't guess >60
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.stake(tokens_given,61, {"from":account})

    #test if ammounts are correct, not including _amountStaked because we calculate new balance immedietly
    #Using a random number
    totalAmount = stakeToken.balanceOf(account.address)
   
    tx= farm.stake(tokens_given,59, {"from":account})
    tx.wait(1)

    assert farm.users(account.address)[0] == tokens_given*0.1
    assert farm.users(account.address)[1] == tokens_given
    assert farm.users(account.address)[2] <= chain.time()
    assert stakeToken.balanceOf(account.address) ==totalAmount - tokens_given

    #can we restake immedietly?
    # assert tx.events == 0
    # assert farm.users(account.address)[0] != 0
    with pytest.raises(exceptions.VirtualMachineError):
        tx= farm.stake(tokens_given,20, {"from":account})
    
    #After alloted time has passed, can we add more?

    chain.sleep(1*60*60)
    chain.mine()
    tx= farm.stake(tokens_given,20, {"from":account})
    tx.wait(1)
    assert stakeToken.balanceOf(account.address) ==totalAmount - 2*tokens_given


def test_calculate_earnings():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_speculate_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")


    tokens_given =Web3.toWei(100, "ether")
    tx = farm.setFarmOpen({"from" :account})
    tx.wait(1)
    tx = farm.setUser(tokens_given,tokens_given , {"from" :account})
    tx.wait(1)

    #The person guessed later than the rug
    tx = farm.testCalculateEarnings(30,20, {"from" :account})
    tx.wait(1)
    real_value = tx.return_value
    assert real_value == 0.1 * tokens_given

    #Person guessed within the first 30 mins
    tx = farm.setUser(tokens_given,tokens_given , {"from" :account})
    tx.wait(1)
    tx = farm.testCalculateEarnings(20,30, {"from" :account})
    tx.wait(1)
    real_value = tx.return_value
    expected_value = tokens_given +(2*tokens_given*20)/100 #should be 140 *10**18... 100 +(2*100*20)/100
    assert  abs(real_value - expected_value) <1*10**3

    #Person guessed within the last 30 mins
    tx = farm.setUser(tokens_given,tokens_given , {"from" :account})
    tx.wait(1)
    tx = farm.testCalculateEarnings(40,50, {"from" :account})
    tx.wait(1)
    real_value = tx.return_value
    expected_value = ((tokens_given*(40**2))/400)-65 #should be 140 *10**18... 100 +(2*100*20)/100
    assert  abs(real_value - expected_value) <1*10**3

    


def test_set_rug_min_and_set_divs():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_speculate_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
    
    tx = farm.setFarmOpen({"from" :account})
    tx.wait(1)

    #Tested setrugmin somewhere else

    #Can non-owner change it?
    with pytest.raises(exceptions.VirtualMachineError):
        tx = farm.setDivs(30, 60, {"from":non_owner})
        tx.wait(1)

    
    tx = farm.setDivs(30, 60, {"from":account})
    tx.wait(1)

    assert farm.div30() == 30 and farm.div60() == 60


        

   

        

def test_staking_allowed_and_set_farm():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        pytest.skip("only for local testing ")
    account, stakeToken, farm = deploy_speculate_farm()
    non_owner = get_account(1)
    if(non_owner == account ):
        raise Exception("The accounts are the same")
        

    #Default is closed
    assert farm.speculateAllowed() == False

    #Test if chainges to open
    tx = farm.setFarmOpen({"from":account})
    tx.wait(1)
    assert farm.speculateAllowed() == True

    #Test if changing to closed
    tx = farm.setFarmClosed({"from":account})
    tx.wait(1)
    assert farm.speculateAllowed() == False

    #Testing if nonowner can change it
    with pytest.raises(exceptions.VirtualMachineError):
         tx = farm.setFarmOpen( {"from" : non_owner})
         tx.wait(1)


     #Testing if we can use functions that require the farm to be open
    with pytest.raises(exceptions.VirtualMachineError):
         tx = farm.stake(1,30, {"from" : account})
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