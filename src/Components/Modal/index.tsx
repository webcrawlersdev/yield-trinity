import { motion } from 'framer-motion'
import { useRef } from 'react'
import useMouseUpEvent from '../../Hooks/useMouseUpEvent'


export interface IModal {
    shown: boolean,
    children: React.ReactNode,
    onModalClose?: Function,
    position?: 'right' | 'left' | 'center'
}

export default function ContentModal(props: IModal) {
    const { shown, children, onModalClose, position = 'right' } = props
    const containerRef = useRef<any>()
    useMouseUpEvent(containerRef, onModalClose, containerRef)

    if (!shown) return <></>

    const modalVariants = {
        center: { marginInline: 'auto', opacity: 1 },
        left: { marginRight: 'auto', opacity: 1 },
        right: { marginLeft: 'auto', opacity: 1 }
    }

    return <div className="content-modal-mail">
        <motion.div
            animate={position === 'center' ? 'center' : position == 'left' ? 'left' : 'right'}
            variants={modalVariants}
            initial={{ opacity: 0 }}
            ref={containerRef} className="container">
            {children}
        </motion.div>
    </div>
}