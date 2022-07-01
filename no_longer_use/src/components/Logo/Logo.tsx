import Tab from '@mui/material/Tab';
import { LogoIcon } from './LogoIcon'; 
import {Button, makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    container:{
        position:"absolute",
        left:"20px",
        // marginRight: "auto",
        display:"flex", 
        justifyContent: "inline",
        gap:theme.spacing(0)
        
    }
}))

export const Logo = () => {
    const classes = useStyles()

    return(<div>
         <Tab icon={<LogoIcon/>} label={"StakeGame"} iconPosition="end" className={classes.container} style={{color:"black", fill:"grey"}} />
        {/* <div><img src="../public/Stake-logo.png" className="logo"/> StakeGame</div> */}

    </div>)


}
