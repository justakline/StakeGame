import "./Risk.css";

import Navigation from "../../components/Nav/Navigation";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Footer from "../../components/Footer/Footer";
import { useEthers, useEtherBalance,useContractFunction, useTokenAllowance, useTokenBalance, Avalanche, AvalancheTestnet } from "@usedapp/core";
import { utils, constants } from "ethers";
import BigNumberToString from "../../hooks/BigNumberToString";
import ContractCall from "../../hooks/ContractCall";
import RiskFarm from "../../chain-info/contracts/RiskFarm.json";
import StakeToken from "../../chain-info/contracts/StakeToken.json";
import Addresses from "../../chain-info/deployments/map.json"
import {Contract} from "@ethersproject/contracts" ;
import { CircularProgress } from "@mui/material";

const Risk = () => {
  const { activateBrowserWallet, account, deactivate, chainId, active } = useEthers()
  const etherBalance = useEtherBalance(account)
  //Change when launch on mainnet
  var cID = (chainId==AvalancheTestnet.chainId )?chainId:undefined
 //Change when launch on mainnet
  var converted = etherBalance? BigNumberToString(etherBalance): 0
  const tokenInterface= new utils.Interface(StakeToken.abi)
  const tokenAddress = cID? Addresses[String(chainId)]["StakeToken"][0]: constants.AddressZero

  const tokenContract = new Contract(tokenAddress,tokenInterface)

 

  const farmInterface= new utils.Interface(RiskFarm.abi)
  const farmAddress = cID? Addresses[String(chainId)]["RiskFarm"][0]: constants.AddressZero
  const farmContract= new Contract(farmAddress, farmInterface)


  var stakingBalance = ContractCall(farmContract, "getUserStakingBalance", [account])
  stakingBalance = stakingBalance? BigNumberToString(stakingBalance) :0;
  var previousBalance = ContractCall(farmContract, "getUserPreviousStake", [account])
  previousBalance = previousBalance? BigNumberToString(previousBalance) :0;



  var timeGap = ContractCall(farmContract,"timeGap", [] )
  timeGap = timeGap? parseFloat(timeGap) : 0

  var nextRebaseSecs = ContractCall(farmContract,"getUserSecsUntilRebase", [account] )
  nextRebaseSecs = nextRebaseSecs? parseFloat(nextRebaseSecs) : 0
  var nextRebaseHours =  nextRebaseSecs? "" +Math.floor((nextRebaseSecs/60)/60) :""+ 0
  var nextRebaseMins =  nextRebaseSecs? ""+ Math.floor((((nextRebaseSecs/60/60))-parseFloat(nextRebaseHours))*60) :""+ 0
  //if you have already staked and you've gone through 24 hours

   if(nextRebaseHours=="0" && nextRebaseMins =="0" && stakingBalance>0){
      nextRebaseHours = "Can";
      nextRebaseMins = "Risk Again";
   }





  
  var tokenBalanceBig = useTokenBalance(tokenAddress, account) 
  var tokenBalance= tokenBalanceBig?BigNumberToString(tokenBalanceBig):"Amount"

  var maxButton = (document.getElementById("maxRisk") as HTMLInputElement);
  maxButton?.addEventListener("click", maxClick)

  const stake = useContractFunction(farmContract, 'stake', { transactionName: 'stake' })
  const restake = useContractFunction(farmContract, 'claim', { transactionName: 'stake' }) //when time hits 0, don't make user add any more than have to
  const unstake = useContractFunction(farmContract, 'unstake', { transactionName: 'unstake' })
  const approve = useContractFunction(tokenContract, "approve", {transactionName:"apporve"} )
  const allowanceToContract = useTokenAllowance(tokenAddress, account, farmAddress)



  var stakeStatus = stake.state.status == "Mining" || stake.state.status == "PendingSignature"
  var unstakeStatus = unstake.state.status == "Mining" || unstake.state.status == "PendingSignature"

  

  var amountInput = (document.getElementById("inputAmountRisk") as HTMLInputElement)
  if(stake.state.status=="Mining" || unstake.state.status=="Mining" ){
    amountInput.value =""
  }




  function handleStake() {
    if((chainId == AvalancheTestnet.chainId || chainId ==Avalanche.chainId)){
      if(allowanceToContract && allowanceToContract.isZero()){
        approve.send(farmAddress, utils.parseEther('1000000000000000'))
      }
      var amountInput = (document.getElementById("inputAmountRisk") as HTMLInputElement)
      if(nextRebaseHours== "Can" && nextRebaseMins=="Risk Again" && (amountInput.value =="" || amountInput.value == "0")){
        restake.send();
      }else{
    
        var amount = utils.parseEther(""+amountInput.value)
        stake.send(amount)
    }
  }
      
  }
  function handleUnstake() {
    if((chainId == AvalancheTestnet.chainId || chainId ==Avalanche.chainId)){
      var amountInput = (document.getElementById("inputAmountRisk") as HTMLInputElement)
      var amount = utils.parseEther(""+amountInput.value)
      unstake.send(amount)
    }

  }
  


  function maxClick(){
    var amountInput = (document.getElementById("inputAmountRisk") as HTMLInputElement)
   if(tokenBalance){

    amountInput.value = tokenBalance+""
   }
  }




  return (
    <>
      <Navigation />
      <div className="container">
        <div className="wrapper">
          <h1 className="gradientText heading">RISK</h1>
          <p className="subLink">
            Learn how to earn in the <a target={"_blank"} href="https://stakegame.gitbook.io/stake-game/">documentation!</a>
          </p>

          <div className="RiskCardsWrapper">
            <div className="RiskCard Left">
              <h2>Possible Gains</h2>
              <ul>
                <li>1 in 2 chance of gaining 1%</li>
                <li>1 in 10 chance of gaining 10%</li>
                <li>1 in 100 chance of gaining 100%</li>
              </ul>
            </div>

            <div className="RiskCard Right">
              <h2>Possible Losses</h2>
              <ul>
                <li>1 in 20 chance of gaining 10%</li>
                <li>1 in 100 chance of gaining 30%</li>
                <li>1 in 1000 chance of gaining 90%</li>
              </ul>
            </div>

            <div className="lastRow">
              <Card className="CurrentBalance" heading="Current Balance" text={nextRebaseHours =="Can" && nextRebaseMins =="Risk Again"? stakingBalance +" STK ":previousBalance + " STK"} />

              {/* {nextRebaseHours =="Can" && nextRebaseMins =="Risk Again"? nextRebaseHours+" " + nextRebaseMins :nextRebaseHours+ " hours " + nextRebaseMins+" minutes"} */}
              <Card className="NextChange" heading="Next Change" text={nextRebaseHours =="Can" && nextRebaseMins =="Risk Again"? nextRebaseHours+" " + nextRebaseMins :nextRebaseHours+ " hours " + nextRebaseMins+" minutes"} />
            </div>
          </div>
          <br />
          <Input id="inputAmountRisk"placeholder="Amount" bntText="MAX" btnId={"maxRisk"} />
          <div className="buttons">
          {(!stakeStatus && !unstakeStatus)?(
            <><button className="cBtn" onClick={() => handleStake()}> Stake</button><button className="cBtn" onClick={() => handleUnstake()}>Unstake</button></>) :
              <>    <div className="cHeading" style={{marginTop:"-4px"}}>{stakeStatus? "Staking" : "Unstaking"} </div><CircularProgress style={{color:"white"}}size={25}/>   </>
          }
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Risk;
