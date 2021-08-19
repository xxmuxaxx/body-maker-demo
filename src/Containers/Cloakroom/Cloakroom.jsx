import React, {useState} from "react";

import TopBanner from "../../Components/TopBanner";
import BoostersPanel from "../../Components/BoostersPanel";
import PointsPanel from "../../Components/PointsPanel";
import {Body, Head} from "../../Components/BodyMaker";
import Card from "../../Components/Card/Card";

import shirt from "../../assets/img/shirt1.svg";
import shirt2 from "../../assets/img/shirt2.svg";
import plus from "../../assets/img/plus.svg";
import minus from "../../assets/img/minus.svg";
import styles from "./Cloakroom.module.scss";
import ClothesModal from "../../Components/ClothesModal";

const clothesData = {
    shirt: [
        {
            title: "Фирменная футболка Betunlim",
            img: shirt,
            defense: 10,
            agility: 5,
            attack: 2,
        },
        {
            title: "Фирменная футболка Betunlim 2",
            img: shirt2,
            defense: 10,
            agility: 5,
            attack: 2,
        },
    ],
};

const Cloakroom = () => {
    const [clothes, setClothes] = useState({
        shirt: clothesData.shirt[0],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onClickCellHandler = () => {
        if (!clothes.shirt) {
            setIsModalOpen(true)
        }
    }

    const onClickHideButtonHandler = () => {
        if (clothes.shirt) {
            setClothes((oldClothes) => ({...oldClothes, shirt: null}));
        }
    }

    const onShowClickHandler = (item) => {
        setClothes((oldClothes) => ({...oldClothes, shirt: item}))
        setIsModalOpen(false)
    }

    return (
        <div className={styles.wrapper}>
            <TopBanner/>
            <BoostersPanel/>
            <PointsPanel/>

            <div className={styles.field}>
                <Body/>
                {clothes.shirt ? (
                    <img src={clothes.shirt.img} className={styles.shirt}/>
                ) : null}
                <Head/>

                <div
                    className={[
                        styles.bodyCell,
                        clothes.shirt ? null : styles.bodyCellEmpty,
                    ].join(" ")}
                    onClick={onClickCellHandler}
                >
                    <div className={styles.cellIcon}>
                        {clothes.shirt ? <img src={minus}/> : <img src={plus}/>}
                    </div>
                    {
                        clothes.shirt
                            ? <div className={styles.cardWrapper}>
                                <Card item={clothes.shirt} hideButton onHide={onClickHideButtonHandler}/>
                            </div>
                            : null
                    }
                </div>
            </div>
            <ClothesModal isOpen={isModalOpen} clothes={clothesData.shirt}
                          onShow={(item) => onShowClickHandler(item)}/>
        </div>
    );
};

export default Cloakroom;
