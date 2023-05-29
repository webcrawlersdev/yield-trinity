import { motion } from 'framer-motion'
import OpportunityCard from './OpportunityCard'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IOpportunityCard } from '../../../../Defaulds'


export default function DiscoverArbitrageOpportunities() {

    const data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}] as any

    const query = useQuery({
        queryKey: ['opportunities'],
        queryFn: async () => await axios(process.env.REACT_APP_YIELD_TRINITY_API as any),
        enabled: Boolean(process.env.REACT_APP_YIELD_TRINITY_API),
        cacheTime: 0,
        staleTime: 10,
        refetchInterval: 2000,
    })

    console.log(query?.data?.data)

    return (
        <motion.div
            initial={{ marginLeft: 100 }}
            animate={{ marginLeft: 0 }}
            className="dash   ">
            <div className="discover-cards-master">
                {data?.map((opportunity: IOpportunityCard) => {
                    return <OpportunityCard
                        {...opportunity}
                    />
                })}
            </div>
        </motion.div>
    )
}