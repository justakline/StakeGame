

import "./Test.css";
import Navigation from "../../components/Nav/Navigation";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Footer from "../../components/Footer/Footer";

import { useEthers, useEtherBalance,useContractFunction, useTokenAllowance, useTokenBalance, AvalancheTestnet } from "@usedapp/core";
import { utils, constants } from "ethers";
import BigNumberToString from "../../hooks/BigNumberToString";
import ContractCall from "../../hooks/ContractCall";
import Farm from "../../chain-info/contracts/TestFarm.json";
import StakeToken from "../../chain-info/contracts/StakeToken.json";
import Addresses from "../../chain-info/deployments/map.json"
import {Contract} from "@ethersproject/contracts" ;
import { CircularProgress } from "@mui/material";

const Presale = () => {
  const { activateBrowserWallet, account, deactivate, chainId, active } = useEthers()
  const etherBalance = useEtherBalance(account)

    //Change when launch on mainnet
    var cID = (chainId==AvalancheTestnet.chainId )?chainId:undefined
    //Change when launch on mainnet
  const tokenInterface= new utils.Interface(StakeToken.abi)
  const tokenAddress = cID? Addresses[String(chainId)]["StakeToken"][0]: constants.AddressZero
  const tokenContract = new Contract(tokenAddress,tokenInterface)

  const farmInterface= new utils.Interface(Farm.abi)
  const farmAddress = cID? Addresses[String(chainId)]["TestFarm"][0]: constants.AddressZero
  const farmContract= new Contract(farmAddress, farmInterface)

  var tokenBalanceBig = useEtherBalance(account)
  var tokenBalance = tokenBalanceBig? BigNumberToString(tokenBalanceBig): 0

  var amountInvested = ContractCall(farmContract, "getUserAmountInvested", [account]);
  amountInvested =  amountInvested? BigNumberToString(amountInvested):0;

  var maxMintAllowed = ContractCall(farmContract, "maxAmount", []);
  maxMintAllowed =  maxMintAllowed? BigNumberToString(maxMintAllowed):0;


  var totalLeftToMint = ContractCall(farmContract, "getUserAmountMinted", [account]);
 
  totalLeftToMint =  totalLeftToMint? maxMintAllowed - BigNumberToString(totalLeftToMint):0;
  totalLeftToMint = totalLeftToMint<=0?0 : totalLeftToMint;



  const stake = useContractFunction(farmContract, 'mint', { transactionName: 'mint' })
  const approve = useContractFunction(tokenContract, "approve", {transactionName:"apporve"} )
  const allowanceToContract = useTokenAllowance(tokenAddress, account, farmAddress)

  var stakeStatus = stake.state.status == "Mining" || stake.state.status == "PendingSignature"



    
  var amountInput = (document.getElementById("inputAmountTest") as HTMLInputElement)
  if(stake.state.status=="Mining" ){
    amountInput.value =""
  }

  var maxButton = document.getElementById("maxTest") as HTMLInputElement
  maxButton?.addEventListener("click", maxClick)

  function handleStake() {
    if(allowanceToContract && allowanceToContract.isZero()){
      approve.send(farmAddress, utils.parseEther('1000000000000000'))
    }
    var amountInput = (document.getElementById("inputAmountTest") as HTMLInputElement)
    var amount = utils.parseEther(""+amountInput.value)


    stake.send(account,amount)
      
  }

  function maxClick(){

    var amountInput = (document.getElementById("inputAmountTest") as HTMLInputElement)

   if(amountInput){

    amountInput.value = totalLeftToMint +""
   }

  }





  return (
    <>
      <Navigation />
      <div className="container">
        <div className="wrapper">
          <h1 className="gradientText heading">Testing</h1>
          <p className="subLink">
            Learn how to earn in the <a target={"_blank"} href="https://docs.stakegame.app">documentation!</a>
          </p>
          <br />
         

          <p className="presaleText" >
              Before investing real money into this protocol, we want you to fully understand how each of our systems work. Below, you can mint 1000 STK
              Tokens on the Avalache Fuji Testnet and you can use them in Speculate, Risk, and Stake! Just make sure that you are connected to the Testnet
              so you do not use the real thing!
              <br></br><br></br>

              Have Fun! :)

          </p>
          <Card   heading="Amount Left" text={ totalLeftToMint+ " STK"} />
          

          <Input id="inputAmountTest" placeholder="Amount" bntText="MAX" btnId={"maxTest"} />

          <div className="buttons">
          {(!stakeStatus )?(
            <><button className="cBtn" onClick={() => handleStake()}> Mint</button></>) :
              <>    <div className="cHeading" style={{marginTop:"-4px"}}>{stakeStatus? "" : ""} </div><CircularProgress style={{color:"green"}}size={25}/>   </>
          }
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
