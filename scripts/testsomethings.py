from asyncio.windows_events import INFINITE

from brownie import chain
from scripts.helpful_scripts import *
from scripts.deploys.deploy_stake_farm import *
from scripts.deploys.deploy_risk_farm import *
from scripts.deploys.deploy_speculate_farm import *
from scripts.deploys.deploy_presale import *
from web3 import Web3



TOKENSGIVEN = 10*(10**18)
INFINITE = Web3.toWei(10*18, "ether")
def main():
    account, stake_token,presale , initial_amount = deploy_presale_and_stake_token()
    avax = get_contract("avax_token")
    presale.setAvax(avax.address)
    presale.setPresaleState(True)

    non_owner = get_account(1)

    tx = account.transfer(non_owner,5 * 10**18)
    
    # avax_token.approve(presale.address, Web3.toWei(10**36, "ether"), {"from":account})
    # avax_token.approve(presale.address, Web3.toWei(10**18, "ether"), {"from":non_owner})
    
  
    tokens_given = Web3.toWei(10, "ether")
    
    presale.buy({"from" :account, "amount": 1 })
        


    

 
    # positiveValues =[farm.positives(i) for i in range(3)]
    # positiveChances = [farm.positiveYieldToChance(positiveValues[i]) for i in range(3)]
    # negativeValues =[farm.negatives(i) for i in range(3)]
    # negativeChances = [farm.negativeYieldToChance(negativeValues[i]) for i in range(3)]
    # positiveValues =[positiveValues[i]/decimals for i in range(3)]
    # postiveChances = [positiveChances[i]/decimals for i in range(3)]
    # negativeValues =[negativeValues[i]/decimals for i in range(3)]
    # negativeChances = [negativeChances[i]/decimals for i in range(3)]

    
    # print(positiveValues)
    # print(postiveChances)
    # print(negativeValues)
    # print(negativeChances)
    # tx = stakeToken.approve(farm.address, INFINITE, {"from":account})
    # tx.wait(1)
    # tx = stakeToken.approve(farm.address, INFINITE, {"from":non_owner})
    # tx.wait(1)
    # tx = stakeToken.transfer(non_owner.address, TOKENSGIVEN, {"from":account})
    # tx.wait(1)
    # tx = farm.setFarmOpen({"from":account})
    # tx.wait(1)
    # tx = farm.stake(TOKENSGIVEN, {"from":non_owner})
    # tx.wait(1)

    # farm_amount= stakeToken.balanceOf(farm.address)
    # farm_amount_eth = Web3.fromWei(farm_amount, "ether")
    # print(f"Before, the farm has {farm_amount_eth} Gur Tokens of{farm_amount}" )



    # days = int(2)
    # days_in_secs = days * (60*60*24)
    # date = farm.addressToStartDate(account.address) + days_in_secs
    # tx =farm.setTime(account.address, date +1000, {"from":account})
    # tx.wait(1)
    
    # tx = farm.stake(tokens_given, {"from":account})
    # tx.wait(1)


    # print(f"original stake = {farm.addressToOriginalStake(account.address)}")
    # print(f"Real stake = {farm.addressToAmountStaked(account.address)}")
    # non_owner = get_account(1)
    # tx = stakeToken.approve(farm.address, TOKENSGIVEN, {"from":account})
    # tx.wait(1)
    # tx = stakeToken.approve(farm.address, TOKENSGIVEN, {"from":non_owner})
    # tx.wait(1)
    # tx = stakeToken.transfer(non_owner.address, TOKENSGIVEN, {"from":account})
    # tx.wait(1)
    # tx = farm.setFarmOpen({"from":account})
    # tx.wait(1)

    # amount = Web3.fromWei(stakeToken.balanceOf(account.address),"ether")

    # tx = stakeToken.mint(account.address, stakeToken.totalSupply(), {"from":account})
    # tx.wait(1)
    # print(f"account has {stakeToken.balanceOf(account.address)}")
    # print(f"Farm is a minter : {stakeToken.minters(farm.address)}")
    # tx = stakeToken.addMinter(farm.address, {"from":account})
    # tx.wait(1)
    # print("farm is now a minter")
    # print(f"Farm is a minter : {stakeToken.minters(farm.address)}, but only has {stakeToken.balanceOf(farm.address)} tokens")
    # tx = stakeToken.mint(farm.address, stakeToken.totalSupply(), {"from":farm})
    # tx.wait(1)
    # print(f"farm has {stakeToken.balanceOf(farm.address)}")

    # print(f"account has {amount} tokens before staking")
    # tx = farm.stake(TOKENSGIVEN, {"from":account})
    # tx.wait(1)
    # amount = Web3.fromWei(stakeToken.balanceOf(account.address),"ether")
    # farmAmount = Web3.fromWei(stakeToken.balanceOf(farm.address),"ether")
    # print(f"account has {amount} tokens after staking,farm has{farmAmount} ")
    
    # amount = Web3.fromWei(farm.getStakingBalance(account.address, {"from" :account}), "ether")
    # timeInSecs = farm.getSecsSinceStart(account.address, {"from" :account}) 
    # timeInDays = farm.getDaysSinceStart(account.address, {"from" :account}) 
    # nextReward =  Web3.fromWei(farm.getNextRewardYield({"from" :account}), "ether") 
    # print(f"The account has {amount} staked \nfor {timeInSecs} seconds\n or {timeInDays} days \nthe next reward is {nextReward}")



    # tx = farm.stake(TOKENSGIVEN, {"from":non_owner})
    # tx.wait(1)
    # amount = Web3.fromWei(farm.getStakingBalance(account.address, {"from" :account}), "ether")
    # timeInSecs = farm.getSecsSinceStart(account.address, {"from" :account}) 
    # timeInDays = farm.getDaysSinceStart(account.address, {"from" :account}) 
    # nextReward =  Web3.fromWei(farm.getNextRewardYield({"from" :account}), "ether") 
    # print(f"The account has {amount} staked \nfor {timeInSecs} seconds\n or {timeInDays} days \nthe next reward is {nextReward}")