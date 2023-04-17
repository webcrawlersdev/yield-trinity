import { Box, Button,  Typography, Chip, Tooltip, Grid,   Switch } from "@mui/material"
import Master from "../Layouts/Master"
import { useState, useEffect } from 'react'
import DoneIcon from '@mui/icons-material/DoneAllOutlined'
import GasMeterIcon from '@mui/icons-material/GasMeterOutlined'
import WalletIcon from '@mui/icons-material/WalletOutlined'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import { useAccount, useNetwork, useContractWrite, useContractReads,  useBalance, useProvider } from 'wagmi'
import { Web3Button } from '@web3modal/react' 
import CancelIcon from '@mui/icons-material/CancelOutlined'
import { useADDR } from "../Ethereum/Addresses"
import { SHARED_WALLET as SABI } from "../Ethereum/ABIs/SharedWallet"
import { fmWei, precise, toWei } from '../Helpers'
import { toast } from 'react-toastify'

interface IcontractRead {
    functionName: string,
    abi: typeof SABI,
    address: string
}

export default () => {

    const [amount, setamount] = useState(0.5)
    const [tnxMode, settnxMode] = useState<'deposit' | 'withdraw'>('deposit')
    const [gasPrice, setGasPrice] = useState('0.00')
    const provider = useProvider()
    const { isConnected, address, } = useAccount()
    const { chain } = useNetwork()
    const balance = useBalance({ address: address })
    const ADDR = useADDR(chain?.id)

    const userData: IcontractRead = { functionName: 'owner', abi: SABI, address: ADDR['SHARED_WALLET'] }

    const { data, isLoading: tnx_loading, isSuccess, error, isError, write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: ADDR['SHARED_WALLET'] as any, abi: SABI, functionName: tnxMode,
        overrides: tnxMode === 'deposit' ? { value: toWei(amount) } : {},
        args: tnxMode === 'withdraw' ? [toWei(amount)] : undefined
    })

 

    const { data: userDatas, isLoading: u_loading } = useContractReads({
        contracts: [
            { ...(userData as any) },
            { ...(userData as any), functionName: 'ownershipPercentage', args: [address] },
            { ...(userData as any), functionName: 'conspectus', args: [address] },
            { ...(userData as any), functionName: 'contribute', args: [address] },
            { ...(userData as any), functionName: 'withdrawalFee', args: [] },
            { ...(userData as any), functionName: 'dilutedEarning', args: [address] },
        ]
        , watch: true,
        cacheTime: 1000
    })

    useEffect(() => {
        const toastId = "TNX_ID";
        (async () => await balance.refetch({ 'exact': true }))();
        (async () => await provider.getGasPrice().then(i => setGasPrice(fmWei(i as any, 'gwei'))))();

        if (isError) {
            if ('data' in (error as any))
                if ((error as any)?.data?.code == -32000)
                    toast.error("Insufficient Funds 🤚", { toastId })
        }
        if (isSuccess) {
            toast.success(`${tnxMode} successful`, { toastId })
        }
    }, [data, error, userDatas])


    async function handleDepOrWith() {
        // sharedWalletContract.call({from:address, value:})
        if (amount < 0.05)
            return toast.warn(`${chain?.nativeCurrency?.symbol} amount must be atleast 0.05`)
        write?.()
    }

    const NewTnxDeposit = (
        <Box className="input-area">
            <Box className="  alone-contianer">
                {
                    isConnected && <>
                        <Typography component={'p'} >
                            Your share in pool
                        </Typography>
                        <hr />
                    </>
                }
                {
                    isConnected ?
                        <Typography component={'p'} >
                            Your current ownership stake in the  pool capitalization is <span className="green">%{u_loading ? 'loading' : precise((userDatas as any)?.[1] ?? 0)}</span>
                        </Typography>
                        :
                        <Typography component={'p'} >
                            Wallet not <span className="orangered">Connected {isConnected && amount}</span>.
                        </Typography>
                }
            </Box>
        </Box>
    )

    const NewTnxWithdraw = (
        <Box className="input-area">
            <Box className="  alone-contianer">
                {
                    isConnected && <>
                        <Typography component={'p'} >
                            Withdraw up to <span className="orangered">{chain?.nativeCurrency?.symbol}{u_loading ? '---' : precise(fmWei((userDatas as any)?.[2]))}</span>
                        </Typography>
                        <hr />
                    </>
                }
                {
                    isConnected ?
                        <Typography component={'p'} >
                            Your current ownership stake in the  pool capitalization is <span className="green">%{u_loading ? '---' : precise((userDatas as any)?.[1] ?? 0)}</span>.
                        </Typography>
                        :
                        <Typography component={'p'}  >
                            Wallet not <span className="orangered">Connected {isConnected && amount}</span>.
                        </Typography>
                }
            </Box>
        </Box>
    )

    const NewTnxGrid = (
        <Box className="dash-lin-box">
            <Box className="box-navigation">
                <div className="space-between" style={{ width: '100%', }}>
                    <div className="space-between">
                        <Button onClick={() => settnxMode(s => 'deposit')} disabled={tnxMode === 'deposit'} className="box-navigation-btn" >
                            Deposit
                        </Button>
                        <Button onClick={() => settnxMode(s => 'withdraw')} disabled={tnxMode === 'withdraw'} className="box-navigation-btn"  >
                            Withdraw
                        </Button>
                    </div>
                    <CancelIcon className="primary-button" />
                </div>
            </Box>
            <Box className="box-input-area">
                <Box className="input-area">
                    <Box className="input-reactonly">
                        <Button className="primary-button" >
                            <label htmlFor="amount" className="input-label">{chain?.nativeCurrency?.symbol ?? '- - -'}</label>
                        </Button>
                        <input type="number" id="amount" className="input-reading"
                            onChange={(i: any) => setamount(o => (i.target.valueAsNumber >= 0) ? i.target.value : o)}
                            value={amount} placeholder={String(amount)} />
                    </Box>
                </Box>

                {tnxMode === 'deposit' ? NewTnxDeposit : NewTnxWithdraw}

                <Box className="input-area">
                    {
                        tnxMode === 'deposit' ?
                            <Box className="alone-contianer">
                                <div className="space-between">
                                    <Typography component={'p'} >
                                        Lockable Deposit
                                    </Typography>
                                    <InfoIcon />
                                </div>
                                <hr />
                                <div className="space-between">
                                    <Switch />
                                    <input type="number" className="input-reading"
                                        onChange={(i: any) => setamount(o => (i.target.valueAsNumber >= 0) ? i.target.value : o)}
                                        value={amount} placeholder={String(amount)} />
                                    <Button children='days' />
                                </div>
                            </Box>
                            :
                            <Box className="alone-contianer">
                                <div className="space-between">
                                    <Typography component={'p'} >
                                        You Have Locked Deposit
                                    </Typography>
                                    <InfoIcon />
                                </div>
                                <hr />
                                <h1 className="path-name" >Till  00:00:00</h1>
                            </Box>
                    }
                </Box>

                <Box className="input-area" style={{ marginBottom: '1rem', borderRadius: 50, overflow: 'hidden' }}>
                    <div className="chip-wrapper">
                        <div className="tab-lets">
                            {tnxMode != 'deposit' ? <Chip
                                className="chip"
                                label={`Withdrawal fee %${precise((userDatas as any)?.[4] / 100 ?? 0)}`}
                                onClick={() => { }}
                                onDelete={() => { }}
                                deleteIcon={<WalletIcon color='success' />}
                            /> : <Chip
                                className="chip"
                                label="Lockup Period ~ none"
                                onClick={() => { }}
                                onDelete={() => { }}
                                deleteIcon={<DoneIcon />}
                            />}
                            <Chip
                                className="chip"
                                label={`Est. Gas Price ~GWEI/${gasPrice}`}
                                onClick={() => { }}
                                onDelete={() => { }}
                                deleteIcon={<GasMeterIcon />}
                            />
                        </div>
                    </div>
                </Box>

                <Box className="input-area" >
                    {
                        isConnected ?
                            <Button
                                className={`primary-button ${tnxMode === 'withdraw' ? 'bg-red' : ''}`}
                                style={{ width: '100%', boxShadow: 'none' }} variant='contained'
                                disabled={tnx_loading || u_loading}
                                onClick={handleDepOrWith}>
                                {tnxMode}{(tnx_loading || u_loading) && "ing..."}
                            </Button>
                            : <div className="space-between">
                                <Web3Button label="Connect wallet first." />
                                <Button
                                    className={`  ${tnxMode === 'withdraw' ? 'bg-red' : ''}`}
                                    style={{ flexGrow: 1, borderRadius: 10, boxShadow: 'none' }} variant='contained'
                                    onClick={handleDepOrWith}>
                                    <a href="">Learn More</a>
                                </Button>
                            </div>
                    }
                </Box>
            </Box>

        </Box>
    )

    const UserStatsGrig = (
        <Box className="dash-main-box box-stats">
            <Typography component='h2' className="ident">
                Overview 🤚
            </Typography>
            <Box className="box-input-area">
                <Box className="stats-sections">
                    <div className="space-between" style={{ width: 'max-content' }} >
                        <Typography className="balance-overview-text" component='h4'>
                            {chain?.nativeCurrency?.symbol} {u_loading ? '---' : precise(fmWei((userDatas as any)?.[2]))}
                        </Typography>
                        <Tooltip title={'includes: all the funds you can withdraw,  [capital, Profits]'}>
                            <InfoIcon />
                        </Tooltip>
                    </div>
                </Box>
                <Box className="stats-sections">
                    <div className="stats-dash-row">
                        <div className="stats-dash-flexed-box" data-name='+'>
                            <Typography className="balance-overview-text" component='h4'>
                                Credits
                            </Typography>
                            <Typography component='p'>
                                {chain?.nativeCurrency?.name}{u_loading ? '---' : precise(fmWei((userDatas as any)?.[3]))}
                            </Typography>
                        </div>

                        <div className="stats-dash-flexed-box" data-name='%/'>
                            <Typography className="balance-overview-text" component='h2'>
                                Pool Share
                            </Typography>
                            <Typography component='p'>
                                <span className="orangered">
                                    %{u_loading ? '---' : precise((userDatas as any)?.[1] ?? 0)}
                                </span>
                            </Typography>
                        </div>
                        <div className="stats-dash-flexed-box" data-name='-'>
                            <Typography className="balance-overview-text" component='h4'>
                                Diluted earnings
                            </Typography>
                            <Typography component='p'>
                                {chain?.nativeCurrency?.name} <span className="green">+{precise(fmWei((userDatas as any)?.[5] ?? 0))}</span>
                            </Typography>
                        </div>
                        {/* <div className="stats-dash-flexed-box" data-name='%'>
                            <Typography className="balance-overview-text" component='h4'>
                                Historical Profits
                            </Typography>
                            <Typography component='p'>
                                <span className="orangered">DATA COMING SOON</span>
                            </Typography>
                        </div> */}

                    </div>
                </Box>
            </Box>
        </Box>
    )


    return (
        <Master>
            {
                !isConnected && <Typography component='p' style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                    Connect Your Wallet To View Stats
                </Typography>
            }
            <Grid className="dash" style={{ borderRadius: 20 }}>
                {NewTnxGrid}
                {isConnected && UserStatsGrig}
                <Box className="dash-main-box"> </Box>
            </Grid>
        </Master>
    )
}