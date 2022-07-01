


import { useEthers,useEtherBalance, useCall } from "@usedapp/core";

const StakeFarmStakingBalance = (account, farmContract) => {

    const { value, error } = useCall({ contract:farmContract, method: 'getStakingBalance', args: [account ?? ''] }) ?? {}
    return value
}



export default StakeFarmStakingBalance