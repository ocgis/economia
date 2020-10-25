import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ShowTransaction } from "../components/Transaction"
import TopMenu from "../components/TopMenu"

export default (
    <Router>
      <Switch>
        <Route
          path="/"
          exact
          component={TopMenu}
          />

        <Route
          path="/etransactions/:id"
          exact
          component={ShowTransaction}
          />
      </Switch>
    </Router>
);
