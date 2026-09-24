import React, {useEffect, useRef, useState} from "react";
import {Link, Navigate, useNavigate, useParams, useSearchParams} from "react-router";

import Button from "../../Components/utils/Button/Button";
import {Head} from "../../Components/BodyMaker";
import Portrait from "./Portrait";
import {boostersById, opponentsById, ranks} from "../../game/catalog";
import {
    COLUMNS,
    KICKS_PER_SIDE,
    ZONES,
    createMatch,
    currentTurn,
    isFinished,
    kicksBy,
    matchOutcome,
    playerSave,
    playerShoot,
    score,
    zoneById,
} from "../../game/penalty";
import {STAT_KEYS, STAT_TITLES, computeStats} from "../../game/stats";
import {useGameStore} from "../../store/gameStore";

import styles from "./Match.module.scss";

const KICK_ANIMATION_MS = 1400;

// Pitch geometry (px), matches .pitch / .goal in Match.module.scss.
const GOAL = {left: 80, top: 60, width: 480, height: 200};
const SPOT = {x: 320, y: 370};
const COLUMN_X = {left: GOAL.left + 80, center: GOAL.left + 240, right: GOAL.left + 400};
const ROW_Y = {top: GOAL.top + 50, bottom: GOAL.top + 150};
const KEEPER_SHIFT = {left: -150, center: 0, right: 150};
const COLUMN_TITLES = {left: "Влево", center: "По центру", right: "Вправо"};

const ballTarget = (kick) => {
    const zone = zoneById(kick.zoneId);
    if (kick.outcome !== "miss") return {x: COLUMN_X[zone.col], y: ROW_Y[zone.row]};
    // Missed: over the bar, or wide of the post for low corner shots.
    if (zone.row === "top" || zone.col === "center") return {x: COLUMN_X[zone.col], y: GOAL.top - 40};
    return {x: zone.col === "left" ? GOAL.left - 45 : GOAL.left + GOAL.width + 45, y: ROW_Y.bottom};
};

const kickMessage = (kick) => {
    if (kick.side === "player") {
        return {
            goal: {title: "ГОЛ!", text: "Ты забил", tone: "good"},
            saved: {title: "СЕЙВ", text: "Вратарь угадал", tone: "bad"},
            miss: {title: "МИМО", text: "Удар не в створ", tone: "bad"},
        }[kick.outcome];
    }
    return {
        goal: {title: "ГОЛ", text: "Соперник забил", tone: "bad"},
        saved: {title: "СЕЙВ!", text: "Ты взял мяч", tone: "good"},
        miss: {title: "МИМО!", text: "Соперник промахнулся", tone: "good"},
    }[kick.outcome];
};

const OUTCOME_TITLES = {win: "Победа!", draw: "Ничья", loss: "Поражение"};

const KickDots = ({kicks}) => (
    <div className={styles.dots}>
        {Array.from({length: KICKS_PER_SIDE}, (_, i) => {
            const kick = kicks[i];
            const cls = !kick ? "" : kick.outcome === "goal" ? styles.dotGoal : styles.dotMiss;
            return <span key={i} className={`${styles.dot} ${cls}`}/>;
        })}
    </div>
);

const Keeper = ({appearance, kit, diveCol}) => {
    const shift = diveCol ? KEEPER_SHIFT[diveCol] : 0;
    const tilt = diveCol === "left" ? -35 : diveCol === "right" ? 35 : 0;
    return (
        <div className={styles.keeper}
             style={{transform: `translateX(calc(-50% + ${shift}px)) rotate(${tilt}deg)`}}>
            <div className={styles.keeperHead}><Head {...appearance}/></div>
            <div className={styles.keeperBody} style={{background: kit}}/>
        </div>
    );
};

const MatchScreen = ({opponent, initialBoosterId}) => {
    const navigate = useNavigate();
    const state = useGameStore();
    const finishMatch = useGameStore((s) => s.finishMatch);

    const [boosterId, setBoosterId] = useState(initialBoosterId);
    const [match, setMatch] = useState(() =>
        createMatch({player: computeStats(state, initialBoosterId).total, opponent: opponent.stats}));
    const [lastKick, setLastKick] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [summary, setSummary] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const rng = Math.random;

    const applyKick = (next) => {
        setMatch(next);
        setLastKick(next.kicks[next.kicks.length - 1]);
        setAnimating(true);
        if (isFinished(next)) {
            setSummary({
                outcome: matchOutcome(next),
                score: score(next),
                ...finishMatch({opponent, outcome: matchOutcome(next), score: score(next), boosterId}, rng),
            });
        }
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setAnimating(false), KICK_ANIMATION_MS);
    };

    const onShoot = (zoneId) => {
        if (!animating) applyKick(playerShoot(match, zoneId, rng));
    };

    const onDive = (col) => {
        if (!animating) applyKick(playerSave(match, col, rng));
    };

    const onRematch = () => {
        // The booster was spent on the previous match.
        setBoosterId(null);
        setMatch(createMatch({player: computeStats(useGameStore.getState()).total, opponent: opponent.stats}));
        setLastKick(null);
        setSummary(null);
    };

    const finished = isFinished(match);
    const turn = currentTurn(match);
    const {player: playerGoals, opponent: opponentGoals} = score(match);
    const me = {appearance: state.profile.appearance, kit: "#96C83C"};
    const them = {appearance: opponent.appearance, kit: opponent.kit};

    // During the animation show the kick that just happened, otherwise the upcoming one.
    const shownSide = animating && lastKick ? lastKick.side : turn === "shoot" ? "player" : "opponent";
    const keeper = shownSide === "player" ? them : me;
    const ball = animating && lastKick ? ballTarget(lastKick) : SPOT;
    const message = animating && lastKick ? kickMessage(lastKick) : null;
    const canAct = !animating && !finished;

    return (
        <div className={styles.page}>
            <div className={styles.scoreboard}>
                <div className={styles.side}>
                    <Portrait appearance={me.appearance} kit={me.kit} size={64}/>
                    <div>
                        <p className={styles.sideName}>{state.profile.nickname || "Ты"}</p>
                        <KickDots kicks={kicksBy(match, "player")}/>
                    </div>
                </div>
                <div className={styles.score}>{playerGoals} : {opponentGoals}</div>
                <div className={`${styles.side} ${styles.sideRight}`}>
                    <div>
                        <p className={styles.sideName}>{opponent.name}</p>
                        <KickDots kicks={kicksBy(match, "opponent")}/>
                    </div>
                    <Portrait appearance={them.appearance} kit={them.kit} size={64}/>
                </div>
            </div>

            <div className={styles.arena}>
                <div className={styles.pitch}>
                    <div className={styles.goal}>
                        {canAct && turn === "shoot" ? (
                            <div className={styles.zones}>
                                {ZONES.map((zone) => (
                                    <button type="button" key={zone.id} className={styles.zone}
                                            onClick={() => onShoot(zone.id)}
                                            aria-label={`Удар: ${zone.row === "top" ? "верх" : "низ"}, ${COLUMN_TITLES[zone.col]}`}/>
                                ))}
                            </div>
                        ) : null}
                        {canAct && turn === "save" ? (
                            <div className={styles.columns}>
                                {COLUMNS.map((col) => (
                                    <button type="button" key={col} className={styles.column} onClick={() => onDive(col)}>
                                        {COLUMN_TITLES[col]}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <Keeper appearance={keeper.appearance} kit={keeper.kit}
                            diveCol={animating && lastKick ? lastKick.diveCol : null}/>
                    <span className={`${styles.ball} ${animating ? styles.ballFlying : ""}`}
                          style={{transform: `translate(${ball.x - 14}px, ${ball.y - 14}px)`}}/>
                    {message ? (
                        <div className={`${styles.message} ${styles[message.tone]}`}>
                            <b>{message.title}</b>
                            <span>{message.text}</span>
                        </div>
                    ) : null}
                </div>

                <p className={styles.prompt}>
                    {finished
                        ? "Серия окончена"
                        : animating
                            ? "…"
                            : turn === "shoot"
                                ? "Твой удар: выбери угол ворот"
                                : "Ты в воротах: выбери, куда прыгнуть"}
                </p>

                <div className={styles.compare}>
                    {STAT_KEYS.map((key) => (
                        <div key={key} className={styles.compareRow}>
                            <b>{match.player[key]}</b>
                            <span>{STAT_TITLES[key]}</span>
                            <b>{match.opponent[key]}</b>
                        </div>
                    ))}
                    {boosterId ? (
                        <p className={styles.muted}>Бустер: {boostersById[boosterId].title}</p>
                    ) : null}
                </div>
            </div>

            {summary && !animating ? (
                <div className={styles.resultOverlay}>
                    <div className={styles.result}>
                        <p className={`${styles.resultTitle} ${styles[summary.outcome]}`}>
                            {OUTCOME_TITLES[summary.outcome]}
                        </p>
                        <p className={styles.resultScore}>{summary.score.player} : {summary.score.opponent}</p>
                        <ul className={styles.rewards}>
                            <li>+{summary.xp} очков опыта</li>
                            <li>+{summary.coins} монет</li>
                            {summary.gifts ? <li>🎁 Подарок</li> : null}
                            {summary.boosterId ? <li>Бустер «{boostersById[summary.boosterId].title}»</li> : null}
                            {summary.rankUp !== null ? (
                                <li className={styles.rankUp}>
                                    Новый ранг «{ranks[summary.rankUp].name}»! +{summary.statPoints} очка характеристик
                                </li>
                            ) : null}
                        </ul>
                        <div className={styles.resultActions}>
                            {summary.gifts ? (
                                <Button filled onClick={() => navigate("/my-awards")}>Открыть подарок</Button>
                            ) : null}
                            <Button onClick={onRematch}>Реванш</Button>
                            <Button grayBorder onClick={() => navigate("/match")}>К соперникам</Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {finished ? null : (
                <Link to="/match" className={styles.back}>← Выйти (поединок не засчитается)</Link>
            )}
        </div>
    );
};

const Match = () => {
    const {opponentId} = useParams();
    const [params] = useSearchParams();
    const boosters = useGameStore((s) => s.boosters);
    const opponent = opponentsById[opponentId];

    if (!opponent) return <Navigate to="/match" replace/>;

    const requested = params.get("booster");
    const boosterId = boosters[requested] > 0 ? requested : null;

    return <MatchScreen key={opponentId} opponent={opponent} initialBoosterId={boosterId}/>;
};

export default Match;
