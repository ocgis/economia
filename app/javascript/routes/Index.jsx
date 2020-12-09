import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { IndexBook, ShowBook, ImportBook } from "../components/Book"
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
          path="/books/import"
          exact
          component={ImportBook}
          />

        <Route
          path="/books/:id"
          exact
          component={ShowBook}
          />

        <Route
          path="/books/:bookId/accounts/:id"
          exact
          component={ShowAccount}
          />

        <Route
          path="/books/:bookId/accounts"
          exact
          component={IndexAccount}
          />

        <Route
          path="/books/:bookId/etransactions/new"
          exact
          component={NewTransaction}
          />

        <Route
          path="/books/:bookId/etransactions/:id"
          exact
          component={ShowTransaction}
          />

        <Route
          path="/books/:bookId/etransactions"
          exact
          component={IndexTransaction}
          />

        <Route
          path="/books/:bookId/summary"
          exact
          component={IndexSummary}
          />

      </Switch>
    </Router>
);
