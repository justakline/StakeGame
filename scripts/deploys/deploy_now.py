



from scripts.deploys.deploy_gur import deploy_stake_token
from scripts.deploys.deploy_presale import deploy_presale
from scripts.deploys.deploy_speculate_farm import deploy_speculate_farm
from scripts.deploys.deploy_risk_farm import deploy_risk_farm
from scripts.deploys.deploy_stake_farm import deploy_stake_farm
from scripts.deploys.deploy_test_farm import deploy_test_farm
from scripts.helpful_scripts import *
from brownie import StakeFarm, StakeToken, SpeculateFarm, RiskFarm, Presale, TestFarm
from brownie.network.gas.strategies import *
from web3 import Web3


def main():
    # deploy_stake_token(True)
    # deploy_presale(True)
    # deploy_speculate_farm(True)
    # deploy_risk_farm(True)
    # deploy_stake_farm(True)
    # deploy_test_farm(True)
    # update_front_end()
    presale = Presale[-1]
    print(presale.isOpen())

    # gas_strategy = ExponentialScalingStrategy("25 gwei", "100 gwei")
    # print(RiskFarm)
    # speculateFarm = SpeculateFarm[-1]
    # riskFarm = RiskFarm[-1]
    # stakeToken = StakeToken[-1]
    # account = get_account()
    # tx = farm.setFarmOpen({"from":account, "gas_price" : gas_strategy})
    # tx.wait(1)
    # amount  = Web3.toWei(100, "ether")
    # tx = riskFarm.setFarmOpen( {"from":account, "gas_price":gas_strategy})
    # tx.wait(1)
    # tx = riskFarm.setTeam( account.address, {"from":account, "gas_price":gas_strategy})
    # tx.wait(1)



    # tx = speculateFarm.setFarmOpen({"from":account, "gas_price":gas_strategy})
    # tx.wait(1)
    # tx = speculateFarm.setTeam( account.address, {"from":account, "gas_price":gas_strategy})
    # tx.wait(1)

    # tx=speculateFarm.stake(amount, 60,  {"from":account, "gas_price":gas_strategy})
    # tx.wait(1)


    # allowed = farm.testingAllowed()
    # print(allowed)
    # tx = farm.setTestingAllowed(True, {"from":account, "gas_price":gas_strategy})
    # tx.wait(1)
    # tx =  stakeToken.mint(account.address, Web3.toWei(10000, "ether"), {"from":account})
    # tx.wait(1)

    # tx = farm.setPresaleState(True, {"from":account, "gas_price" : gas_strategy})
    # tx.wait(1)

    # users = farm.users(account.address)
    # print(users)
    # print(farm.getUserSecsUntilRebase(account.address))

    # tx = farm.stake(amount, 10, {"from":account, "gas_price" : gas_strategy})
    # tx.wait(1)
   
    # tx = farm.stake(amount, {"from":account, "gas_price" : gas_strategy})
    # tx.wait(1)

    # tx = farm.sendPartialFunds(Web3.toWei(0.1, "ether"), {"from":account, "gas_price" : gas_strategy})
    # tx.wait(1)

    # print(tx)
    # print(timeGuess)
