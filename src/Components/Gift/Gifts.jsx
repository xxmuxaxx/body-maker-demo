import React, {useEffect} from 'react'
import {animated, useSpring} from "react-spring";

import Card from "../Card/Card";

import star from '../../assets/img/star.svg'
import box from '../../assets/img/box.svg'
import cap from '../../assets/img/cap.svg'
import styles from "./Gift.module.scss";

const Gifts = ({isOpen, items, onClose}) => {
    const [giftListStyle, giftListStyleAnimate] = useSpring(() => ({transform: 'scale(0)'}))
    const [giftCloseStyle, giftCloseAnimate] = useSpring(() => ({opacity: 0}))
    const [giftStarStyle, giftStarAnimate] = useSpring(() => ({opacity: 0}))
    const [giftCapStyle, giftCapAnimate] = useSpring(() => ({
        opacity: 0,
        transform: 'rotate(27deg) translate(-22%, 135%)'
    }))

    useEffect(() => {
        if (isOpen) {
            giftListStyleAnimate({delay: 1000, transform: 'scale(1)'})
            giftCloseAnimate({opacity: 1, delay: 2000})
            giftStarAnimate({opacity: 0.26})
            giftCapAnimate({opacity: 1, transform: 'rotate(0) translate(-50%, -20%)'})
        } else {
            giftListStyleAnimate({transform: 'scale(0)'})
            giftCloseAnimate({opacity: 0})
            giftStarAnimate({opacity: 0})
            giftCapAnimate({
                opacity: 0,
                transform: 'rotate(27deg) translate(-22%, 135%)'
            })
        }
    })

    return (
        <div className={`${styles.giftWrapper} ${isOpen ? styles.giftWrapperShow : null}`}>

            <animated.img src={star} className={styles.giftStar} style={giftStarStyle}/>
            <animated.img src={box} className={styles.giftBox}/>
            <animated.img src={cap} className={styles.giftCap} style={giftCapStyle}/>

            <animated.div className={styles.giftList} style={giftListStyle}>
                <animated.button onClick={onClose} className={styles.giftClose} style={giftCloseStyle}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd"
                              d="M7.00003 7.94247L12.0588 13.0012L13.0016 12.0584L7.94283 6.99966L13.0011 1.94138L12.0583 0.99857L7.00003 6.05685L1.94122 0.998047L0.998413 1.94086L6.05722 6.99966L0.999017 12.0579L1.94183 13.0007L7.00003 7.94247Z"
                              fill="white"/>
                    </svg>
                </animated.button>
                {items.map((item, index) => <Card key={index} item={item}/>)}
            </animated.div>
        </div>
    )
}

export default Gifts