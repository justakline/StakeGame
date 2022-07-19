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
import { nodeModuleNameResolver } from "typescript";



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
  minsSinceStart= minsSinceStart? (realBalance==0? 0 : (minsSinceStart>60? -1 : minsSinceStart)):0

  var showBalance = calculateShowBalance(previousBalance, realBalance, minsSinceStart, timeGuess)

  const stake = useContractFunction(speculateFarmContract, 'stake', { transactionName: 'stake' })
  const unstake = useContractFunction(speculateFarmContract, 'unstake', { transactionName: 'unstake' })
  const approve = useContractFunction(tokenContract, "approve", {transactionName:"apporve"} )
  const allowanceToContract = useTokenAllowance(tokenAddress, account, speculateFarmAddress)





  var stakeStatus = stake.state.status == "Mining" || stake.state.status == "PendingSignature"
  var unstakeStatus = unstake.state.status == "Mining" || unstake.state.status == "PendingSignature"
  const [inputVal, setInputVal] = useState( ()=>{
      if(realBalance>0 && minsSinceStart != -1){
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




  function calculateShowBalance(previousBalance, realBalance, minsSinceStart, timeGuess){

      if(minsSinceStart==-1){
        return realBalance;
      }

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

  if((chainId == AvalancheTestnet.chainId || chainId ==Avalanche.chainId)){
    if(allowanceToContract && allowanceToContract.isZero()){

        approve.send(speculateFarmAddress, utils.parseEther('1000000000000000'))

    }

      stake.send(utils.parseEther(""+amount), Math.trunc(parseFloat(timeGuess)));
    }

  
      
  }
  function handleUnstake() {
    var amount = amountInput.value
    
    if((chainId == AvalancheTestnet.chainId || chainId ==Avalanche.chainId)){
      if(allowanceToContract && allowanceToContract.isZero()){
        approve.send(speculateFarmAddress, utils.parseEther('1000000000000000'))
      }
      if(amount == "0" || amount == ""){
        unstake.send(utils.parseEther("0.0000001"))
      }
      unstake.send(utils.parseEther(""+amount));
  }

  }
  
  var maxStakeButton = (document.getElementById("maxSpeculate") as HTMLInputElement);
  maxStakeButton?.addEventListener("click", maxStakeClick)
  
  function maxStakeClick(){
    var amountInput = (document.getElementById("inputAmountSpeculate") as HTMLInputElement)

    // if the values we are looking to check are not null, ...
   if(tokenBalance && realBalance&&previousBalance&& minsSinceStart==-1 && !(realBalance == previousBalance)){
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

  var chart= generateChart(((realBalance > 0 && minsSinceStart!= -1)? previousBalance: inputVal), xValues, yValues);
  var circleInfo = generateCircleInfo( (minsSinceStart <timeGuess? minsSinceStart: timeGuess) , (minsSinceStart <timeGuess? showBalance: realBalance))

  function generateCircleInfo(xValue ,yValue){

    var el= document.getElementById("chart") as HTMLCanvasElement

    var widthSize = el? el.width:0;

    var x = xValue
    if(x<8){
      x = 8
    }    
    if(x>50){
      x = 50
    } 
    
    var circ;

    if(minsSinceStart!= -1 && minsSinceStart!=0){
      circ = (<>
        
          <div className="circleInfo" style={{top:  "10%", left:"10%"}}>
           <p className="circleInfoText Amount"> {(Math.trunc(yValue *100))/100} STK</p> {/*The 100 truncates to the 0.01 place */}
            {/* <p className="circleInfoText Min"> {minsSinceStart<timeGuess?minsSinceStart:timeGuess} min</p> */}
            
            </div>
       </>)
      // if(widthSize && widthSize>400){
      // circ = (<>
        
      //   <div className="circleInfo" style={{bottom: (24+(1+x*0.0029)**30)-6 + "%", left:""+((100*x/60)-4)+"%"}}>
      //     <p className="circleInfoText Amount"> {Math.trunc(yValue)} STK</p>
      //     {/* <p className="circleInfoText Min"> {minsSinceStart<timeGuess?minsSinceStart:timeGuess} min</p> */}
          
      //     </div>
      // </>)
      // }else{

      //   circ = (<>
        
      //     <div className="circleInfo" style={{bottom: (24+(1+x*0.0029)**30) + "%", left:""+((100*x/60)-4)+"%"}}>
      //       <p className="circleInfoText"> {Math.trunc(yValue)} STK</p>
            
      //       </div>
      //   </>)

      // }
    }else{
      circ = (<></>)
    }
    return circ

 }

  function changeChart(e){
    var val = e.target.value;
    val = val? val:0
    //Some errors happen if don't get rid of 0... thinks its hex
    if(val[0] == 0 && val.length > 1 ){
      if((val+"").includes("0.")){

      }else{
    
      amountInput.value = (val+"").replaceAll("0", "");
      val = amountInput.value;
        val = val == "" ? 0:val
      }
    }
  

   if(amountInput.value.includes("-")){
      amountInput.value = amountInput.value.replaceAll("-", "")
    }

    if(realBalance > 0 && minsSinceStart!=-1){
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

   

   var circleX = minsSinceStart<timeGuess? minsSinceStart:timeGuess; 
   circleX = circleX <=0? 0: circleX-1;
   var circleY = minsSinceStart <timeGuess? showBalance: realBalance

  

  //  var circleY = currentBalance>=previousBalance? currentBalance: realBalance

   let circleXArray = new Array(circleX); for (let i=0; i<circleX; ++i) circleXArray[i] = 0;
   circleXArray[circleX] = circleY;

   let circleXSize = [...circleXArray];
   let circleXHit = 0;
   if(minsSinceStart>=0){
    circleXSize[circleX] = 7
    circleXHit = 40;
   }else{
    circleXArray = new Array(0)
    circleXSize[circleX] = 0;
    circleXHit = 0;
   }
 


    return( <Line id="chart"

      data={{
       
        labels: xValues,
       
        datasets: [ 
          { 

            // SPECULATE Line Graph 
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

            //CIRCLE placement
            type:'line',
            data:circleXArray,
            
            pointRadius:circleXSize,
            pointBackgroundColor: minsSinceStart!=0? "rgba(255,255,255,1)" : "rgba(255,255,255,0)" ,
            borderColor:"rgba(255,255,255,0)",
            order:1,
            pointHitRadius: 40,
            label:"",
            
          },
           {
            //LINE for the cirlce
            type:'line',
            data:[{x:circleX+1, y:0}, {x:circleX+1, y:minsSinceStart!=-1? circleY : 0}],
            
            pointRadius:0,
            pointBackgroundColor:"rgba(255,255,255,0)",
            pointBorderColor:"rgba(255,255,255,0)",

            borderColor:"rgba(255,255,255,1)",
            order:3,
            pointHitRadius: 0,
            label:"Minutes",
            animation:false,
      
          }
        ],
        
      } } 
      
      options={{   
      

        plugins: {
          tooltip:{
            // enabled:false,
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
            Learn how to earn in the <a target={"_blank"} href="https://stakegame.gitbook.io/stake-game/">documentation!</a>
          </p>

          <div className="specWrapper">
            <div className="specGrid">
              <div className="firstCard">
                <Card heading="Current Balance" text={showBalance +" STK"} />
              </div>
              <Card heading="Original Balance" text={previousBalance +" STK"} />
              
              <Card heading="Time Guess" text={minsSinceStart ==-1 && showBalance!=0 ? "Can Claim!": timeGuess+ " mins" }/>
            </div>

            <div className="cartSection">
             {chart}
             {circleInfo}
            </div>
          </div>
         <div className="speculateInputs">
         {(minsSinceStart == -1 || showBalance ==0)?(
            <>    <Input placeholder="Amount"   id="inputAmountSpeculate" bntText="MAX" btnId={"maxSpeculate"} onChange={e =>changeChart(e)}/>
                 {(minsSinceStart == -1 && (realBalance!=previousBalance))? <></>: <><Input placeholder="Minutes"  id="inputMinutesSpeculate"  bntText="MAX" btnId={"maxMins"} /> </> }
                <div className="buttons">

                {(!stakeStatus && !unstakeStatus)?(

                <> {(minsSinceStart==-1 && (realBalance!=previousBalance))? <> </>:<><button className="cBtn Speculate" disabled={speculateFarmAddress==constants.AddressZero} onClick={() => handleStake()}> Speculate</button> </>     }
                  <button className="cBtn Unstake" disabled={speculateFarmAddress==constants.AddressZero} onClick={() => handleUnstake()}>Unstake</button></> 
              ):(<>    
                <div className="cHeading" style={{marginTop:"-4px"}}>{stakeStatus? "Staking" : unstakeStatus?"Unstaking":""} </div><CircularProgress style={{color:"white"}}size={25}/>   </>
            )}
              
               </div>
                </>) :<>    
                {/* have staked */}
                {(realBalance>previousBalance && minsSinceStart>timeGuess )?<>
                    {/* you are a winner */}
                    <div className="cHeading">Congratulations, you made {realBalance-previousBalance} STK. Collect in  {60 - minsSinceStart} minutes :)</div>
                    <CircularProgress  style={{marginTop:"8px", justifyContent:"center"}} size={55} color="success"/>
                    </>:<> </>}
                {/* have staked */}
                {(realBalance<previousBalance && minsSinceStart>timeGuess )?<>
                {/* you are a loser */}
                    <div className="cHeading">Unfortunetly, you lost {previousBalance-realBalance} STK. Speculate again in  {60 - minsSinceStart} minutes :(</div>
                    <CircularProgress  style={{marginTop:"8px", justifyContent:"center"}} size={55} color="error"/>
                  </>:<> </>} 
                
                {/* You have staked but have not passed your timeguess yet */}
                {(minsSinceStart<timeGuess )?<>
                <div className="cHeading">Speculate or unstake in {60 - minsSinceStart} minutes. Good Luck :)</div>
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
