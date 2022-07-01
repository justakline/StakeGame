import { useEthers,useEtherBalance, useCall } from "@usedapp/core";

const ContractCall = (aContract, aMethod, arguementList) => {
    // const arg = arguements[]
    const listOfArgs =[]
  

    const { value, error } = useCall({ contract:aContract, method: aMethod, args: arguementList}) ?? {}
    return value
}



export default ContractCall