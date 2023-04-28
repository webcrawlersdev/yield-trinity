import { motion } from 'framer-motion'
import { useRef } from 'react'
import useMouseUpEvent from '../../Hooks/useMouseUpEvent'

export default function ContentModal(props: { shown: boolean, children: React.ReactNode, onModalClose?: Function }) {
    const { shown, children, onModalClose } = props
    const containerRef = useRef<any>()
    useMouseUpEvent(containerRef, onModalClose, containerRef)

    if (!shown) return <></>

    return <div className="content-modal-mail">
        <motion.div
            animate={{ marginRight: 0, opacity: 1 }}
            initial={{ marginRight: -200, opacity: 0 }}
            exit={{ marginRight: 200, opacity: 0 }}
            ref={containerRef} className="container">
            {children}
        </motion.div>
    </div>
}