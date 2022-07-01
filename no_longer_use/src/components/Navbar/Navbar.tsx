import { useEthers } from "@usedapp/core";
import {Button, makeStyles} from "@material-ui/core";
import { ConnectButton } from "../ConnectButton";
import ReactDOM from "react-dom/client";
import NavItem from "./NavItem";
import Tabs from '@mui/material/Tabs';
import { Logo } from "../Logo/Logo";



 const useStyles = makeStyles((theme) => ({
        container:{
            padding: theme.spacing(4),
            display:"flex", 
            justifyContent: "flex-end",
            gap:theme.spacing(1)
        }
    }))




export const Navbar = () => {
    const {account, activateBrowserWallet, deactivate} = useEthers()
    const isConnected = account !== undefined
    const classes = useStyles()
  

   

    return(<div>
    
    <Tabs centered>
        <Logo/>
        <NavItem title="Speculate"/>
        <NavItem title="Risk"/>
        <NavItem title="Stake"/>
        <NavItem title="Token"/>
        <NavItem title="Docs"/>
        <NavItem title="Presale"/>
        <ConnectButton/>
    </Tabs>
    

    </div>)


};