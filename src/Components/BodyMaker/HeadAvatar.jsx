import React, { useId } from "react";

import GeneratedHead from "./GeneratedHead";
import Head from "./Head";
import { hairStyleFor, hasGeneratedHead, headKeyFor } from "./characterLayers";

// Just the head, for avatars and portraits: the generated head when this character has one,
// otherwise the SVG head. Fills a 57x91 box like the SVG head does.
const HeadAvatar = ({ appearance, sex, className }) => {
    const id = useId();
    const headKey = headKeyFor(sex, appearance);
    if (!hasGeneratedHead(headKey)) {
        return <Head {...appearance} hairStyle={hairStyleFor(sex)} className={className}/>;
    }
    return (
        <svg className={className || undefined} width="57" height="91" viewBox="66 -10 65 104" xmlns="http://www.w3.org/2000/svg">
            <GeneratedHead id={id} headKey={headKey} appearance={appearance}/>
        </svg>
    );
};

export default HeadAvatar;
