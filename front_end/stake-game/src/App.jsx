import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Stake from "./pages/Stake/Stake";
import Risk from "./pages/Risk/Risk";
import Speculate from "./pages/Speculate/Speculate";
import Presale from "./pages/Presale/Presale";
import Test from "./pages/Test/Test";
import Notfound from "./pages/notfound/Notfound";
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WagmiConfig, createClient, chain, chainId } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { configureChains } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'







function App() {



  return (

    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Stake />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/speculate" element={<Speculate />} />
          <Route path="/presale" element={<Presale />} />
          <Route path="/test" element={<Test />} />
          <Route path="/*" element={<Notfound />} />
        </Routes>
      </div>
    </BrowserRouter>

  );
}

export default App;
