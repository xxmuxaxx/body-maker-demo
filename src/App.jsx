import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router";

import Layout from "./Containers/Layout/Layout";
import Home from "./Containers/Home/Home";
import {BodyMaker} from "./Components/BodyMaker";
import MyAwards from "./Components/MyAwards/MyAwards";
import Cloakroom from "./Containers/Cloakroom/Cloakroom";
import Opponents from "./Containers/Match/Opponents";
import Match from "./Containers/Match/Match";
import Stats from "./Containers/Stats/Stats";

import "normalize.css";
import "./app.scss";

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/body-maker" element={<BodyMaker/>}/>
                    <Route path="/cloakroom" element={<Cloakroom/>}/>
                    <Route path="/my-awards" element={<MyAwards/>}/>
                    <Route path="/match" element={<Opponents/>}/>
                    <Route path="/match/:opponentId" element={<Match/>}/>
                    <Route path="/stats" element={<Stats/>}/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
