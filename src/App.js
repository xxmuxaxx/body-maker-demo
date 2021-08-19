import React from "react";
import {BrowserRouter, Link, Route, Switch} from "react-router-dom";

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
                <Switch>
                    <Route exact path="/body-maker">
                        <BodyMaker/>
                    </Route>
                    <Route exact path="/my-awards">
                        <MyAwards/>
                    </Route>
                    <Route exact path="/cloakroom">
                        <Cloakroom/>
                    </Route>

                    <Route path="/">
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
                    </Route>
                </Switch>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
