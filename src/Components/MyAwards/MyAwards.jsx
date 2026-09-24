import React, {useEffect, useState} from 'react';

import Boosters from "../Boosters/Boosters";
import Card from "../Card/Card";
import Gifts from "../Gift/Gifts";
import Button from "../utils/Button/Button";
import {itemsById} from "../../game/catalog";
import {GIFT_PRICE} from "../../game/rewards";
import {useGameStore} from "../../store/gameStore";
import {plural} from "../../utils/plural";

import box from '../../assets/img/box.svg';
import styles from './MyAwards.module.scss';

const MyAwards = () => {
    const gifts = useGameStore((state) => state.gifts);
    const coins = useGameStore((state) => state.coins);
    const inventory = useGameStore((state) => state.inventory);
    const equipped = useGameStore((state) => state.equipped);
    const openGift = useGameStore((state) => state.openGift);
    const buyGift = useGameStore((state) => state.buyGift);
    const equip = useGameStore((state) => state.equip);
    const markSeen = useGameStore((state) => state.markSeen);

    // Remember what was new when the page opened, so badges survive markSeen below.
    const [newOnOpen] = useState(() => new Set(inventory.filter((e) => e.isNew).map((e) => e.itemId)));
    const [opened, setOpened] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        markSeen();
    }, [markSeen]);

    const onOpenGift = () => {
        const itemIds = openGift();
        if (!itemIds.length) return;
        setOpened(itemIds.map((id) => itemsById[id]));
        setIsOpen(true);
    };

    const onCloseGift = () => {
        setIsOpen(false);
        markSeen();
    };

    const groups = [];
    inventory.forEach((entry) => {
        const group = groups.find((g) => g.itemId === entry.itemId);
        if (group) group.entries.push(entry);
        else groups.push({itemId: entry.itemId, entries: [entry]});
    });
    const equippedUids = new Set(Object.values(equipped));
    const justOpened = new Set(opened.map((item) => item.id));

    return (
        <div style={{maxWidth: 1000}}>
            <h1 className={styles.title}>Мои награды</h1>

            <div className={styles.giftBlock}>
                <img src={box} className={styles.giftImage} alt=""/>
                <div className={styles.giftText}>
                    <p className={styles.description}>
                        {gifts > 0
                            ? `У тебя ${gifts} ${plural(gifts, "подарок", "подарка", "подарков")}!`
                            : "Подарков пока нет"}
                    </p>
                    <p className={styles.hint}>
                        Подарок дают за каждую победу. Внутри 3 случайные вещи, и чем выше ранг,
                        тем чаще попадаются редкие.
                    </p>
                </div>
                <div className={styles.giftActions}>
                    <Button filled disabled={!gifts} onClick={onOpenGift}>Открыть подарок</Button>
                    <Button grayBorder disabled={coins < GIFT_PRICE} onClick={buyGift}>
                        Купить за {GIFT_PRICE} монет
                    </Button>
                </div>
            </div>

            <h2 className={styles.subtitle}>Бустеры</h2>
            <Boosters style={{marginBottom: '40px'}}/>

            <h2 className={styles.subtitle}>Коллекция · {inventory.length}</h2>
            <div className={styles.cardList}>
                {groups.map(({itemId, entries}) => {
                    const item = itemsById[itemId];
                    const isEquipped = entries.some((entry) => equippedUids.has(entry.uid));
                    return (
                        <Card
                            key={itemId}
                            item={item}
                            isNew={newOnOpen.has(itemId) || justOpened.has(itemId)}
                            note={entries.length > 1 ? `В коллекции: ${entries.length}` : null}
                            action={{
                                label: isEquipped ? "Надето" : "Надеть",
                                disabled: isEquipped,
                                onClick: () => equip(entries[0].uid),
                            }}
                        />
                    );
                })}
            </div>

            <Gifts items={opened} isOpen={isOpen} onClose={onCloseGift}/>
        </div>
    )
}

export default MyAwards
