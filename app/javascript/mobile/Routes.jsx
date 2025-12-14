import React from 'react';
import {
  BrowserRouter as Router, Link, Route, Routes,
} from 'react-router-dom';
import IndexBook from './IndexBook';
import ShowBook from './ShowBook';
import IndexAccount from './IndexAccount';
import ShowAccount from './ShowAccount';

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
        path="/m"
        exact
        element={<IndexBook />}
      />

      <Route
        path="/m/books/:id"
        exact
        element={<ShowBook />}
      />

      <Route
        path="/m/books/:bookId/accounts/:id"
        exact
        element={<ShowAccount />}
      />

      <Route
        path="/m/books/:bookId/accounts"
        exact
        element={<IndexAccount />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  </Router>
);
