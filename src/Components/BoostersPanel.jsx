import React from 'react';
import Button from "./utils/Button/Button";

const BoostersPanel = () => {
    return (
        <div className='boosters-panel'>
            <div className="boosters-panel__row">
                <span className="boosters-panel__title">Новые бустеры</span>
                <div className="boosters-panel__new">2</div>
            </div>

            <div className="boosters-panel__row">
                <Button>Открыть</Button>
            </div>
        </div>
    );
};

export default BoostersPanel;