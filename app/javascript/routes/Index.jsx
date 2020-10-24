import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ShowTransaction } from "../components/Transaction"

export default (
    <Router>
      <Switch>
        <Route
          path="/etransactions/:id"
          exact
          component={ShowTransaction}
          />
      </Switch>
    </Router>
);
