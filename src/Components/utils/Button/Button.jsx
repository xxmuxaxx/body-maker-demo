import React from 'react'

import styles from "./Button.module.scss";

const Button = ({onClick, children, grayBorder, filled, disabled, className}) => {
    const cls = [
        styles.button,
        grayBorder && styles.grayBorder,
        filled && styles.filled,
        className,
    ]

    return (
        <button type="button" className={cls.filter(Boolean).join(' ')} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
}

export default Button
