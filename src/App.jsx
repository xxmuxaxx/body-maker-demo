import React from "react";
import {BrowserRouter, Link, Route, Routes} from "react-router";

import Layout from "./Containers/Layout/Layout";
import {BodyMaker} from "./Components/BodyMaker";
import MyAwards from "./Components/MyAwards/MyAwards";

import "normalize.css";
import "./app.scss";
import Cloakroom from "./Containers/Cloakroom/Cloakroom";

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/body-maker" element={<BodyMaker/>}/>
                    <Route path="/my-awards" element={<MyAwards/>}/>
                    <Route path="/cloakroom" element={<Cloakroom/>}/>

                    <Route path="*" element={
                        <>
                            <h1>Страницы</h1>
                            <nav style={{fontSize: "2rem", display: "flex", flexDirection: "column"}}>
                                <Link to="/body-maker" style={{color: "white"}}>
                                    Body Maker
                                </Link>
                                <Link to="/my-awards" style={{color: "white"}}>
                                    My Awards
                                </Link>
                                <Link to="/cloakroom" style={{color: "white"}}>
                                    Cloakroom
                                </Link>
                            </nav>
                        </>
                    }/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
