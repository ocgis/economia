import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { IndexBook, ShowBook, ImportBook, ExportBook } from "../components/Book"
import { IndexAccount, ShowAccount } from "../components/Account"
import { IndexCommodity } from "../components/Commodity"
import { IndexPrice } from "../components/Price"
import { IndexTransaction, NewTransaction, ShowTransaction } from "../components/Transaction"
import { IndexReport, ShowReport } from "../components/Report"
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
          path="/books/:id/export"
          exact
          component={ExportBook}
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
          path="/books/:bookId/commodities"
          exact
          component={IndexCommodity}
          />

        <Route
          path="/books/:bookId/prices"
          exact
          component={IndexPrice}
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
          path="/books/:bookId/reports/:id"
          exact
          component={ShowReport}
          />

        <Route
          path="/books/:bookId/reports"
          exact
          component={IndexReport}
          />

      </Switch>
    </Router>
);
