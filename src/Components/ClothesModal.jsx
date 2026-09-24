import React from 'react';
import {Link} from "react-router";

import Button from "./utils/Button/Button";
import Card from "./Card/Card";
import {itemsById, SLOTS} from "../game/catalog";
import {useGameStore} from "../store/gameStore";

// Lists inventory items for one slot; identical items are grouped.
const ClothesModal = ({slot, onClose}) => {
    const inventory = useGameStore((state) => state.inventory);
    const equipped = useGameStore((state) => state.equipped);
    const equip = useGameStore((state) => state.equip);

    const groups = [];
    inventory
        .filter((entry) => slot && itemsById[entry.itemId].slot === slot)
        .forEach((entry) => {
            const group = groups.find((g) => g.itemId === entry.itemId);
            if (group) {
                group.entries.push(entry);
            } else {
                groups.push({itemId: entry.itemId, entries: [entry]});
            }
        });

    const title = SLOTS.find((s) => s.id === slot)?.title ?? "";

    return (
        <div className={`clothes-modal${slot ? ' clothes-modal--active' : ''}`} onClick={onClose}>
            <div className='clothes-modal__wrapper' onClick={(event) => event.stopPropagation()}>
                <div className="clothes-modal__top">
                    <p className="clothes-modal__title">{title}</p>
                    <div className="clothes-modal__actions">
                        <Button grayBorder onClick={onClose}>Закрыть</Button>
                    </div>
                </div>
                <div className="clothes-modal__middle">
                    {groups.length ? (
                        <div className="clothes-modal__grid">
                            {groups.map(({itemId, entries}) => {
                                const isEquipped = entries.some((entry) => entry.uid === equipped[slot]);
                                return (
                                    <Card
                                        key={itemId}
                                        item={itemsById[itemId]}
                                        isNew={entries.some((entry) => entry.isNew)}
                                        note={entries.length > 1 ? `В коллекции: ${entries.length}` : null}
                                        action={{
                                            label: isEquipped ? "Надето" : "Надеть",
                                            disabled: isEquipped,
                                            onClick: () => {
                                                equip(entries[0].uid);
                                                onClose();
                                            },
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="clothes-modal__empty">
                            Пока пусто. Выигрывай <Link to="/match">поединки</Link> и открывай подарки,
                            чтобы получить новые вещи.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClothesModal;
