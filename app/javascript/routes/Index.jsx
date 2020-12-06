import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { IndexBook, ShowBook } from "../components/Book"
import { IndexAccount, ShowAccount } from "../components/Account"
import { IndexTransaction, NewTransaction, ShowTransaction } from "../components/Transaction"
import { IndexSummary } from "../components/Summary"
import TopMenu from "../components/TopMenu"

export default (
    <Router>
      <Switch>
        <Route
          path="/"
          exact
          component={IndexBook}
          />

        <Route
          path="/books/:id"
          exact
          component={ShowBook}
          />

        <Route
          path="/accounts/:id"
          exact
          component={ShowAccount}
          />

        <Route
          path="/accounts"
          exact
          component={IndexAccount}
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
