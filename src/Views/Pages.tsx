import Master from "../Layouts/Master"
import { Link, useSearchParams } from 'react-router-dom'
import ExploreNewPairs from "./Partials/ExploreNewPairs";
import { Grid, } from '@mui/material/'
import SwapTokens from "./Partials/SwapTokens";




export default () => {

    const [searchParams, setSearchParams] = useSearchParams({ explore: 'pairs' });

    return (
        <Master>
            <h3 className="headline-3">{searchParams.get('page')} HEY FRED {searchParams.get('pair')}</h3>
            <Grid className="dash" style={{ borderRadius: 20 }}>
                {searchParams.get('page') === 'pairs' && <ExploreNewPairs />}
                {searchParams.get('page') === 'swap' && <SwapTokens />}
            </Grid>
        </Master>
    )
}