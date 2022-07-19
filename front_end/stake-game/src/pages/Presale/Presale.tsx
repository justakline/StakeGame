import { useEffect } from "react";

import "./Presale.css";
import Navigation from "../../components/Nav/Navigation";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Footer from "../../components/Footer/Footer";
import Timer from "../../components/Timer/Timer";

import { useTimer } from "react-timer-hook";

import { useEthers, useEtherBalance,useContractFunction, useTokenAllowance, useTokenBalance, Avalanche, AvalancheTestnet, useSendTransaction } from "@usedapp/core";
import { utils, constants } from "ethers";
import BigNumberToString from "../../hooks/BigNumberToString";
import ContractCall from "../../hooks/ContractCall";
import Farm from "../../chain-info/contracts/Presale.json";
import StakeToken from "../../chain-info/contracts/StakeToken.json";
import Addresses from "../../chain-info/deployments/map.json"
import {Contract} from "@ethersproject/contracts" ;
import { CircularProgress } from "@mui/material";

const Presale = () => {
  const { activateBrowserWallet, account, deactivate, chainId, active } = useEthers()
  const etherBalance = useEtherBalance(account)


  //Change when launch on mainnet
  var cID = (chainId==Avalanche.chainId )?chainId:undefined
 //Change when launch on mainnet  
 
  const tokenInterface= new utils.Interface(StakeToken.abi)
  const tokenAddress = cID? Addresses[String(chainId)]["StakeToken"][0]: constants.AddressZero
  const tokenContract = new Contract(tokenAddress,tokenInterface)

  const farmInterface= new utils.Interface(Farm.abi)
  const farmAddress = cID? Addresses[String(chainId)]["Presale"][0]: constants.AddressZero
  const farmContract= new Contract(farmAddress, farmInterface)
  var tokenBalanceBig = useEtherBalance(account)
  var tokenBalance = tokenBalanceBig? BigNumberToString(tokenBalanceBig): 0
  var totalAvax= ContractCall(farmContract, "getTotalAvax", []);
  totalAvax = totalAvax? BigNumberToString(totalAvax): 0;
  var amountInvested = ContractCall(farmContract, "getUserAmountInvested", [account]);
  amountInvested =  amountInvested? BigNumberToString(amountInvested):0;




  const stake = useContractFunction(farmContract, 'buy', { transactionName: 'buy' })
  const send = useSendTransaction({ transactionName: 'Send AVAX' })
  const approve = useContractFunction(tokenContract, "approve", {transactionName:"apporve"} )
  
  const allowanceToContract = useTokenAllowance(tokenAddress, account, farmAddress)


  var stakeStatus = stake.state.status == "Mining" || stake.state.status == "PendingSignature"



    
  var amountInput = (document.getElementById("inputAmountInvest") as HTMLInputElement)
  if(stake.state.status=="Mining" ){
    amountInput.value =""
  }

  var maxButton = document.getElementById("maxInvest") as HTMLInputElement
  maxButton?.addEventListener("click", maxClick)

  function handleStake() {
    if((chainId == AvalancheTestnet.chainId || chainId ==Avalanche.chainId)){
      if(allowanceToContract && allowanceToContract.isZero()){

        approve.send(farmAddress, utils.parseEther('1000000000000000'))
      }
      
      var amountInput = (document.getElementById("inputAmountInvest") as HTMLInputElement)
      var amount = utils.parseEther(""+amountInput.value)

      stake.send(amount, {value:amount})
      // send.sendTransaction({to:farmAddress, value:amount})
  }
      
  }

  function maxClick(){
    var amountInput = (document.getElementById("inputAmountInvest") as HTMLInputElement)

   if(tokenBalance && amountInput){

    amountInput.value = tokenBalance +""
   }

  }



  // set the restart function for time countdown
  function timeCountdown() {
    const time = new Date();
    time.setSeconds(time.getSeconds() + timeBetween);
 
    restart(time);
  }

  useEffect(() => {
    timeCountdown();
  }, []);

  const time = new Date();
  const endTime = new Date("July 22, 2022 19:00:00")

  const timeBetween =  Math.trunc(((Date.parse(endTime.toISOString())).valueOf() - (Date.parse(time.toISOString())).valueOf())/1000)


  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ time, onExpire: () => console.warn("onExpire called") });

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="wrapper">
          <h1 className="gradientText heading">Presale</h1>
          <p className="subLink">
            Learn how to earn in the <a target={"_blank"} href="https://stakegame.gitbook.io/stake-game/">documentation!</a>
          </p>
          {/* <br /> */}
          <h2 className="TimerTitle">ENDS IN</h2>
          <div className="countdown">
            <Timer data={days} text="DAYS" />
            <Timer data={hours} text="HOURS" />
            <Timer data={minutes} text="MINUTES" />
            <Timer data={seconds} text="SECONDS" />
          </div>

          <p className="presaleText" >
          Stake Game is an experimental protocol with both hyper-inflationary and hyper-deflationary features. Based on the risk-tolerance of users, 
          the price of the coin will fluxuate as the protocol mints and burns tokens. <br></br><br></br>
              After the presale, we will be using the funds as initlal liquidity, selling at an inital price of 1 STK = 0.01 AVAX . For the presale, 
              there will be a hard cap of 500 AVAX/50,000 STK dispersed.
              There is a max buy of 20 AVAX/2000 STK
              <br></br><br></br>

              Remember to be connected to the correct account, and to be connected to the Avalanche Network!

              <br></br><br></br>

              Thank you for investing! :)

          </p>
          
          <h5 className="presaleh5">1 AVAX = 100 STK</h5>
          <Input id="inputAmountInvest" placeholder="Amount of AVAX" bntText="MAX" btnId={"maxInvest"} />

          <div className="buttons">
          {(!stakeStatus )?(
            <><button className="cBtn" disabled={farmAddress==constants.AddressZero} onClick={() => handleStake()}> Invest AVAX</button></>) :
              <>    <div className="cHeading" style={{marginTop:"-4px"}}>{stakeStatus? "Investing" : ""} </div><CircularProgress style={{color:"green"}}size={25}/>   </>
          }
          </div>

          <br />
          <div className="presaleCards">
            <Card heading="Amount You Invested" text={amountInvested + " AVAX"} />
            <Card heading="Total STK Dispersed" text={totalAvax*100 +" STK"} />

          </div>
          <br />
          <br />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Presale;
