import { useState } from "react";
import { NavLink } from "react-router-dom";
import { List, X } from "react-bootstrap-icons";
// import Logo from "../../assets/Logo.png";
// import Logo from "../../assets/newLogoNoRed.png";
// import Logo from "../../assets/newLogoWithRed.png";
import Logo from "../../assets/newLogoWithLittleRed.png";
import "./navigation.css";

import { useEthers, useEtherBalance, AvalancheTestnet, Avalanche, useChainState, useConfig, useChainMeta } from "@usedapp/core";



const Navigation = () => {
  const [toggleButton, setToggleButton] = useState("");

  window.onscroll = function () {
    const navi = document.querySelector(".navWrapper");
    let height = window.pageYOffset;
    if (height >= 10) navi.classList.add("secondNav");
    else navi.classList.remove("secondNav");
  };


    const d = new Date();
    let seconds =d.getSeconds();

    const { activateBrowserWallet, account, deactivate, chainId, error, active } = useEthers()
    const etherBalance = useEtherBalance(account)
    const converted = (etherBalance)?.toString()
    
    

  var isConnected = account? true:false;

  const handleConnection = () => {
    if(isConnected){
      deactivate()
    }else{
     activateBrowserWallet()
    } 


  }

  return (
    
    <div className="navWrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-2 helper">
            <div className={`menubar`}  style={{ justifyContent: `${toggleButton=="hideNav" || toggleButton== ""? "space-between": "right"}`}}  >
              <button
                className={`hambargarMenu hideMenu ${toggleButton=="hideNav"|| toggleButton== "" ? "showNav": "hideNav"}`}
                onClick={() => setToggleButton("showNav")}
              >
                <List />
              </button>
              <NavLink to="/" className="Logo">
                <img className="HamburgerLogo" src={Logo} alt="Logo" />
              </NavLink>
              {(chainId == AvalancheTestnet.chainId || chainId ==Avalanche.chainId) ?
                // <div className="cText">here</div>
               ((isConnected)?( 
                <button className={`cBtn btn_Hide`} onClick={() => {handleConnection()}}>
                Disconnect    
              </button>):(
                <button className={`cBtn btn_Hide`} onClick={() => {handleConnection()}}>
                Connect  
              </button>
              )): <button className={`cBtn btn_Hide`} onClick={() => {handleConnection()}}>
              Wrong Network    
            </button>
      
                }

            </div>
          </div>

          <div className= {`col-md-10 ${toggleButton==""?"hideNav":""}`}>
            <ul className={`navigation ${toggleButton}`}>
              <NavLink to="/" className="HambargarLogo">
                <img src={Logo} alt="Logo" />
              </NavLink>
              {/* Tages go here */}
              <span
                className="hideNavigation" style={{background:"none"} }
                onClick={() => setToggleButton("hideNav")}
              >
                <button className="crossButton">
                  <X style={{background:"none"} }/>
                </button>
              </span>
              <li>
              <NavLink to="/speculate">SPECULATE</NavLink>
              </li>
              <li> 
              <NavLink to="/risk">RISK</NavLink>
              </li>
              <li>
                <NavLink to="/">STAKE</NavLink>
              </li>
              <li>
                <NavLink to="/presale">PRESALE</NavLink>
              </li>
              <li>
                <NavLink to="/test">TEST</NavLink>
              </li>
              <li>
                <a to="/" target={"_blank"} href="https://traderjoe.xyz">TOKEN</a>
              </li>
              <li>
              <a target={"_blank"} href="https://stakegame.gitbook.io/stake-game/">DOCS</a>

              </li>

              {
              (chainId== AvalancheTestnet.chainId)?(
              (isConnected) ? 
                (<button className={`cBtn btnToggle`} onClick={() => {handleConnection()}}>
                 Disconnect 
                </button>) : (
                <button className={`cBtn btnToggle`} onClick={() => {handleConnection()}}>
                  Connect
                </button>
                )) : 
                <button className={`cBtn btnToggle`} onClick={() => {handleConnection()}}>
                  Wrong Network
                </button>
                
                
                }
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
