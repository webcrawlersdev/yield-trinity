import { Box, Button, Divider, Grid, Switch } from "@mui/material";
import Master from "../Layouts/Master";
import { Web3Button } from "@web3modal/react";
import { ArrowDropDown, Balance, Expand, Fullscreen, FullscreenExit, Settings, SwipeRightAlt, WalletTwoTone, } from "@mui/icons-material";
import { useAccount, useNetwork, useProvider } from "wagmi";
import ContentModal from "../Components/Modal";
import { useADDR } from "../Ethereum/Addresses";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from 'react'
import { fmWei, precise } from "../Helpers";


export default () => {

    const { isConnected, address, } = useAccount()
    const Provider = useProvider()
    const [sDxs, setSDxs] = useState(false)
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);
    const [q, setSearchParams] = useSearchParams({ dex: 'uniswap', });
    const [baseBalance, setBasebalance] = useState<string | number>(0)
    const [expandContainer, setExpnadContainer] = useState(true)
    const [dataDisplayType, setDataDisplayType] = useState<'variants' | 'transactions' | 'pool'>('variants')

    const dex = (ADDR?.DEXS as any)?.filter((d: any) => d?.NAME?.includes((q.get('dex') as any)?.toLowerCase()?.replace(/[^a-zA-Z]+/g, '')))[0]

    const handleNewDexSelected = (dexname: string) => {
        setSDxs(false)
        setSearchParams({ dex: dexname })
    }

    useEffect(() => {
        (async () => {
            const base = await Provider.getBalance(String(address))
            setBasebalance(o => o = precise(fmWei(String(base))))
        })();

    }, [])

    const DexSelector =
        <div className="space-between relative-container ">
            <Button
                onClick={() => setSDxs(o => !o)}
                variant='contained'
                style={{ padding: '.2rem' }}
                className={`primary-button dark-button ${!dex?.NAME && 'error'}`}>
                <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}&nbsp;<ArrowDropDown />
            </Button>
            <ContentModal shown={sDxs}>
                <div className="flexed-tabs">
                    {
                        (ADDR?.DEXS as any)?.map((dex: any) => {
                            if (!(dex?.NAME?.includes((q.get('dex') as any)?.toLowerCase()?.replace(/[^a-zA-Z]+/g, '')))) {
                                return <Button
                                    onClick={() => handleNewDexSelected(dex?.NAME)}
                                    variant='contained' style={{ padding: '.2rem' }}
                                    className={`primary-button dark-button flexed-tab ${!dex?.NAME && 'error'}`}>
                                    <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}
                                </Button>
                            }
                            return <></>
                        })
                    }
                </div>
            </ContentModal>
        </div>

    const ExTendedContainer = <div className="expanded-container">
        <Box className="box-navigation">
            <div className="space-between" style={{ width: '100%', }}>
                <div className="space-between">
                    <Button variant='contained' disabled={dataDisplayType === 'variants'} onClick={() => setDataDisplayType('variants')} className="box-navigation-btn" >
                        Variants
                    </Button>
                    <Button disabled={dataDisplayType === 'pool'} onClick={() => setDataDisplayType('pool')} className="box-navigation-btn" >
                        Pool Info
                    </Button>
                    <Button disabled={dataDisplayType === 'transactions'} onClick={() => setDataDisplayType('transactions')} className="box-navigation-btn"  >
                        Transactions
                    </Button>
                </div>
            </div>
        </Box>

        <div className="info-container">
            <div className="only-two-flexed">
                <div className="two-flexed-inner">
                    <h3 className="headline-3 paragraph">
                        {"BUSD"}/WETH <a href="">{"<0x0..123>"}</a>
                    </h3>
                    <br />
                    <h3 className="headline-3 ">
                        <span className="orangered"> LAST PRICE </span>0.0000002001
                    </h3>
                    <br />
                    <h3 className="headline-3 ">
                        <span className="orangered">CURRENT PRICE</span> 0.0000002001
                    </h3>
                    <br />
                    <h3 className="headline-3 ">
                         <span className="orangered">BOUGHT PRICE</span> 0.0000002001
                    </h3>
                    <br />
                    <h3 className="headline-3 ">
                        <span className="orangered">SOLD PRICE</span> 0.0000002001
                    </h3>
                </div>
            </div>
        </div>

    </div>


    return <Master>
        <Grid className="dash" style={{ borderRadius: 20 }}>
            <Box className={`dash-lin-box relative-container expanable ${expandContainer ? 'expanded' : ''}`}>
                <div className="contained">
                    {/* <div className="expand-container" onClick={() => setExpnadContainer(e => !e)}>
                        <SwipeRightAlt />  
                    </div> */}
                    <div className="space-between" style={{ width: '100%', }}>
                        <div className="space-between">
                            Auto <Switch />
                        </div>
                        {DexSelector}

                        {
                            expandContainer ?
                                <FullscreenExit className="primary-button" onClick={() => setExpnadContainer(e => !e)} />
                                : <Fullscreen className="primary-button" onClick={() => setExpnadContainer(e => !e)} />
                        }

                    </div>
                    <Box className="box-input-area">
                        <Box className="input-area">
                            <div className="filter-input-wrapper space-between" style={{ width: '100%' }}>
                                <input className="input-reading"
                                    onChange={() => { }}
                                    placeholder='Pair Address... 0x0...' />
                                <Button className="primary-button" >
                                    <label htmlFor="amount" className="input-label">{'PASTE'}</label>
                                </Button>
                            </div>

                            <Box className="alone-contianer " style={{ padding: '.4rem', marginTop: '1rem' }}>
                                <label htmlFor="amount" className="absolute-label space-between">
                                    Pay
                                    <span className="small-text flex-left"><Balance /> {chain?.nativeCurrency?.symbol} ~{baseBalance}</span>
                                </label>
                                <Divider />
                                <div className="space-between">
                                    <input type="number" id="amount" className="input-reading transparent-input"
                                        onChange={(i: any) => { }}
                                        placeholder={`${chain?.nativeCurrency?.symbol} 0.00`} />
                                    <Button className=" dark-button" >
                                        <label htmlFor="amount" className="input-label">&nbsp;&nbsp;&nbsp;&nbsp;{'WETH'}</label>
                                        <ArrowDropDown />&nbsp;&nbsp;
                                    </Button>
                                </div>
                            </Box>
                            <Box className="alone-contianer " style={{ padding: '.4rem', marginTop: '1rem' }}>
                                <label htmlFor="amount" className="absolute-label space-between">
                                    Receive
                                    <span className="small-text flex-left"><Balance /> {chain?.nativeCurrency?.symbol} ~{baseBalance}</span>
                                </label>
                                <Divider />
                                <div className="space-between">
                                    <input type="number" id="amount" className="input-reading transparent-input"
                                        onChange={(i: any) => { }}
                                        placeholder={`${chain?.nativeCurrency?.symbol} 0.00`} />
                                    <Button className=" dark-button" >
                                        <label htmlFor="amount" className="input-label">&nbsp;&nbsp;&nbsp;&nbsp;{'WETH'}</label>
                                        <ArrowDropDown />&nbsp;&nbsp;
                                    </Button>
                                </div>
                            </Box>
                        </Box>

                        <Box className="input-area" >
                            {
                                isConnected ?
                                    <Button variant="contained"
                                        className={`primary-button `}>
                                        Transact{"ing..."}
                                    </Button>
                                    : <div className="space-between">
                                        <Web3Button label="Connect wallet first." />
                                        <Button
                                            className={`  `}
                                            style={{ flexGrow: 1, borderRadius: 10, boxShadow: 'none' }} variant='contained' >
                                            <a href="">What is this?</a>
                                        </Button>
                                    </div>
                            }
                        </Box>
                    </Box>
                </div>

                {expandContainer && ExTendedContainer}
            </Box>
        </Grid>
    </Master>
}