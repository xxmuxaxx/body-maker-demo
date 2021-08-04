import React from 'react'

import styles from "./Button.module.scss";

const Button = ({onClick, children, grayBorder}) => {
    const cls = [
        styles.button,
        grayBorder && styles.grayBorder,
    ]

    return (
        <button className={cls.join(' ')} onClick={onClick}>{children}</button>
    )
}

export default Button