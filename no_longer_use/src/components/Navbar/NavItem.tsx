import Tab from '@mui/material/Tab';
import * as React from 'react';




export default function NavItem (props: { title: string }){
    return(<div>
        
        <Tab label={props.title} className={props.title} style={{color:"black", fill:"grey"}} />


    </div>)



}

