import React from 'react';

import Button from "../utils/Button/Button";
import {imageUrl} from "../../data/images";
import {RARITY_TITLES, SLOTS} from "../../game/catalog";
import {STAT_KEYS, STAT_TITLES} from "../../game/stats";

import styles from './Card.module.scss'

const formatStat = (value) => value > 0 ? `+${value}` : value;

// item: catalog entry. action: optional { label, onClick, disabled }.
const Card = ({item, action, isNew, note}) => {
    const img = imageUrl(item.img);
    const slotTitle = SLOTS.find((slot) => slot.id === item.slot)?.title;

    return (
        <div className={`${styles.wrapper} ${styles[item.rarity] ?? ''}`}>
            <div className={styles.imageWrapper}>
                {img
                    ? <img src={img} className={styles.image} alt=""/>
                    : <span className={styles.placeholder}>{slotTitle}</span>}
                {isNew ? <span className={styles.badge}>Новое</span> : null}
            </div>

            {item.rarity ? <p className={styles.rarity}>{RARITY_TITLES[item.rarity]}</p> : null}
            <p className={styles.title}>{item.title}</p>

            <ul className={styles.list}>
                {STAT_KEYS.map((key) => (
                    <li className={styles.listItem} key={key}>
                        <span>{STAT_TITLES[key]}</span>
                        <span className={item.stats[key] <= 0 ? styles.muted : undefined}>
                            {formatStat(item.stats[key])}
                        </span>
                    </li>
                ))}
            </ul>

            {note ? <p className={styles.note}>{note}</p> : null}
            {action
                ? <Button onClick={action.onClick} disabled={action.disabled}>{action.label}</Button>
                : null}
        </div>
    )
}

export default Card;
