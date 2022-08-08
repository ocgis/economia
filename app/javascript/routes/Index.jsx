import React from 'react';
import {
  BrowserRouter as Router, Link, Route, Routes,
} from 'react-router-dom';
import IndexBook from '../components/IndexBook';
import ExportBook from '../components/ExportBook';
import ImportBook from '../components/ImportBook';
import ShowBook from '../components/ShowBook';
import IndexAccount from '../components/IndexAccount';
import ShowAccount from '../components/ShowAccount';
import IndexCommodity from '../components/IndexCommodity';
import IndexPrice from '../components/IndexPrice';
import IndexTransaction from '../components/IndexTransaction';
import NewTransaction from '../components/NewTransaction';
import ShowTransaction from '../components/ShowTransaction';
import IndexReport from '../components/IndexReport';
import ShowReport from '../components/ShowReport';

function NotFound() {
  return (
    <div>
      <h1 style={{ color: 'red', fontSize: 100 }}>404</h1>
      <h3>Page Not Found</h3>
      <p>
        <Link to="/">Go Home</Link>
      </p>
    </div>
  );
}

export default (
  <Router>
    <Routes>
      <Route
        path="/"
        exact
        element={<IndexBook />}
      />

      <Route
        path="/books/import"
        exact
        element={<ImportBook />}
      />

      <Route
        path="/books/:id/export"
        exact
        element={<ExportBook />}
      />

      <Route
        path="/books/:id"
        exact
        element={<ShowBook />}
      />

      <Route
        path="/books/:bookId/accounts/:id"
        exact
        element={<ShowAccount />}
      />

      <Route
        path="/books/:bookId/accounts"
        exact
        element={<IndexAccount />}
      />

      <Route
        path="/books/:bookId/commodities"
        exact
        element={<IndexCommodity />}
      />

      <Route
        path="/books/:bookId/prices"
        exact
        element={<IndexPrice />}
      />

      <Route
        path="/books/:bookId/etransactions/new"
        exact
        element={<NewTransaction />}
      />

      <Route
        path="/books/:bookId/etransactions/:id"
        exact
        element={<ShowTransaction />}
      />

      <Route
        path="/books/:bookId/etransactions"
        exact
        element={<IndexTransaction />}
      />

      <Route
        path="/books/:bookId/reports/:id"
        exact
        element={<ShowReport />}
      />

      <Route
        path="/books/:bookId/reports"
        exact
        element={<IndexReport />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  </Router>
);
