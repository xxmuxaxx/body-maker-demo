import React, {useState} from "react";
import {useNavigate, useSearchParams} from "react-router";

import Button from "../../Components/utils/Button/Button";
import Portrait from "./Portrait";
import {boosters, opponents, ranks} from "../../game/catalog";
import {rankIndexForXp} from "../../game/ranks";
import {STAT_KEYS, STAT_TITLES, computeStats} from "../../game/stats";
import {useGameStore} from "../../store/gameStore";
import {generatedArt} from "../../data/images";

import styles from "./Match.module.scss";

const Opponents = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const state = useGameStore();
    const rankIndex = rankIndexForXp(state.xp);

    const [boosterId, setBoosterId] = useState(() => {
        const requested = params.get("booster");
        return state.boosters[requested] > 0 ? requested : null;
    });
    const stats = computeStats(state, boosterId).total;
    const ownedBoosters = boosters.filter((b) => state.boosters[b.id] > 0);

    const challenge = (opponentId) =>
        navigate(`/match/${opponentId}${boosterId ? `?booster=${boosterId}` : ""}`);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Поединки</h1>

            <div className={styles.rules}>
                <p><b>Серия пенальти, 5 ударов на каждого.</b> Ты бьёшь первым, потом стоишь в воротах.</p>
                <p>Удар в «девятку» (верх) вратарю взять труднее, но легче промахнуться. Вратарь спасает,
                    только если угадал сторону.</p>
                <p>{STAT_TITLES.attack}: точность удара. {STAT_TITLES.agility}: шанс взять мяч.
                    {" "}{STAT_TITLES.defense}: соперник чаще мажет.</p>
            </div>

            <div className={styles.setup}>
                <div>
                    <p className={styles.setupLabel}>Твои характеристики</p>
                    <div className={styles.statRow}>
                        {STAT_KEYS.map((key) => (
                            <span key={key} className={styles.statChip}>{STAT_TITLES[key]} <b>{stats[key]}</b></span>
                        ))}
                    </div>
                </div>
                <div>
                    <p className={styles.setupLabel}>Бустер на поединок</p>
                    <div className={styles.statRow}>
                        <button type="button"
                                className={`${styles.chip} ${boosterId ? "" : styles.chipActive}`}
                                onClick={() => setBoosterId(null)}>
                            Без бустера
                        </button>
                        {ownedBoosters.map((b) => (
                            <button type="button" key={b.id}
                                    className={`${styles.chip} ${boosterId === b.id ? styles.chipActive : ""}`}
                                    onClick={() => setBoosterId(b.id)}
                                    title={b.description}>
                                {b.title} ×{state.boosters[b.id]}
                            </button>
                        ))}
                        {ownedBoosters.length ? null : <span className={styles.muted}>Бустеров нет, их дают за победы</span>}
                    </div>
                </div>
            </div>

            <div className={styles.opponentGrid}>
                {opponents.map((opponent) => {
                    const locked = opponent.minRank > rankIndex;
                    return (
                        <div key={opponent.id} className={`${styles.opponent} ${locked ? styles.opponentLocked : ""}`}>
                            <Portrait appearance={opponent.appearance} art={generatedArt("opponents", opponent.id)}
                                      kit={opponent.kit}/>
                            <p className={styles.opponentName}>{opponent.name}</p>
                            <p className={styles.opponentDescription}>{opponent.description}</p>
                            <ul className={styles.opponentStats}>
                                {STAT_KEYS.map((key) => (
                                    <li key={key}>
                                        <span>{STAT_TITLES[key]}</span>
                                        <b className={opponent.stats[key] > stats[key] ? styles.worse : styles.better}>
                                            {opponent.stats[key]}
                                        </b>
                                    </li>
                                ))}
                            </ul>
                            <p className={styles.opponentReward}>
                                Победа: +{opponent.reward.xp} очков, +{opponent.reward.coins} монет, подарок
                            </p>
                            <Button filled={!locked} disabled={locked} onClick={() => challenge(opponent.id)}>
                                {locked ? `С ранга «${ranks[opponent.minRank].name}»` : "Вызвать"}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Opponents;
