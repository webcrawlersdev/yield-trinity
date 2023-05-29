import { Button, CircularProgress } from "@mui/material";
import { IOpportunityCard, IParams, Params } from "../../../../Defaulds";
import { useLocalStorage } from "usehooks-ts";
import { Add, SwapHorizRounded, ArrowRightAlt, ArrowForward } from "@mui/icons-material";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { precise, NumCompact } from "../../../../Helpers";
import Images from '../../../../Assets/image/quickswap-icon.jpg'



export default function OpportunityCard(props: IOpportunityCard) {

    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)
    const { address } = useAccount()

    const inputBalance = useBalance({
        address,
        token: props?.pathFiltered?.[0] as any,
        enabled: Boolean(address && props?.pathFiltered?.[0]),
        watch: true,
        cacheTime: 0
    })

    const outPut = useContractRead({
        functionName: "_getRouteOutput",
        args: [
            props?.dex?.router,
            props?.pathFiltered,
            params?.arbitrade?.amountIn
        ],
        watch: true,
        cacheTime: 0,
        enabled: Boolean(Number(params?.arbitrade?.amountIn) > 0 && props?.pathFiltered?.length > 1 && props?.dex?.router)
    })

    console.log(outPut?.data, inputBalance?.data?.formatted)

    const dataNum = Number(precise(Math.random() * 1.6, 1))

    return (
        <div className={`discover-card ${dataNum < 1 ? 'red' : dataNum > 1 ? '' : 'yellow'}`} data-percentage={dataNum + '%'}>
            <div className="discover-card-heading space-between ">
                <div className="space-between" style={{ gap: '.3rem' }}>
                    <Button
                        className="primary-button light-button space-between"
                        style={{ width: 'max-content', fontSize: 12 }}
                        variant="contained">
                        uniswap <img src={Images} alt={"UNI"} className="token-icon" />
                    </Button>
                    <div className="token-icon-wrap" >
                    </div>
                </div>
                <span></span>
            </div>
            <div className="discover-card-body">
                <div className="tokens-path-is">
                    <div className="space-between" style={{ width: '100%' }}>
                        <div className="discover-trade-amount-info-route">
                            <div className="trade-path-flow">
                                <img src={Images} alt={'one'} className="token-icon" />
                                <span className="trade-amount space-between">
                                    {NumCompact(params?.arbitrade?.amountIn ?? "0.00")} IN
                                </span>
                            </div>
                            <ArrowForward className="swap-icon" />
                            <div className="trade-path-flow">
                                <img src={Images} alt={'one'} className="token-icon" />
                                <span className="trade-amount space-between">
                                    {outPut?.isLoading ? <CircularProgress size={16} color="warning" /> : precise(Math.random() * 10, 1)} OUT
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="discover-card-footing space-between">
                <div className="discover-card-body">
                    <div className="tokens-path-is">{
                        params?.arbitrade?.dexes?.map((dex: any, index: number) => {
                            return dex?.paths?.map((path: any) =>
                                <div className="token-icon-wrap" key={Math.random()}>
                                    <img src={Images} alt={path?.symbol} className="token-icon" />
                                </div>
                            )
                        })
                    }
                    </div>
                </div>
                <Button
                    className="primary-button   light-button"
                    style={{ paddingInline: 12, fontSize: 12 }}
                >
                    {/* <span>*/ "Trade" /*</span> */}
                    {/* <Add /> */}
                </Button>
            </div>
        </div>
    )
}