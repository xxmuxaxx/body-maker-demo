import React from 'react';
import Button from "./utils/Button/Button";
import CircularProgressBar from "./CircularProgressBar";

const PointsPanel = () => {
    return (
        <div className='points-panel'>
            <p className="points-panel__title">Мои бонусы и очки</p>
            <div className="points-panel__available">
                доступно: <span>20 очков</span>
            </div>
            <div className="points-panel__distribute">
                <Button>Распределить</Button>
            </div>

            <div className="points-panel__list">
                <div className="points-panel__item">
                    <div className="points-panel__item-left">
                        <CircularProgressBar sqSize={58} percentage={60} strokeWidth={4}/>
                    </div>
                    <div className="points-panel__item-right">
                        <p className="points-panel__item-name">бонус Атаки</p>
                        <p className="points-panel__item-value">0 очков</p>
                    </div>
                </div>

                <div className="points-panel__item">
                    <div className="points-panel__item-left">
                        <CircularProgressBar sqSize={58} percentage={5} strokeWidth={4}/>
                    </div>
                    <div className="points-panel__item-right">
                        <p className="points-panel__item-name">бонус защиты</p>
                        <p className="points-panel__item-value">1 очко</p>
                    </div>
                </div>

                <div className="points-panel__item">
                    <div className="points-panel__item-left">
                        <CircularProgressBar sqSize={58} percentage={35} strokeWidth={4}/>
                    </div>
                    <div className="points-panel__item-right">
                        <p className="points-panel__item-name">бонус ловкости</p>
                        <p className="points-panel__item-value">8 очков</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default PointsPanel;