import React, {useState} from "react";

import TopBanner from "../../Components/TopBanner";
import BoostersPanel from "../../Components/BoostersPanel";
import PointsPanel from "../../Components/PointsPanel";
import {Character} from "../../Components/BodyMaker";
import Card from "../../Components/Card/Card";
import ClothesModal from "../../Components/ClothesModal";
import {itemsById, SLOTS} from "../../game/catalog";
import {outfitItems} from "../../game/stats";
import {useGameStore} from "../../store/gameStore";

import plus from "../../assets/img/plus.svg";
import minus from "../../assets/img/minus.svg";
import styles from "./Cloakroom.module.scss";

const Cloakroom = () => {
    const appearance = useGameStore((state) => state.profile.appearance);
    const inventory = useGameStore((state) => state.inventory);
    const equipped = useGameStore((state) => state.equipped);
    const unequip = useGameStore((state) => state.unequip);
    const markSeen = useGameStore((state) => state.markSeen);
    const [modalSlot, setModalSlot] = useState(null);

    const itemIn = (slot) => {
        const entry = inventory.find((e) => e.uid === equipped[slot]);
        return entry ? itemsById[entry.itemId] : null;
    };

    const onCloseModal = () => {
        setModalSlot(null);
        markSeen();
    };

    return (
        <div className={styles.wrapper}>
            <TopBanner/>
            <BoostersPanel/>
            <PointsPanel/>

            <div className={styles.field}>
                <Character appearance={appearance} outfit={outfitItems({inventory, equipped})}/>

                {SLOTS.map((slot) => {
                    const item = itemIn(slot.id);
                    return (
                        <div
                            key={slot.id}
                            className={[
                                styles.bodyCell,
                                styles[`cell-${slot.id}`],
                                item ? null : styles.bodyCellEmpty,
                            ].filter(Boolean).join(" ")}
                            onClick={() => setModalSlot(slot.id)}
                            title={item ? item.title : `${slot.title}: выбрать`}
                        >
                            <div className={styles.cellIcon}>
                                <img src={item ? minus : plus} alt=""/>
                            </div>
                            {item ? null : <span className={styles.cellTitle}>{slot.title}</span>}
                            {item ? (
                                <div className={styles.cardWrapper} onClick={(event) => event.stopPropagation()}>
                                    <Card item={item} action={{label: "Снять", onClick: () => unequip(slot.id)}}/>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
            <ClothesModal slot={modalSlot} onClose={onCloseModal}/>
        </div>
    );
};

export default Cloakroom;
