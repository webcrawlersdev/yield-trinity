import Master from "../Layouts/Master"
import { Link, useSearchParams } from 'react-router-dom'
import ExploreNewPairs from "./Partials/ExploreNewPairs";
import { Grid, } from '@mui/material/'




export default () => {

    const [searchParams, setSearchParams] = useSearchParams({ explore: 'new-pairs' });

    return (
        <Master>
            <h3 className="headline-3"></h3>
            <Grid className="dash" style={{ borderRadius: 20 }}>
                {searchParams.get('explore') === 'new-pairs' && <ExploreNewPairs />}
            </Grid>
        </Master>
    )
}