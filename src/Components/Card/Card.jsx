import React from 'react';

import styles from './Card.module.scss'
import Button from "../utils/Button/Button";

const Card = ({item, showButton}) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.imageWrapper}>
                <img src={item.img} className={styles.image} alt=""/>
            </div>

            <p className={styles.title}>{item.title}</p>

            <ul className={styles.list}>
                <li className={styles.listItem}>
                    <span>Защита</span>
                    <span>{item.defense > 0 ? `+${item.defense}` : item.defense}</span>
                </li>
                <li className={styles.listItem}>
                    <span>Ловкость</span>
                    <span>{item.agility > 0 ? `+${item.agility}` : item.agility}</span>
                </li>
                <li className={styles.listItem}>
                    <span>Нападение</span>
                    <span className={`${item.attack <= 0 ? styles.loh : null}`}>
                        {item.attack > 0 ? `+${item.attack}` : item.attack}
                    </span>
                </li>
            </ul>

            {showButton ? <Button>Надеть</Button> : null}
        </div>
    )
}

export default Card;