import React from "react";
import {useNavigate} from "react-router";

import Button from "../../Components/utils/Button/Button";
import {useGameStore} from "../../store/gameStore";
import {plural} from "../../utils/plural";

import styles from "./Home.module.scss";

const Home = () => {
    const navigate = useNavigate();
    const profile = useGameStore((state) => state.profile);
    const gifts = useGameStore((state) => state.gifts);
    const statPoints = useGameStore((state) => state.statPoints);

    if (!profile.created) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Начни путь в мир футбола!</h1>
                <div className={styles.story}>
                    <p>
                        Ты юниор, только что получивший контракт от крупного клуба. Ты готов стать настоящим
                        профи, но сначала придётся доказать, что ты этого достоин: выигрывай серии пенальти,
                        собирай экипировку и прокачивай характеристики.
                    </p>
                    <p>Для начала создай своего персонажа.</p>
                </div>
                <div className={styles.actions}>
                    <Button filled onClick={() => navigate("/body-maker")}>Создать персонажа</Button>
                </div>
            </div>
        );
    }

    const todo = [
        statPoints > 0 && {
            text: `Вложи ${statPoints} ${plural(statPoints, "очко", "очка", "очков")} характеристик`,
            to: "/cloakroom",
            label: "В раздевалку",
        },
        gifts > 0 && {
            text: `Открой ${plural(gifts, "подарок", "подарки", "подарки")}: ${gifts}`,
            to: "/my-awards",
            label: "К наградам",
        },
        {text: "Сыграй серию пенальти", to: "/match", label: "Играть"},
    ].filter(Boolean);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Привет, {profile.nickname}!</h1>
            <div className={styles.todo}>
                {todo.map((item) => (
                    <div className={styles.todoItem} key={item.to}>
                        <p>{item.text}</p>
                        <Button onClick={() => navigate(item.to)}>{item.label}</Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
