from ctypes import addressof
from brownie import network, config, accounts, Contract
from brownie import MockAVAX
from web3 import Web3
import yaml
import json
import os
import shutil


DECIMALS = 18
STARTING_PRICE = 2000  #starting price of usd/eth 
FUNDING_LINK =0.2 *(10**18)
FORKED_LOCAL_ENVIRORMENTS = ["mainnet-fork", "mainnet-fork-dev"]
LOCAL_BLOCKCHAIN_ENVIRORMENTS = ["development", "ganache-local"]


# If we pass an index, we can pick which account to use from the local blockchain/envirorments
#If we pass an ID, we will be able to use the saved accounts in brownie


def get_account(index=None, id=None):
    if index:
        return accounts[index]
    if id:
        return accounts.load(id)
    if(network.show_active() in LOCAL_BLOCKCHAIN_ENVIRORMENTS) or (network.show_active() in FORKED_LOCAL_ENVIRORMENTS):
        return accounts[0]
    return accounts.add(config["wallets"]["from_key"])

def deploy_mocks():
    account = get_account()
    avaxToken = MockAVAX.deploy({"from" :account})



contract_to_mock = {
        "avax_token": MockAVAX
}


"""Will grab contract addresses from the brownie config or deploy mocks and return either contract
    This is used to make it a lot easier in our deploy.py script to read
"""

def get_contract(contract_name):
    contract_type = contract_to_mock[contract_name]

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRORMENTS:
        if len(contract_type) <= 0:
            deploy_mocks()
        contract = contract_type[-1]
    else:
        contract_address = config["networks"][network.show_active()][contract_name]
        contract = Contract.from_abi(contract_type._name, contract_address, contract_type.abi)
    return contract

# contract_address is the address you want to fund tokens to, account is doing the funding


def fund_with_link(contract_address, account=None,link_token=None, amount=FUNDING_LINK):
    #Set the local variable to the passed variable if it was passed, else just call get account
    account = account if account else get_account()
    link_token = link_token if link_token else get_contract("link_token")

    #if the contract already has more than enough chainlink, dont fund it with anymore
    if link_token.balanceOf(contract_address)<= 2*FUNDING_LINK:
        tx=link_token.transfer(contract_address, amount, {"from":account})
        tx.wait(1)
    
    print("funded with " + str(link_token.balanceOf(contract_address)))

def update_front_end():
    # Send the build folder
    copy_folders_to_front_end("./build", "./front_end/stake-game/src/chain-info")

    # Sending the front end our config in JSON format
    with open("brownie-config.yaml", "r") as brownie_config:
        config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)
        with open("./front_end/stake-game/src/brownie-config.json", "w") as brownie_config_json:
            json.dump(config_dict, brownie_config_json)
    print("Front end updated!")

def copy_folders_to_front_end(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)