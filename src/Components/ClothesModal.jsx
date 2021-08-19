import React from 'react';
import Button from "./utils/Button/Button";
import Card from "./Card/Card";

const ClothesModal = ({isOpen, clothes, onShow}) => {
    let newClothes = []
    for (let i = 0; i < 100; i++) {
        newClothes[i] = clothes[0];
    }

    return (
        <div className={`clothes-modal${isOpen ? ' clothes-modal--active' : ''}`}>
            <div className='clothes-modal__wrapper'>
                <div className="clothes-modal__top">
                    <p className="clothes-modal__title">Футболки</p>
                    <div className="clothes-modal__actions">
                        <Button>Выбрать комплект</Button>
                        <Button>Купить карты</Button>
                    </div>
                </div>
                <div className="clothes-modal__middle">
                    <div className="clothes-modal__grid">
                        {clothes.map((item, index) => (
                            <Card key={index} item={item} showButton onShow={onShow}/>
                        ))}
                    </div>
                </div>
                <div className="clothes-modal__bottom">
                    <div className="clothes-modal__actions">
                        <Button>Сбросить</Button>
                        <Button>Надеть</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClothesModal;