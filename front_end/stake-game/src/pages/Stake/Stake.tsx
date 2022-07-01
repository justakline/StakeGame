import "./Stake.css";
import Navigation from "../../components/Nav/Navigation";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Footer from "../../components/Footer/Footer";

import { constants, utils } from "ethers";
import StakeFarm from "../../chain-info/contracts/StakeFarm.json";
import StakeToken from "../../chain-info/contracts/StakeToken.json";
import Addresses from "../../chain-info/deployments/map.json"
import {Contract} from "@ethersproject/contracts" ;
import { useEthers,useEtherBalance, useCall, useTokenBalance, useContractFunction, useTokenAllowance, Avalanche, AvalancheTestnet } from "@usedapp/core";
import BigNumberToString from "../../hooks/BigNumberToString";
import ContractCall from "../../hooks/ContractCall";
import { CircularProgress } from "@mui/material";




const Stake = () => {
  const { activateBrowserWallet, account, deactivate, chainId, active } = useEthers()
  const etherBalance = useEtherBalance(account)
   //Change when launch on mainnet
   var cID = (chainId==AvalancheTestnet.chainId )?chainId:undefined
   //Change when launch on mainnet
  var converted = etherBalance? BigNumberToString(etherBalance): 0
  const tokenInterface= new utils.Interface(StakeToken.abi)
  const tokenAddress = cID? Addresses[String(chainId)]["StakeToken"][0]: constants.AddressZero
  const tokenContract = new Contract(tokenAddress,tokenInterface)

  const farmInterface= new utils.Interface(StakeFarm.abi)
  const farmAddress = cID? Addresses[String(chainId)]["StakeFarm"][0]: constants.AddressZero
  const farmContract= new Contract(farmAddress, farmInterface)

  // const { value, error } = useCall({ contract:farmContract, method: 'getStakingBalance', args: [account ?? ''] }) ?? {}
  var stakingBalance = ContractCall(farmContract, "getStakingBalance", [account])
  stakingBalance = stakingBalance? BigNumberToString(stakingBalance) :0;
  var nextReward = ContractCall(farmContract, "getNextRewardYield", [account])
  nextReward = nextReward? BigNumberToString(nextReward) :0;
  nextReward = (nextReward && nextReward.length >5)? nextReward.substring(0,4): nextReward
  var nextRebase = ContractCall(farmContract,"timeToNextRebase", [account] )
  nextRebase = nextRebase? parseFloat(nextRebase) : 0
  var nextRebaseHours =  nextRebase? Math.floor((nextRebase/60)/60) : 0
  var nextRebaseMins =  nextRebase? Math.floor((((nextRebase/60)/60)-nextRebaseHours)*60) : 0
  nextRebaseHours = stakingBalance ==0? 24: nextRebaseHours
  nextRebaseMins = stakingBalance ==0? 0: nextRebaseMins

  var yieldNumerator = ContractCall(farmContract,"yieldPercentNumerator", [] )
  yieldNumerator = yieldNumerator ? BigNumberToString(yieldNumerator) : 0
  var yieldDenominator = ContractCall(farmContract,"yieldPercentDenominator",[] )
  yieldDenominator = yieldDenominator? BigNumberToString(yieldDenominator) :0

  var yieldPercent = parseFloat(yieldNumerator) /parseFloat(yieldDenominator)
  yieldPercent = 100*(yieldPercent-1)
  //Doing the division with large numbers leads to artifacts, like 1.000000009%, so this will get rid of that
  yieldPercent =Math.round(yieldPercent*100)/100
  var fiveDayYieldPercent = (((1+ (yieldPercent/100))**5)-1) *100
  fiveDayYieldPercent =Math.round(fiveDayYieldPercent*100)/100


  
  var tokenBalanceBig = useTokenBalance(tokenAddress, account) 
  var tokenBalance= tokenBalanceBig?BigNumberToString(tokenBalanceBig):"Amount"

  var maxButton = (document.getElementById("maxStake") as HTMLInputElement);
  maxButton?.addEventListener("click", maxClick)

  const stake = useContractFunction(farmContract, 'stake', { transactionName: 'stake' })
  const unStake = useContractFunction(farmContract, 'unstake', { transactionName: 'unstake' })
  const approve = useContractFunction(tokenContract, "approve", {transactionName:"apporve"} )
  const allowanceToContract = useTokenAllowance(tokenAddress, account, farmAddress)



  var stakeStatus = stake.state.status == "Mining" || stake.state.status == "PendingSignature"
  var unstakeStatus = unStake.state.status == "Mining" || unStake.state.status == "PendingSignature"

  

  var amountInput = (document.getElementById("inputAmountStake") as HTMLInputElement)
  if(stake.state.status=="Mining" || unStake.state.status=="Mining" ){
    amountInput.value =""
  }




  function handleStake() {
    if(allowanceToContract && allowanceToContract.isZero()){
      approve.send(farmAddress, utils.parseEther('1000000000000000'))
    }
    var amountInput = (document.getElementById("inputAmountStake") as HTMLInputElement)
    var amount = utils.parseEther(""+amountInput.value)
    stake.send(amount)
      
  }
  function handleUnstake() {
    var amountInput = (document.getElementById("inputAmountStake") as HTMLInputElement)
    var amount = utils.parseEther(""+amountInput.value)
    unStake.send(amount)

  }
  


  function maxClick(){
    var amountInput = (document.getElementById("inputAmountStake") as HTMLInputElement)
   if(tokenBalance){

    amountInput.value = tokenBalance+""
   }
  }
  


  

  return (
    <div>
      <Navigation />
      <div className="container">
        <div className="wrapper">
          <h1 className="gradientText heading">STAKE</h1>
          <p className="subLink">
            Learn how to earn in the <a href="#">documentation!</a>
          </p>

          <div className="cards">
            <Card className="CurrentBalance" heading="Current Balance" text={stakingBalance+ ""} />
            <Card  className="APR"  heading="APR / Daily" text={ yieldPercent +"%"} />
            <Card  className="ROI" heading="ROI / 5-Day" text={fiveDayYieldPercent +"%"} />
            <div className="lastShowRow">
              <Card  className="Reward"  heading="Next Reward" text={ nextReward + " STK" }/>
              <Card  className="Rebase"  heading="Next Rebase" text={nextRebaseHours+" hrs " + nextRebaseMins +" mins" } />
            </div>
          </div>
          <br />
          <Input id="inputAmountStake"placeholder="Amount" bntText="MAX" btnId={"maxStake"} />

          <div className="buttons">
            {(!stakeStatus && !unstakeStatus)?(
            <><button className="cBtn" onClick={() => handleStake()}> Stake</button><button className="cBtn" onClick={() => handleUnstake()}>Unstake</button></>) :
              <>    <div className="cHeading" style={{marginTop:"-4px"}}>{stakeStatus? "Staking" : "Unstaking"} </div><CircularProgress style={{color:"white"}}size={25}/>   </>
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Stake;
