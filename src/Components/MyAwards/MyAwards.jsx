import React, {useState} from 'react';
import _ from 'lodash';

import Boosters from "../Boosters/Boosters";
import Card from "../Card/Card";

import styles from './MyAwards.module.scss';

import item1 from '../../assets/img/item-1.png';
import item2 from '../../assets/img/item-2.png';
import item3 from '../../assets/img/item-3.png';
import item4 from '../../assets/img/item-4.png';
import Gifts from "../Gift/Gifts";

const items = [
    {
        img: item1,
        title: 'Футболка сборной Англии 2016-2017',
        defense: 1,
        agility: 2,
        attack: 0,
    },
    {
        img: item2,
        title: 'Шорты сборной Португалии 2016-2017',
        defense: 1,
        agility: 1,
        attack: 0,
    },
    {
        img: item3,
        title: 'Футболка сборной Саудовской Аравии 2020-2021',
        defense: 1,
        agility: 2,
        attack: 0,
    },
    {
        img: item4,
        title: 'Шорты сборной Бразилии 2016-2017',
        defense: 1,
        agility: 1,
        attack: 0,
    },
    {
        img: item1,
        title: 'Футболка сборной Англии 2016-2017',
        defense: 3,
        agility: 1,
        attack: 2,
    },
    {
        img: item2,
        title: 'Шорты сборной Португалии 2016-2017',
        defense: 4,
        agility: 2,
        attack: 3,
    },
    {
        img: item3,
        title: 'Футболка сборной Саудовской Аравии 2020-2021',
        defense: 1,
        agility: 0,
        attack: 1,
    },
    {
        img: item4,
        title: 'Шорты сборной Бразилии 2016-2017',
        defense: 4,
        agility: 0,
        attack: 0,
    },
]

const MyAwards = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [cards, setCards] = useState([]);
    const [newCards, setNewCards] = useState([]);

    const onClickHandler = () => {
        const item1 = items[_.random(0, items.length - 1)]
        const item2 = items[_.random(0, items.length - 1)]
        const item3 = items[_.random(0, items.length - 1)]
        const item4 = items[_.random(0, items.length - 1)]
        const item5 = items[_.random(0, items.length - 1)]

        setNewCards([item1, item2, item3, item4, item5])

        setIsOpen(true)
    }

    const onCloseHandler = () => {
        setCards(items => [...items, ...newCards])
        setNewCards([])
        setIsOpen(false)
    }

    return (
        <div style={{maxWidth: 1000}}>
            <h1 className={styles.title}>Мои награды</h1>
            <p className={styles.description}>Поздравляем, у вас новый бустер!</p>

            <Boosters style={{marginBottom: '32px'}} onClick={onClickHandler}/>

            <div className={styles.cardList}>
                {
                    cards.length
                        ? cards.map((item, index) => <Card key={index} item={item} showButton/>)
                        : null
                }
            </div>

            <Gifts items={newCards} isOpen={isOpen} onClose={onCloseHandler} />
        </div>
    )
}

export default MyAwards
