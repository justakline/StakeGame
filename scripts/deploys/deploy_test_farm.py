
from scripts.deploys.deploy_gur import deploy_stake_token
from scripts.helpful_scripts import *
from brownie import StakeToken, network, TestFarm
# from interfaces. import ERC20Mock
from brownie.network.gas.strategies import *
from web3 import Web3
import yaml
import json
import os
import shutil

def deploy_test_farm(front_end_update=False):
    account = get_account()

    if(len(StakeToken) > 0):
        stakeToken = StakeToken[-1]
    else : 
        stakeToken = deploy_stake_token()
    print(f"Deploying Farm")
    initial_amount= 100*10**18
    # if(network.show_active() == 'avax-main'):
    #     avax_token = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
    # elif(network.show_active() == 'avax-test'):
    #     avax_token = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
    # else:
    #     avax_token = mock_avax(account, initial_amount)
    gas_strategy = ExponentialScalingStrategy("25 gwei", "50 gwei")
    test_farm = TestFarm.deploy( stakeToken.address,{"from":account, "gas_price" : gas_strategy}, publish_source = config["networks"][network.show_active()]["verify"])
    print(f"Deployed Farm to {test_farm}")
    tx = stakeToken.addMinter(test_farm.address, {"from":account, "gas_price" : gas_strategy})
    tx.wait(1)
    tx = stakeToken.approve(test_farm.address, Web3.toWei(10**18, "ether"), {"from":account, "gas_price" : gas_strategy})
    tx.wait(1)

    print("Funding Farm")
    fund_farm(account, test_farm)
    print("Farm Funded")
    if(front_end_update):
        update_front_end()
    return account, stakeToken, test_farm

def deploy_test_farm_and_stake_token(front_end_update=False):
    account = get_account()
    stakeToken = deploy_stake_token()
    initial_amount= 100*10**18
    print("Deploying Farm")
    # if(network.show_active() == 'avax-main'):
    #     avax_token = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
    # elif(network.show_active() == 'avax-test'):
    #     avax_token = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
    # else:
    #     avax_token = mock_avax(account, initial_amount)
    avax_token = get_contract("avax_token")
    test_farm = TestFarm.deploy(stakeToken.address,{"from":account}, publish_source = config["networks"][network.show_active()]["verify"])
    tx = stakeToken.addMinter(test_farm.address, {"from":account})
    tx = stakeToken.approve(test_farm.address, Web3.toWei(10**36, "ether"), {"from":account})

    print("Funding Farm")
    # fund_farm(account, test_farm)
    print("Farm Funded")
    if(front_end_update):
        update_front_end()
    return account, stakeToken, test_farm, initial_amount


def fund_farm(account, farm):
    amount= Web3.toWei(0.1, "ether")
    tx = account.transfer(farm.address, "0.2 ether")
    tx.wait(1)



def mock_avax(account, initial_amount):
    pass

def main():
    deploy_test_farm_and_stake_token()