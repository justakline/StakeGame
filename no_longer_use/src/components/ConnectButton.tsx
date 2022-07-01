import { useEthers } from "@usedapp/core";
import {Button, makeStyles} from "@material-ui/core";


 const useStyles = makeStyles((theme) => ({
        container:{
            position:"fixed",
            right:"20px",
            // marginRight: "auto",
            display:"flex", 
            justifyContent: "inline",
            gap:theme.spacing(0)
            
        }
    }))




export const ConnectButton = () => {
    const {account, activateBrowserWallet, deactivate} = useEthers()
    const isConnected = account !== undefined
    const classes = useStyles()
  

   

    return(

    
    <div className={classes.container} id="connect-button">
        <div>
        {isConnected? ( 
            
            <Button color="default" onClick={deactivate} variant="contained">
                Disconnect
            </Button>
        ):(
            <Button color="default" onClick= {() => activateBrowserWallet()} variant="contained">
                Connect
            </Button>

        )
        }   
        </div>
    </div>)


}


