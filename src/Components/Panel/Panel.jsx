import React from "react";

import logo from "../../assets/img/logo.svg";
import head from "../../assets/img/head.png"
import star1 from "../../assets/img/rank-star-1.png"
import star2 from "../../assets/img/rank-star-2.png"
import navIcon1 from "../../assets/img/nav-icon-1.png"
import navIcon2 from "../../assets/img/nav-icon-2.png"
import navIcon3 from "../../assets/img/nav-icon-3.png"
import navIcon4 from "../../assets/img/nav-icon-4.png"
import navIcon5 from "../../assets/img/nav-icon-5.png"
import navIcon6 from "../../assets/img/nav-icon-6.png"

import styles from "./Panel.module.scss";
import Button from "../utils/Button/Button";

const Panel = () => {
    return (
        <div className={styles.wrapper}>
            <a href="/" className={styles.logo}>
                <img src={logo} alt="logo"/>
            </a>
            <div className={styles.infoWrapper}>
                <div className={styles.infoLeft}>
                    <img src={head} className={styles.infoAvatar} alt="head"/>
                    <p className={styles.infoName}>Richard Braveheart</p>
                </div>
                <div className={styles.infoRight}>
                    <ul className={styles.infoList}>
                        <li className={styles.infoListItem}>
                            <div className={styles.infoStats}>
                                <span className={styles.infoStatsName}>Побед</span>
                                <span className={styles.infoStatsValue}>24</span>
                            </div>
                            <div className={styles.infoBar}>
                                <span className={styles.infoBarLine} style={{width: '80%'}}></span>
                            </div>
                        </li>
                        <li className={styles.infoListItem}>
                            <div className={styles.infoStats}>
                                <span className={styles.infoStatsName}>Ничьих</span>
                                <span className={styles.infoStatsValue}>8</span>
                            </div>
                            <div className={styles.infoBar}>
                                <span className={styles.infoBarLine} style={{width: '20%'}}></span>
                            </div>
                        </li>
                        <li className={styles.infoListItem}>
                            <div className={styles.infoStats}>
                                <span className={styles.infoStatsName}>Проигрышей</span>
                                <span className={styles.infoStatsValue}>8</span>
                            </div>
                            <div className={styles.infoBar}>
                                <span className={styles.infoBarLine} style={{width: '20%'}}></span>
                            </div>
                        </li>
                    </ul>
                    <div className={styles.rankWrapper}>
                        <p className={styles.rankName}>Новичек</p>
                        <div className={styles.rankStars}>
                            <img src={star1} className={styles.rankStar} alt="star"/>
                            <img src={star2} className={styles.rankStar} alt="star"/>
                            <img src={star2} className={styles.rankStar} alt="star"/>
                            <img src={star2} className={styles.rankStar} alt="star"/>
                            <img src={star2} className={styles.rankStar} alt="star"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.experience}>
                <div className={styles.experienceTop}>
                    <span className={styles.experienceFrom}>0</span>
                    <span className={styles.experienceCurrent} style={{left: '40%'}}>324 очка</span>
                    <span className={styles.experienceTo}>1 000</span>
                </div>
                <div className={styles.experienceBar}>
                    <span className={styles.experienceBarLine} style={{width: '40%'}}></span>
                </div>
                <div className={styles.experienceBottom}>
                    <span className={styles.experienceRankFrom}>Новичек</span>
                    <span className={styles.experienceRankTo}>Эксперт</span>
                </div>
            </div>
            <div className={styles.balanceWrapper}>
                <p className={styles.balance}>балланс: <b>5 047 ₽</b></p>
                <Button grayBorder>Пополнить</Button>
            </div>
            <nav className={styles.nav}>
                <a href="/" className={styles.link}>
                    <img src={navIcon1} className={styles.linkIcon} alt="nav"/>
                    <span className={styles.linkName}>Моя коллекция</span>
                    <span className={styles.linkLabel}>+2</span>
                </a>
                <a href="/" className={styles.link}>
                    <img src={navIcon2} className={styles.linkIcon} alt="nav"/>
                    <span className={styles.linkName}>Харатеристики</span>
                    <span className={styles.linkLabel}>+20</span>
                </a>
                <a href="/" className={`${styles.link} ${styles.linkActive}`}>
                    <img src={navIcon3} className={styles.linkIcon} alt="nav"/>
                    <span className={styles.linkName}>Мои поединки</span>
                    <span className={styles.linkLabel}>3 активных</span>
                </a>
                <a href="/" className={styles.link}>
                    <img src={navIcon4} className={styles.linkIcon} alt="nav"/>
                    <span className={styles.linkName}>Советы тренера</span>
                    <span className={styles.linkLabel}>Есть новый!</span>
                </a>
                <a href="/" className={styles.link}>
                    <img src={navIcon5} className={styles.linkIcon} alt="nav"/>
                    <span className={styles.linkName}>Статистика</span>
                </a>
                <a href="/" className={styles.link}>
                    <img src={navIcon6} className={styles.linkIcon} alt="nav"/>
                    <span className={styles.linkName}>Мои награды</span>
                    <span className={styles.linkLabel}>+20</span>
                </a>
            </nav>

            {/*<div className={styles.text}>*/}
            {/*  <p>*/}
            {/*    <b>Здравствуй, Константин!</b>*/}
            {/*    <span>Начни удивительное путешествие в мир футбола!</span>*/}
            {/*  </p>*/}

            {/*  <p>*/}
            {/*    <b>История</b>*/}
            {/*    <span>*/}
            {/*      Ты юниор, только что получивший контракт от крупного клуба. Ты готов*/}
            {/*      стать настоящим профи и разбогатеть, но сначала тебе придётся*/}
            {/*      доказать что ты этого достоин — оттачивай свои характеристики и*/}
            {/*      обзаведись новым гардеробом, не помешает и немного интуиции.{" "}*/}
            {/*    </span>*/}
            {/*  </p>*/}

            {/*  <p>*/}
            {/*    <b>С чего начать</b>*/}
            {/*    <span>Задайте параметры своего персонажа справа.</span>*/}
            {/*  </p>*/}
            {/*</div>*/}

            <div className={styles.actions}>
                <button className={styles.exit}>
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
                    Выход
                </button>
            </div>
        </div>
    );
};

export default Panel;
