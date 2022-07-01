

from scripts.deploys.deploy_gur import deploy_stake_token
from scripts.deploys.deploy_presale import *

from scripts.helpful_scripts import *
from brownie import StakeToken, StakeFarm, chain, network, exceptions
import pytest
from web3 import Web3

def test_presale_state():
    account, stake_token, presale, initial_amount = deploy_presale_and_stake_token()

    non_owner = get_account(1)

    stake_token.approve(presale.address, Web3.toWei(10**18, "ether"), {"from":account})
    stake_token.approve(presale.address, Web3.toWei(10**18, "ether"), {"from":non_owner})
    tokens_given = Web3.toWei(10, "ether")

    
    #Farm not open can't buy
    with pytest.raises(exceptions.VirtualMachineError):
        presale.buy(1, {"from" : non_owner, "amount" : initial_amount })

    #non_owner can't open the presale
    with pytest.raises(exceptions.VirtualMachineError):
        tx = presale.setPresaleState(True, {"from" :non_owner})
    
    tx = presale.setPresaleState(True, {"from" :account})
    tx.wait(1)
    
    #Can't buy 0
    with pytest.raises(exceptions.VirtualMachineError):
        tx = presale.buy( 0, {"from":account , "amount" : 0})
    #Can't buy more than the max
    with pytest.raises(exceptions.VirtualMachineError):
        tx = presale.buy(  presale.maxAvax()+1,{"from":account, "amount" : presale.maxAvax()+1})


    balanceBefore = account.balance()
    tx = presale.buy(  presale.maxAvax(), {"from":account, "amount" : presale.maxAvax()})
    #Make sure the amounts are correct

    #account AVAX balance changes
    assert(account.balance() == balanceBefore-presale.maxAvax())
    #Account balance Changes
    assert(stake_token.balanceOf(account.address) == presale.maxAvax()*100)
    #Contract AVAX changes ... add 0.5 avax because we fund the contract
    assert(presale.balance() == presale.maxAvax() + Web3.toWei(0.5, "ether"))

    #Now try adding some and then adding more

    balanceBefore = non_owner.balance()
    tx = presale.buy( presale.maxAvax()/2, {"from":non_owner, "amount" : presale.maxAvax()/2})
    
    #Can we buy too much?
    with pytest.raises(exceptions.VirtualMachineError):
        tx = presale.buy( presale.maxAvax() , {"from":non_owner, "amount" : presale.maxAvax()/2})

    tx = presale.buy( presale.maxAvax()/2, {"from":non_owner, "amount" : presale.maxAvax()/2})

     #account AVAX balance changes
    assert(non_owner.balance() == balanceBefore-presale.maxAvax())
    #Account balance Changes
    assert(stake_token.balanceOf(non_owner.address) == presale.maxAvax()*100)
    #Contract AVAX changes ... add 0.5 avax because we fund the contract
    assert(presale.balance() == (2*presale.maxAvax()) + Web3.toWei(0.5, "ether"))

    #sending funds back now
    with pytest.raises(exceptions.VirtualMachineError):
        tx = presale.sendPartialFunds(presale.maxAvax(), {"from" : non_owner})
    with pytest.raises(exceptions.VirtualMachineError):
        tx = presale.sendPartialFunds(presale.balance() +1, {"from" : account})

    balanceBefore = account.balance()
    contractBalanceBefore = presale.balance()
    tx = presale.sendPartialFunds(presale.maxAvax(), {"from" : account})

    #account changed correctly
    assert(account.balance() == balanceBefore + presale.maxAvax())
    #contract changed correctly
    assert(presale.balance() == contractBalanceBefore - presale.maxAvax())

    balanceBefore = account.balance()
    contractBalanceBefore = presale.balance()
    tx = presale.sendFunds({"from" : account})

    assert(account.balance() == balanceBefore + contractBalanceBefore)
    #contract changed correctly
    assert(presale.balance() == 0)



    