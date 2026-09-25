import React from 'react'
import {useNavigate} from "react-router";

import Button from "../utils/Button/Button";
import {boosters} from "../../game/catalog";
import {artUrl} from "../../data/images";
import {useGameStore} from "../../store/gameStore";

import styles from './Boosters.module.scss'

const Boosters = (props) => {
    const navigate = useNavigate();
    const counts = useGameStore((state) => state.boosters);

    return (
        <div className={styles.list} {...props}>
            {boosters.map((booster) => {
                const count = counts[booster.id] ?? 0;
                return (
                    <div className={`${styles.card} ${count ? "" : styles.cardEmpty}`} key={booster.id}>
                        <p className={styles.cardTitle}>{booster.title}</p>
                        <p className={styles.cardDescription}>{booster.description}</p>
                        <div className={styles.cardImageWrapper}>
                            <img src={artUrl("boosters", booster)} className={styles.cardImage} alt=""/>
                            <span className={styles.cardCount}>×{count}</span>
                        </div>
                        <Button disabled={!count} onClick={() => navigate(`/match?booster=${booster.id}`)}>
                            В поединок
                        </Button>
                    </div>
                );
            })}
        </div>
    )
}

export default Boosters
