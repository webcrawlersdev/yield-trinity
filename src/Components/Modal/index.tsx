import { motion } from 'framer-motion'

export default function ContentModal(props: { shown: boolean, children: React.ReactNode, }) {
    const { shown, children } = props

    if (!shown) return <></>

    return <motion.div
        animate={{ top: '110%', opacity: 1 }}
        initial={{ top: '0', opacity: 0 }}
        exit={{ top: '0', opacity: 0 }}
        className="content-modal-mail">
        <div className="container">
            {children}
        </div>
    </motion.div>
}