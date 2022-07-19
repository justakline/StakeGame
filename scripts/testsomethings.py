from asyncio.windows_events import INFINITE

from brownie import chain
from scripts.helpful_scripts import *
from scripts.deploys.deploy_stake_farm import *
from scripts.deploys.deploy_risk_farm import *
from scripts.deploys.deploy_speculate_farm import *
from scripts.deploys.deploy_presale import *
from web3 import Web3
import math



TOKENSGIVEN = 10*(10**18)
INFINITE = Web3.toWei(10*18, "ether")
def calculateShowBalance(previousBalance, realBalance, minsSinceStart, timeGuess):

    if(minsSinceStart==-1):
        return realBalance
    

    if(minsSinceStart> timeGuess):
        return realBalance
    


    if(minsSinceStart<20):
        return (math.trunc((previousBalance *((((minsSinceStart)**2)/16)+100)/100) *1000000))/1000000

    elif(minsSinceStart<40):
        return (math.trunc((previousBalance * ( (((minsSinceStart)**2)/7)+68)/100) *1000000))/1000000
    
    return (math.trunc((previousBalance *((((minsSinceStart)**2)/2)-503)/100)*1000000 ))/1000000

def main():

    # account, stake_token,presale , initial_amount = deploy_presale_and_stake_token()
    # avax = get_contract("avax_token")
    # presale.setAvax(avax.address)
    # presale.setPresaleState(True)

    # non_owner = get_account(1)
    print("IM")
    account = get_account()
    
    # print(account.address)

    # tx = account.transfer(non_owner,5 * 10**18)
    token = StakeToken[-1]
    farms = [StakeFarm[-1], RiskFarm[-1], SpeculateFarm[-1]]
    dontIncludeAddressess =["0x68dDfafA2cB713377fCFadBAc41c7EEA0fC3FAD7".lower(),
                            "0x89f868dDB4246c51C2c4Cbf83F65855B7Cc23AD8".lower(),
                            "0xaADAB4c70d112ef223FB293F746CDa474Cb5b527".lower(),
                            "0x723064cB7336aF1f62170548B339bd165e3bd3e2".lower(),
                            "0x0A53D390E9C81b4a33523f9Eb1dECd7881F15f48".lower(),
                            "0xA98Dc8e17d640CC6B99E66ed0fea88e3a6Ae477E".lower(),
                            "0x5182eC780d496fa03b1e062759ff7A74970D70ce".lower(),
                            "0x1914AFBeB1dF721B8bA07da40DE0532E782d0190".lower(),
                            "0x07bb4D3Db890Df30644844a4f39FF3ef58a121C1".lower()
                            ]
    addresses = ["0x89f868ddb4246c51c2c4cbf83f65855b7cc23ad8",
    "0x0000000000000000000000000000000000000000",
    "0x68ddfafa2cb713377fcfadbac41c7eea0fc3fad7",
    "0xaadab4c70d112ef223fb293f746cda474cb5b527",
    "0x07bb4d3db890df30644844a4f39ff3ef58a121c1",
    "0x723064cb7336af1f62170548b339bd165e3bd3e2",
    "0xf590c9aca3090ef803c5763c01d97b701e9c5efa",
    "0x024addbb065168e4b67ac24192334170430c935b",
    "0x5edaa05efb7ddc0e716d0503853e6d4c8ef9e58b",
    "0xdd4f143cc09915f863434580368aa83d94a55129",
    "0x0bef49a82a78c579197894d9e991faa5e0483ed1",
    "0x0a53d390e9c81b4a33523f9eb1decd7881f15f48",
    "0x54e59022bd84fa35b3744bf66d46b5136cb768d2",
    "0x18b738e90b6e965334e7bc4ed3a027b755de413d",
    "0x2b6695e47af45cf8cc540584ddc78fdc85722c7e",
    "0xb9d5bdf2e6c1c49e59469bfba3d65182a34a07ba",
    "0x4acbd391babd33dd10a029573efb33f09be5395d"
    ]

    top5 = [["", 0],["", 0],["", 0],["", 0],["", 0], ]

    max2 = [0,0]
    maxAddress2 = ["",""]
    for i in range(len(addresses)):
        address = addresses[i]
        if(address not in dontIncludeAddressess):
            amount = 0

            amount += farms[0].getStakingBalance(address)#Stake
            amount += farms[1].getUserPreviousStake(address)#Risk
            amount += calculateShowBalance(farms[2].getUserPreviousBalance(address, {"from":account}),
                                                    farms[2].getUserAmountStaked(address, {"from":account}), 
                                                    farms[2].getUserSecs(address, {"from":account}), 
                                                    farms[2].getUserTimeGuess(address, {"from":account})) #Speculate
            amount += token.balanceOf(address) #Holding

            if(amount>= max2[1] and amount<= max2[0]):
                max2[1] = amount
                maxAddress2[1] = address
            elif(amount>= max2[0]):
                max2[1] = max2[0]
                maxAddress2[0] = maxAddress2[1]
                max2[0] = amount
                maxAddress2[0] = address
        
    print(f" first = {max2[0]}  it comes from {maxAddress2[0]}")   
    print(f" second = {max2[1]}  it comes from {maxAddress2[1]}")   
    # 
    print("here")     

    # avax_token.approve(presale.address, Web3.toWei(10**36, "ether"), {"from":account})
    # avax_token.approve(presale.address, Web3.toWei(10**18, "ether"), {"from":non_owner})
    
  
    # tokens_given = Web3.toWei(10, "ether")
    
    # presale.buy({"from" :account, "amount": 1 })
        


    

 
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

    
  