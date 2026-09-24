import React from 'react';
import {useNavigate} from "react-router";

import Button from "./utils/Button/Button";
import {useGameStore} from "../store/gameStore";

const BoostersPanel = () => {
    const navigate = useNavigate();
    const gifts = useGameStore((state) => state.gifts);
    const boosters = useGameStore((state) => Object.values(state.boosters).reduce((sum, n) => sum + n, 0));

    return (
        <div className='boosters-panel'>
            <div className="boosters-panel__row">
                <span className="boosters-panel__title">Подарки</span>
                <div className="boosters-panel__new">{gifts}</div>
            </div>
            <div className="boosters-panel__row">
                <span className="boosters-panel__title">Бустеры</span>
                <div className="boosters-panel__new">{boosters}</div>
            </div>

            <div className="boosters-panel__row">
                <Button onClick={() => navigate("/my-awards")}>{gifts > 0 ? "Открыть подарки" : "Мои награды"}</Button>
            </div>
        </div>
    );
};

export default BoostersPanel;
