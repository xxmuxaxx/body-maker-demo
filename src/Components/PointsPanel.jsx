import React from 'react';

import CircularProgressBar from "./CircularProgressBar";
import {STAT_HINTS, STAT_KEYS, STAT_TITLES, computeStats} from "../game/stats";
import {useGameStore} from "../store/gameStore";
import {plural} from "../utils/plural";

// Scale for the circle: a stat of 30 fills it completely.
const STAT_CAP = 30;

const PointsPanel = () => {
    const state = useGameStore();
    const {statPoints, allocatePoint} = state;
    const stats = computeStats(state);

    return (
        <div className='points-panel'>
            <p className="points-panel__title">Мои характеристики</p>
            <div className="points-panel__available">
                доступно: <span>{statPoints} {plural(statPoints, "очко", "очка", "очков")}</span>
            </div>
            <p className="points-panel__hint">
                {statPoints > 0
                    ? "Нажми «+», чтобы вложить очко. Новые очки дают за повышение ранга."
                    : "Новые очки дают за повышение ранга."}
            </p>

            <div className="points-panel__list">
                {STAT_KEYS.map((key) => (
                    <div className="points-panel__item" key={key} title={STAT_HINTS[key]}>
                        <div className="points-panel__item-left">
                            <CircularProgressBar
                                sqSize={58}
                                strokeWidth={4}
                                percentage={Math.min(100, Math.round((stats.total[key] / STAT_CAP) * 100))}
                                label={stats.total[key]}
                            />
                        </div>
                        <div className="points-panel__item-right">
                            <p className="points-panel__item-name">{STAT_TITLES[key]}</p>
                            <p className="points-panel__item-value">
                                база {stats.base[key]} · очки +{stats.allocated[key]} · вещи +{stats.items[key]}
                            </p>
                        </div>
                        {statPoints > 0 ? (
                            <button
                                type="button"
                                className="points-panel__plus"
                                onClick={() => allocatePoint(key)}
                                aria-label={`Добавить очко: ${STAT_TITLES[key]}`}
                            >
                                +
                            </button>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PointsPanel;
