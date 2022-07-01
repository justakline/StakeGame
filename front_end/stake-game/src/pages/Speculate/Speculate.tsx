// inpternal imports
import "./speculate.css";
import Input from "../../components/Input/Input";
import Navigation from "../../components/Nav/Navigation";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Card/Card";

import { Line, Chart } from "react-chartjs-2";
import "chart.js/auto";
import { BigNumber, constants, utils } from "ethers";
import SpeculateFarm from "../../chain-info/contracts/SpeculateFarm.json";
import StakeToken from "../../chain-info/contracts/StakeToken.json";
import Addresses from "../../chain-info/deployments/map.json"
import {Contract} from "@ethersproject/contracts" ;
import { useState } from "react";
import { useEthers,useEtherBalance, useCall, useTokenBalance, useContractFunction, useTokenAllowance, Avalanche, AvalancheTestnet } from "@usedapp/core";
import BigNumberToString from "../../hooks/BigNumberToString";
import ContractCall from "../../hooks/ContractCall";
import { CircularProgress } from "@mui/material";



const Speculate = () => {

  const { activateBrowserWallet, account, deactivate, chainId, active } = useEthers()
  const etherBalance = useEtherBalance(account)

  //Change when launch on mainnet
  var cID = (chainId==AvalancheTestnet.chainId )?chainId:undefined
 //Change when launch on mainnet

  var converted = etherBalance? BigNumberToString(etherBalance): 0
  const tokenInterface= new utils.Interface(StakeToken.abi)
  const tokenAddress = cID? Addresses[String(chainId)]["StakeToken"][0]: constants.AddressZero

  const tokenContract = new Contract(tokenAddress,tokenInterface)

 

  const speculateFarmInterface= new utils.Interface(SpeculateFarm.abi)
  const speculateFarmAddress = cID? Addresses[String(chainId)]["SpeculateFarm"][0]: constants.AddressZero
  const speculateFarmContract= new Contract(speculateFarmAddress, speculateFarmInterface)

  
  var realBalance = ContractCall(speculateFarmContract, "getUserAmountStaked", [account])
  realBalance = realBalance? BigNumberToString(realBalance): 0

  var previousBalance = ContractCall(speculateFarmContract, "getUserPreviousBalance", [account])
  previousBalance= previousBalance? BigNumberToString(previousBalance) : 0
  
  var timeGuess = ContractCall(speculateFarmContract, "getUserTimeGuess", [account])
  timeGuess = timeGuess? parseFloat(timeGuess.toString()): 0


  // var currentBalance = ContractCall(speculateFarmContract, "showBalance", [account])
  // currentBalance= currentBalance? BigNumberToString(currentBalance) : 0


  var tokenBalanceBig = useTokenBalance(tokenAddress, account)

  var tokenBalance= tokenBalanceBig? BigNumberToString(tokenBalanceBig):0

  var secsSinceStart = ContractCall(speculateFarmContract, "getUserSecs", [account])
  var minsSinceStart= secsSinceStart? Math.trunc(parseFloat(secsSinceStart.toString())/60).toString() : 0
  minsSinceStart= minsSinceStart? (realBalance==0? "0 mins" : (minsSinceStart>60? "Can Unstake!" : minsSinceStart +"")):"0 mins"

  var showBalance = calculateShowBalance(previousBalance, realBalance, minsSinceStart, timeGuess)

  const stake = useContractFunction(speculateFarmContract, 'stake', { transactionName: 'stake' })
  const unstake = useContractFunction(speculateFarmContract, 'unstake', { transactionName: 'unstake' })
  const approve = useContractFunction(tokenContract, "approve", {transactionName:"apporve"} )
  const allowanceToContract = useTokenAllowance(tokenAddress, account, speculateFarmAddress)





  var stakeStatus = stake.state.status == "Mining" || stake.state.status == "PendingSignature"
  var unstakeStatus = unstake.state.status == "Mining" || unstake.state.status == "PendingSignature"
  const [inputVal, setInputVal] = useState( ()=>{
      if(realBalance>0 && minsSinceStart != "Can Unstake!"){
        return previousBalance
      }
      return 0
  });

  const[isStaking, setStakingStatus] = useState(false)
  const[winner, setWinnerStatus] = useState(false)

  var amountInput = (document.getElementById("inputAmountSpeculate") as HTMLInputElement);

  var minuteInput = (document.getElementById("inputMinutesSpeculate") as HTMLInputElement);


  if(amountInput && minuteInput){
    if(stake.state.status=="Mining" || unstake.state.status=="Mining" ){
      amountInput.value = ""
      minuteInput.value = ""
  }
}
  if(amountInput){
     if(amountInput.value.includes("-")){
    amountInput.value = amountInput.value.replaceAll("-", "")
  }
  }
 
  if(minuteInput){
    if(minuteInput.value.includes("-")){
    minuteInput.value = minuteInput.value.replaceAll("-", "")
  }

  }


  // var showBalance = calaculateShowBalance(previousBalance, realBalance, );


  function calculateShowBalance(previousBalance, realBalance, minsSinceStart, timeGuess){

      if(minsSinceStart> timeGuess){
        return realBalance;
      }

      if(minsSinceStart<20){
        return (Math.trunc((previousBalance *((((minsSinceStart)**2)/16)+100)/100) *1000000))/1000000;

      } else if(minsSinceStart<40){
        return (Math.trunc((previousBalance * ( (((minsSinceStart)**2)/7)+68)/100) *1000000))/1000000;
      }
      return (Math.trunc((previousBalance *((((minsSinceStart)**2)/2)-503)/100)*1000000 ))/1000000;
  }
  

function handleStake() {
  var amount = amountInput.value
  var timeGuess = minuteInput.value
    if(allowanceToContract && allowanceToContract.isZero()){
      approve.send(speculateFarmAddress, utils.parseEther('1000000000000000'))
    }


    stake.send(utils.parseEther(""+amount), Math.trunc(parseFloat(timeGuess)));

    

  
      
  }
  function handleUnstake() {
    var amount = amountInput.value
    if(allowanceToContract && allowanceToContract.isZero()){
      approve.send(speculateFarmAddress, utils.parseEther('1000000000000000'))
    }
    unstake.send(utils.parseEther(""+amount));
   

  }
  
  var maxStakeButton = (document.getElementById("maxSpeculate") as HTMLInputElement);
  maxStakeButton?.addEventListener("click", maxStakeClick)
  
  function maxStakeClick(){
    var amountInput = (document.getElementById("inputAmountSpeculate") as HTMLInputElement)

    // if the values we are looking to check are not null, ...
   if(tokenBalance && realBalance&&previousBalance&& minsSinceStart=="Can Unstake!" && !(realBalance == previousBalance)){
    amountInput.value = realBalance+""
  
   }else{

    amountInput.value = tokenBalance+"" 
    setInputVal(tokenBalance)
   }
  
   


  }
  
  var maxMinuteButton = (document.getElementById("maxMins") as HTMLInputElement);
  maxMinuteButton?.addEventListener("click", maxMinuteClick)
  
  function maxMinuteClick(){
    var amountInput = (document.getElementById("inputMinutesSpeculate") as HTMLInputElement)


    amountInput.value = "60"
 
  }



  var xValues = [];
  var yValues = [];

  var chart= generateChart(((realBalance > 0 && minsSinceStart!= "Can Unstake!" )? previousBalance: inputVal), xValues, yValues);


 

  function changeChart(e){
    var val = e.target.value;
    val = val? val:0
   if(amountInput.value.includes("-")){
      amountInput.value = amountInput.value.replaceAll("-", "")
    }

    if(realBalance > 0 && minsSinceStart!= "Can Unstake!" ){
      setInputVal(previousBalance)
    }else{
      setInputVal(val)
    }

  }

  var ctx : any = document.getElementById("chart")
   ctx = ctx?.getContext("2d")
  





  function generateChart(initialValue, xValues, yValues){
    
    generateData((initialValue +" * ((x**2)/16 +100)/100"), 1, 20, 1, xValues, yValues);
    generateData( (initialValue +" * ((x**2)/7 +68)/100"), 21, 40, 1, xValues, yValues);
   generateData( (initialValue +" * ((x**2)/2 -503)/100"), 41, 60, 1, xValues, yValues);
   var ctx : any = document.getElementById("chart")

   ctx = ctx?.getContext("2d")


   var gradient = ctx?.createLinearGradient(0, 0, 600, 0)
   gradient?.addColorStop(0, 'rgba(139, 161, 248, 1)')
   gradient?.addColorStop(1, 'rgba(225, 11, 76, 1)')

   var mins = 0;
  if(minsSinceStart!= "Can Claim!"){
    mins = Number(minsSinceStart);
  }
  mins = mins<0? 0: mins;

   var circleX = minsSinceStart<timeGuess? mins-1:timeGuess;


   var circleY = minsSinceStart <timeGuess? showBalance: realBalance

  //  var circleY = currentBalance>=previousBalance? currentBalance: realBalance

   let circleXArray = new Array(circleX); for (let i=0; i<circleX+1; ++i) circleXArray[i] = 0;
   circleXArray[circleX] = circleY;

   let circleXSize = [...circleXArray];
   circleXSize[circleX] = 7
 


    return( <Line id="chart"

      data={{
       
        labels: xValues,
      
        datasets: [ 
          { 
            type:'line',
            label : "STK/Time",
            data: yValues,
            borderColor: [
              gradient
            ],
            borderWidth: 3,
            pointHitRadius: 10,
            pointRadius: 0,
            tension:0.3,
            order:2
          },
          {
            type:'line',
            data:circleXArray,
            pointRadius:circleXSize,
            pointBackgroundColor:"rgba(255,255,255,1)",
            borderColor:"rgba(255,255,255,0)",
            order:1,
            pointHitRadius: 20,
            label:"",
           

      
        
          }
        ],
        
      } } 
      
      options={{   
        

        plugins: {
          
          tooltip: {
            
          }
        },
        
        scales: {
          xAxis:{
            ticks:{
              color:'#FFFFFF'
        
            }
        
          },
         
          y: {
            ticks:{
              color:'#FFFFFF'
            }

            
          }
        },
        maintainAspectRatio: false,
        
        elements: {


          line: {
            
            tension: 0.3,

          },
        },

      }
    
    
    }


 
      
      
    />);
  }

  
  

   function generateData(value, i1, i2, step = 1, xValues, yValues) {
    for (let x = i1; x <= i2; x += step) {
        yValues.push(Math.floor(eval(value)));
        xValues.push(x);
    }
  }


  return (
    <>
      <Navigation />
      <div className="container">
        <div className="wrapper">
          <h1 className="gradientText heading">Speculate</h1>
          <p className="subLink">
            Learn how to earn in the <a href="#">documentation!</a>
          </p>

          <div className="specWrapper">
            <div className="specGrid">
              <div className="firstCard">
                <Card heading="Current Balance" text={showBalance +" STK"} />
              </div>
              <Card heading="Original Balance" text={previousBalance +" STK"} />
              <Card heading="Current Minute" text={minsSinceStart} />
            </div>

            <div className="cartSection">
             {chart}
            </div>
          </div>
         <div className="speculateInputs">
         {( minsSinceStart== "0 mins" || minsSinceStart == "Can Unstake!")?(
            <>    <Input placeholder="Amount"   id="inputAmountSpeculate" bntText="MAX" btnId={"maxSpeculate"} onChange={e =>changeChart(e)}/>
                 {(minsSinceStart == "Can Unstake!" && (realBalance!=previousBalance))? <></>: <><Input placeholder="Minutes"  id="inputMinutesSpeculate"  bntText="MAX" btnId={"maxMins"} /> </> }
                <div className="buttons">

                {(!stakeStatus && !unstakeStatus)?(

                <> {(minsSinceStart=="Can Unstake!" && (realBalance!=previousBalance))? <> </>:<><button className="cBtn Speculate" onClick={() => handleStake()}> Speculate</button> </>     }
                  <button className="cBtn Unstake" onClick={() => handleUnstake()}>Unstake</button></> 
              ):(<>    
                <div className="cHeading" style={{marginTop:"-4px"}}>{stakeStatus? "Staking" : "Unstaking"} </div><CircularProgress style={{color:"white"}}size={25}/>   </>
            )}
              
               </div>
                </>) :<>    
                {/* have staked */}
                {(realBalance>previousBalance && minsSinceStart>timeGuess )?<>
                    {/* you are a winner */}
                    <div className="cHeading">Congratulations, you made {realBalance-previousBalance} STK. Collect in {parseFloat(minsSinceStart)-60} minutes :)</div>
                    <CircularProgress  style={{marginTop:"8px", justifyContent:"center"}} size={55} color="success"/>
                    </>:<> </>}
                {/* have staked */}
                {(realBalance<previousBalance && minsSinceStart>timeGuess )?<>
                {/* you are a loser */}
                    <div className="cHeading">Unfortunetly, you lost {previousBalance-realBalance} STK. Speculate again in {parseFloat(minsSinceStart)-60} minutes :(</div>
                    <CircularProgress  style={{marginTop:"8px", justifyContent:"center"}} size={55} color="error"/>
                  </>:<> </>} 
                
                {/* You have staked but have not passed your timeguess yet */}
                {(minsSinceStart<timeGuess )?<>
                <div className="cHeading">Speculate or unstake in {parseFloat(minsSinceStart)-60} minutes. Good Luck :)</div>
                <CircularProgress  style={{marginTop:"8px", justifyContent:"center", color:"white"}} size={55}/>
                </>:<> </>
                }
                 </>}



          </div>
        </div>
      </div>
      
      <Footer />
      
    </>
  );
};

export default Speculate;