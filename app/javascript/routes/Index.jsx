import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { IndexTransaction, NewTransaction, ShowTransaction } from "../components/Transaction"
import { IndexSummary } from "../components/Summary"
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
          path="/etransactions/new"
          exact
          component={NewTransaction}
          />

        <Route
          path="/etransactions/:id"
          exact
          component={ShowTransaction}
          />

        <Route
          path="/etransactions"
          exact
          component={IndexTransaction}
          />

        <Route
          path="/summary"
          exact
          component={IndexSummary}
          />

      </Switch>
    </Router>
);
