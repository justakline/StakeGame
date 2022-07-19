import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {ChainId, DAppProvider, Mainnet, Avalanche, AvalancheTestnet} from "@usedapp/core";
import { getDefaultProvider } from "ethers";
import { WagmiConfig, createClient, chain } from 'wagmi'
// import { MetamaskConnect } from './components/MetamaskConnect'


const config = {
  readOnlyChainId: AvalancheTestnet.chainId,
  readOnlyUrls: {
    [AvalancheTestnet.chainId]: "https://api.avax-test.network/ext/bc/C/rpc",
    [Avalanche.chainId]: "https://api.avax.network/ext/bc/C/rpc"
  }, notifications: {
    expirationPeriod: 1000,
    checkInterval: 1000,
    // autoConnect:true
    networks:[Avalanche, AvalancheTestnet]
  }
}

ReactDOM.createRoot(document.getElementById("root")).render( 

  <DAppProvider config={config}>

    <App />
    </DAppProvider>



);
