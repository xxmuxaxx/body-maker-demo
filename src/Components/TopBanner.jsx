import React from 'react';
import {useNavigate} from "react-router";

const TopBanner = () => {
    const navigate = useNavigate();

    return (
        <div className='top-banner'>
            <span className='top-banner__text'>Делай ставки и побеждай вместе с Betunlim! Начни прямо сейчас.</span>
            <button type="button" className='top-banner__button' onClick={() => navigate("/match")}>Поединок!</button>
        </div>
    );
};

export default TopBanner;
