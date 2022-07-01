
from scripts.helpful_scripts import *
from brownie import StakeToken, network
from brownie.network.gas.strategies import *
from web3 import Web3
import yaml
import json
import os
import shutil


def deploy_stake_token(front_end_update=False):
    account = get_account()
    gas_strategy = ExponentialScalingStrategy("25 gwei", "50 gwei")
    print(f"deploying gurtoken")
    stakeToken = StakeToken.deploy({"from":account, "gas_price" : gas_strategy},  publish_source = config["networks"][network.show_active()]["verify"])
    # stakeToken.wait(1)
    print(f"deployed token to {stakeToken}")

    if(front_end_update):
        update_front_end()
    return stakeToken



def main():
    deploy_stake_token()