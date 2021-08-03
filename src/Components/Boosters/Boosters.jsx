import React from 'react'

import Button from "../utils/Button/Button";

import styles from './Boosters.module.scss'

import img1 from '../../assets/img/booster-img-1.png';
import img2 from '../../assets/img/booster-img-2.png';

const Boosters = ({onClick, ...props}) => {
    return (
        <div className={styles.list} {...props}>
            <div className={styles.card}>
                <p className={styles.cardTitle}>Бустер от тренера</p>
                <img src={img1} className={styles.cardImage} alt="img1"/>
                <Button onClick={onClick}>Смотреть!</Button>
            </div>
            <div className={styles.card}>
                <p className={styles.cardTitle}>Новый бустер</p>
                <img src={img2} className={styles.cardImage} alt="img1"/>
                <Button>Смотреть!</Button>
            </div>
        </div>
    )
}

export default Boosters