import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import TopMenu from './TopMenu';

function BookMenu(props) {
  const { bookId } = props;

  const bookEntries = [
    <Link to={`/m/books/${bookId}/etransactions/new`} key="new">New transaction</Link>,
    <Link to={`/m/books/${bookId}/accounts`} key="accounts">Accounts</Link>,
    <Link to={`/m/books/${bookId}/etransactions`} key="transactions">Transactions</Link>,
    <Link to={`/m/books/${bookId}/reports`} key="reports">Reports</Link>,
    <Link to={`/m/books/${bookId}/prices`} key="prices">Prices</Link>,
    <Link to={`/m/books/${bookId}/commodities`} key="commodities">Commodities</Link>,
    <Link to={`/m/books/${bookId}/export`} key="export">Export</Link>,
  ];

  return (
    <TopMenu extraEntries={bookEntries} />
  );
}
BookMenu.propTypes = {
  bookId: PropTypes.string.isRequired,
};

export default BookMenu;
