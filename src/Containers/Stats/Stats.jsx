import React from "react";
import {Link} from "react-router";

import {boostersById, opponentsById} from "../../game/catalog";
import {useGameStore} from "../../store/gameStore";

import styles from "./Stats.module.scss";

const OUTCOMES = {win: "Победа", draw: "Ничья", loss: "Поражение"};

const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleString("ru-RU", {day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"});

const Stats = () => {
    const record = useGameStore((state) => state.record);
    const history = useGameStore((state) => state.history);
    const games = record.wins + record.draws + record.losses;

    const tiles = [
        {label: "Поединков", value: games},
        {label: "Побед", value: record.wins},
        {label: "Ничьих", value: record.draws},
        {label: "Поражений", value: record.losses},
        {label: "Процент побед", value: games ? `${Math.round((record.wins / games) * 100)}%` : "—"},
    ];

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Статистика</h1>
            <div className={styles.tiles}>
                {tiles.map((tile) => (
                    <div className={styles.tile} key={tile.label}>
                        <span>{tile.label}</span>
                        <b>{tile.value}</b>
                    </div>
                ))}
            </div>

            <h2 className={styles.subtitle}>Последние поединки</h2>
            {history.length ? (
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Когда</th>
                        <th>Соперник</th>
                        <th>Счёт</th>
                        <th>Итог</th>
                        <th>Награда</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((entry) => (
                        <tr key={entry.date}>
                            <td>{formatDate(entry.date)}</td>
                            <td>
                                {opponentsById[entry.opponentId]?.name ?? entry.opponentId}
                                {entry.boosterId ? (
                                    <span className={styles.booster}> · {boostersById[entry.boosterId]?.title}</span>
                                ) : null}
                            </td>
                            <td>{entry.score.player} : {entry.score.opponent}</td>
                            <td className={styles[entry.outcome]}>{OUTCOMES[entry.outcome]}</td>
                            <td>+{entry.rewards.xp} опыта, +{entry.rewards.coins} монет</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p className={styles.empty}>Поединков ещё не было. <Link to="/match">Сыграть первый</Link></p>
            )}
        </div>
    );
};

export default Stats;
