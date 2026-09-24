import React from "react";
import {Link, NavLink, useNavigate} from "react-router";

import logo from "../../assets/img/logo.svg";
import star1 from "../../assets/img/rank-star-1.png"
import star2 from "../../assets/img/rank-star-2.png"
import navIcon1 from "../../assets/img/nav-icon-1.png"
import navIcon2 from "../../assets/img/nav-icon-2.png"
import navIcon3 from "../../assets/img/nav-icon-3.png"
import navIcon5 from "../../assets/img/nav-icon-5.png"
import navIcon6 from "../../assets/img/nav-icon-6.png"

import styles from "./Panel.module.scss";
import Button from "../utils/Button/Button";
import {Head} from "../BodyMaker";
import {hairStyleFor} from "../BodyMaker/characterLayers";
import {useGameStore} from "../../store/gameStore";
import {ranks} from "../../game/catalog";
import {rankProgress} from "../../game/ranks";
import {GIFT_PRICE} from "../../game/rewards";
import {plural} from "../../utils/plural";

const formatNumber = (value) => value.toLocaleString("ru-RU");

const NavItem = ({to, icon, name, label}) => (
    <NavLink to={to} className={({isActive}) => `${styles.link} ${isActive ? styles.linkActive : ""}`}>
        <img src={icon} className={styles.linkIcon} alt=""/>
        <span className={styles.linkName}>{name}</span>
        {label ? <span className={styles.linkLabel}>{label}</span> : null}
    </NavLink>
);

const Panel = () => {
    const navigate = useNavigate();
    const profile = useGameStore((state) => state.profile);
    const record = useGameStore((state) => state.record);
    const xp = useGameStore((state) => state.xp);
    const coins = useGameStore((state) => state.coins);
    const gifts = useGameStore((state) => state.gifts);
    const statPoints = useGameStore((state) => state.statPoints);
    const newItems = useGameStore((state) => state.inventory.filter((entry) => entry.isNew).length);
    const buyGift = useGameStore((state) => state.buyGift);
    const reset = useGameStore((state) => state.reset);

    const rank = rankProgress(xp);
    const games = record.wins + record.draws + record.losses;
    const share = (value) => `${games ? Math.round((value / games) * 100) : 0}%`;
    const stats = [
        {name: "Побед", value: record.wins},
        {name: "Ничьих", value: record.draws},
        {name: "Поражений", value: record.losses},
    ];

    const cloakroomLabel = statPoints > 0
        ? `+${statPoints} ${plural(statPoints, "очко", "очка", "очков")}`
        : newItems > 0 ? `+${newItems}` : null;

    const onReset = () => {
        if (window.confirm("Начать заново? Весь прогресс будет удалён.")) {
            reset();
            navigate("/");
        }
    };

    return (
        <div className={styles.wrapper}>
            <Link to="/" className={styles.logo}>
                <img src={logo} alt="logo"/>
            </Link>
            <div className={styles.infoWrapper}>
                <Link to="/body-maker" className={styles.infoLeft} title="Изменить внешность">
                    <div className={styles.infoAvatar}>
                        <Head {...profile.appearance} hairStyle={hairStyleFor(profile.sex)}/>
                    </div>
                    <p className={styles.infoName}>{profile.nickname || "Новый игрок"}</p>
                </Link>
                <div className={styles.infoRight}>
                    <ul className={styles.infoList}>
                        {stats.map((stat) => (
                            <li className={styles.infoListItem} key={stat.name}>
                                <div className={styles.infoStats}>
                                    <span className={styles.infoStatsName}>{stat.name}</span>
                                    <span className={styles.infoStatsValue}>{stat.value}</span>
                                </div>
                                <div className={styles.infoBar}>
                                    <span className={styles.infoBarLine} style={{width: share(stat.value)}}></span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.rankWrapper}>
                        <p className={styles.rankName}>{rank.current.name}</p>
                        <div className={styles.rankStars}>
                            {ranks.map((r, index) => (
                                <img key={r.name} src={index <= rank.index ? star1 : star2}
                                     className={styles.rankStar} alt="" title={r.name}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.experience}>
                <div className={styles.experienceTop}>
                    <span className={styles.experienceFrom}>{formatNumber(rank.current.minXp)}</span>
                    <span className={styles.experienceCurrent}
                          style={{left: `${Math.min(Math.max(rank.percent, 20), 80)}%`}}>
                        {formatNumber(xp)} {plural(xp, "очко", "очка", "очков")}
                    </span>
                    <span className={styles.experienceTo}>{rank.next ? formatNumber(rank.next.minXp) : "∞"}</span>
                </div>
                <div className={styles.experienceBar}>
                    <span className={styles.experienceBarLine} style={{width: `${rank.percent}%`}}></span>
                </div>
                <div className={styles.experienceBottom}>
                    <span className={styles.experienceRankFrom}>{rank.current.name}</span>
                    <span className={styles.experienceRankTo}>{rank.next ? rank.next.name : "Максимум"}</span>
                </div>
            </div>
            <div className={styles.balanceWrapper}>
                <p className={styles.balance}>монеты: <b>{formatNumber(coins)}</b></p>
                <Button grayBorder onClick={buyGift} disabled={coins < GIFT_PRICE}>
                    Купить подарок за {GIFT_PRICE}
                </Button>
            </div>
            <nav className={styles.nav}>
                <NavItem to="/match" icon={navIcon3} name="Поединки" label="Играть!"/>
                <NavItem to="/cloakroom" icon={navIcon1} name="Раздевалка" label={cloakroomLabel}/>
                <NavItem to="/my-awards" icon={navIcon6} name="Мои награды" label={gifts > 0 ? `+${gifts}` : null}/>
                <NavItem to="/body-maker" icon={navIcon2} name="Внешность"/>
                <NavItem to="/stats" icon={navIcon5} name="Статистика"/>
            </nav>

            <div className={styles.actions}>
                <button type="button" className={styles.exit} onClick={onReset}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M17.8568 0H8.57112C7.38765 0 6.42826 0.959388 6.42826 2.14286V6.42857C6.42826 6.82307 6.74806 7.14287 7.14256 7.14287C7.53707 7.14287 7.85686 6.82307 7.85686 6.42857V2.14286C7.85686 1.74835 8.17666 1.42856 8.57116 1.42856H17.8569C18.2514 1.42856 18.5712 1.74835 18.5712 2.14286V17.8571C18.5712 18.2516 18.2514 18.5714 17.8569 18.5714H8.57112C8.17662 18.5714 7.85682 18.2516 7.85682 17.8571V13.5714C7.85682 13.1769 7.53702 12.8571 7.14252 12.8571C6.74802 12.8571 6.42822 13.1769 6.42822 13.5714V17.8571C6.42822 19.0406 7.38761 20 8.57108 20H17.8568C19.0403 20 19.9997 19.0406 19.9997 17.8571V2.14286C19.9997 0.959388 19.0403 0 17.8568 0Z"
                            fill="white"
                        />
                        <path
                            d="M14.2853 9.28529H2.43822L4.79038 6.93313C5.06443 6.64937 5.05656 6.19719 4.7728 5.92314C4.49599 5.65583 4.05716 5.65583 3.78039 5.92314L0.208935 9.49455C0.142599 9.56093 0.0901576 9.63982 0.0546665 9.72671C-0.0175711 9.90144 -0.0175711 10.0977 0.0546665 10.2724C0.090325 10.3596 0.143017 10.4387 0.209647 10.5053L3.78106 14.0767C4.05511 14.3605 4.50729 14.3683 4.79105 14.0943C5.07481 13.8202 5.08268 13.3681 4.80863 13.0843C4.80289 13.0784 4.79703 13.0725 4.79105 13.0667L2.43822 10.7138H14.2854C14.6799 10.7138 14.9997 10.394 14.9997 9.99955C14.9997 9.60504 14.6798 9.28529 14.2853 9.28529Z"
                            fill="white"
                        />
                    </svg>
                    Начать заново
                </button>
            </div>
        </div>
    );
};

export default Panel;
