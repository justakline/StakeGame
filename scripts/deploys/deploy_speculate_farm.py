
from scripts.deploys.deploy_gur import deploy_stake_token
from scripts.helpful_scripts import *
from brownie import StakeToken, SpeculateFarm, network
from brownie.network.gas.strategies import *
import yaml
import json
import os
import shutil


def deploy_speculate_farm(front_end_update=False):
    account = get_account()
    if(len(StakeToken) > 0):
        stakeToken = StakeToken[-1]
    else : 
        stakeToken = deploy_stake_token()
    gas_strategy = ExponentialScalingStrategy("25 gwei", "50 gwei")
    print(f"Deploying Farm")
    farm = SpeculateFarm.deploy(stakeToken.address, {"from":account, "gas_price" : gas_strategy}, publish_source = config["networks"][network.show_active()]["verify"])
    print(f"Deployed Farm to {farm}")
    tx = stakeToken.addMinter(farm.address, {"from":account, "gas_price" : gas_strategy})
    tx.wait(1)
    tx = stakeToken.approve(farm.address, Web3.toWei(10**18, "ether"), {"from":account, "gas_price" : gas_strategy})
    tx.wait(1)
    print("Funding Farm")
    fund_farm(account, farm)
    print("Farm Funded")
    if(front_end_update):
        update_front_end()
    return account, stakeToken, farm

def deploy_speculate_farm_and_stake_token(front_end_update=False):
    account = get_account()
    stakeToken = deploy_stake_token()
    print("Deploying Farm")
    farm = SpeculateFarm.deploy(stakeToken.address, {"from":account}, publish_source = config["networks"][network.show_active()]["verify"])
    print(f"Deployed Farm to {farm}")
    tx = stakeToken.addMinter(farm.address, {"from":account})
    tx.wait(1)
    print(f"the farm is a minter? -- {stakeToken.minters(farm.address)}")
    tx = stakeToken.approve(farm.address, Web3.toWei(10**18, "ether"), {"from":account})
    tx.wait(1)
    print("Funding Farm")
    fund_farm(account, farm)
    print("Farm Funded")
    if(front_end_update):
        update_front_end()
    return account, stakeToken, farm


def fund_farm(account, farm):
    amount= Web3.toWei(0.2, "ether")
    tx = account.transfer(farm.address, "0.2 ether")
    tx.wait(1)



def main():
    deploy_speculate_farm_and_stake_token()