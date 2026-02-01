/* eslint-disable react/no-unused-class-component-methods */
/* eslint-disable react/no-unused-state */

import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import * as math from 'mathjs';
import { debounce, throttle } from 'throttle-debounce';

class ShowTransactionBase extends React.Component {
  static calculateStateFromTo = (splits) => (
    splits.map((split) => ({
      ...split,
      value_from: split.value < 0 ? Number(-split.value).toFixed(2) : '',
      value_to: split.value > 0 ? Number(split.value).toFixed(2) : '',
      quantity_from: split.quantity < 0 ? Number(-split.quantity).toFixed(2) : '',
      quantity_to: split.quantity > 0 ? Number(split.quantity).toFixed(2) : '',
    }))
  );

  static calculateStateShownAccount = (splits, accounts) => (
    splits.map((split) => ({
      ...split,
      _shown_account: split.account_id ? accounts[split.account_id].full_name : undefined,
    }))
  );

  static evaluateField = (value) => {
    if (value === '') {
      return '';
    }
    const result = math.evaluate(value).toFixed(2);
    return result == null ? '' : result;
  };

  searchAccountDescriptions = throttle(500, (searchString) => {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    const encodedSearch = encodeURIComponent(searchString);
    axios
      .get(`/api/v1/books/${bookId}/etransactions/search?query=${encodedSearch}`)
      .then((response) => {
        this.setState({
          descriptionOptions: response.data.result,
        });
      })
      .catch((error) => {
        console.log('ERROR:', error); // eslint-disable-line no-console
      });
  });

  searchSplitMemos = throttle(500, (searchString) => {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    const encodedSearch = encodeURIComponent(searchString);
    axios
      .get(`/api/v1/books/${bookId}/splits/search?query=${encodedSearch}`)
      .then((response) => {
        this.setState({
          descriptionOptions: response.data.result,
        });
      })
      .catch((error) => {
        console.log('ERROR:', error); // eslint-disable-line no-console
      });
  });

  debounceSubmit = debounce(
    500,
    () => {
      const { splits, transaction } = this.state;
      const noSetStateOnResponse = false;
      this.submitTransaction(transaction, splits, noSetStateOnResponse);
    },
  );

  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      splits: [],
      descriptionOptions: [],
    };
  }

  componentDidMount() {
    this.loadTransaction();
  }

  componentDidUpdate(prevProps) {
    const { params: { bookId, id } } = this.props;
    if ((prevProps.params.bookId !== bookId)
        || (prevProps.params.id !== id)) {
      this.loadTransaction();
    }
  }

  static onKeyDownHandler = (event) => {
    switch (event.keyCode) {
      case 38: /* Up arrow */
        {
          const td = event.target.parentElement;
          const tr = td.parentElement;
          const columnIndex = Array.prototype.indexOf.call(td.parentElement.children, td);
          const prevTr = tr.previousSibling;
          if (prevTr != null) {
            const prevTd = prevTr.children[columnIndex];
            const prevInput = prevTd.children[0];
            prevInput.focus();
            prevInput.select();
          }
        }
        event.stopPropagation();
        break;

      case 40: /* Down arrow */
        {
          const td = event.target.parentElement;
          const tr = td.parentElement;
          const columnIndex = Array.prototype.indexOf.call(td.parentElement.children, td);
          const nextTr = tr.nextSibling;
          if (nextTr != null) {
            const nextTd = nextTr.children[columnIndex];
            const nextInput = nextTd.children[0];
            nextInput.focus();
            nextInput.select();
          }
        }
        event.stopPropagation();
        break;

      default:
        // Do nothing
    }
  };

  setStateFromResponse(response) {
    const {
      accounts, error, splits, transaction,
    } = response.data;
    if (error != null) {
      console.log('ERROR:', error); // eslint-disable-line no-console
    }
    const newState = {
      transaction,
      splits: splits.sort((a, b) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return aDate - bDate;
      }),
      accounts,
      account_ids: {},
    };
    Object.keys(newState.accounts).forEach((t) => {
      newState.account_ids[newState.accounts[t].full_name] = t;
    });
    newState.splits = this.constructor.calculateStateShownAccount(
      newState.splits,
      newState.accounts,
    );
    newState.splits = this.constructor.calculateStateFromTo(newState.splits);
    this.setState(newState);
  }

  commodityMatchesCurrency = (split) => {
    const { accounts, transaction } = this.state;
    const account = accounts[split.account_id];
    if (account != null) {
      return ((account.commodity_space === transaction.currency_space)
           && (account.commodity_id === transaction.currency_id));
    }
    return true;
  };

  calculateStateValueQuantity = (splits) => {
    const { accounts, transaction } = this.state;
    const newSplits = splits.map((split) => {
      const newSplit = { ...split };
      const value_to = split.value_to === '' ? 0 : split.value_to;
      const value_from = split.value_from === '' ? 0 : split.value_from;
      newSplit.value = value_to - value_from;
      if (this.commodityMatchesCurrency(split, transaction, accounts)) {
        newSplit.quantity = split.value;
      } else {
        const quantity_to = split.quantity_to === '' ? 0 : split.quantity_to;
        const quantity_from = split.quantity_from === '' ? 0 : split.quantity_from;
        newSplit.quantity = quantity_to - quantity_from;
      }
      return newSplit;
    });

    return this.constructor.calculateStateFromTo(newSplits);
  };

  destroyTransaction = () => {
    const {
      params: { bookId },
      navigate,
    } = this.props;
    const { transaction } = this.state;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .delete(`/api/v1/books/${bookId}/etransactions/${transaction.id}`)
      .then(() => {
        navigate(-1);
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log('ERROR:', error); // eslint-disable-line no-console
          this.setState({ error });
        }
      });
  };

  removeSplitHandler = (index) => (() => {
    const { splits, transaction } = this.state;
    const newSplits = [...splits];
    newSplits[index]._destroy = true;
    this.submitTransaction(transaction, newSplits);
  });

  balanceSplitHandler = (index) => (() => {
    const { splits } = this.state;
    let newSplits = [...splits];
    let newValue = newSplits[index].value;
    newSplits.forEach((split) => {
      newValue -= split.value;
    });
    newSplits[index].value = newValue;
    newSplits[index].quantity = newValue;
    newSplits = this.constructor.calculateStateFromTo(newSplits);
    this.setState({ splits: newSplits });
    this.debounceSubmit();
  });

  loadTransaction() {
    const {
      params: { bookId, id },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/etransactions/${id}`)
      .then((response) => this.setStateFromResponse(response))
      .catch((error) => {
        if (error.response) {
          this.setState({ error: error.response.data.error });
        } else {
          this.setState({ error });
          console.log('ERROR:', error); // eslint-disable-line no-console
        }
      });
  }

  copySplit(split_index, split_id) {
    const handleResponse = (response) => {
      const { accounts, splits } = this.state;
      const {
        created_at, updated_at, etransaction_id, id, ...newSplit
      } = response.data.split;
      let updatedSplits = [...splits];

      updatedSplits[split_index] = { ...updatedSplits[split_index], ...newSplit };

      updatedSplits = this.constructor.calculateStateShownAccount(updatedSplits, accounts);
      updatedSplits = this.constructor.calculateStateFromTo(updatedSplits);
      this.setState({ splits: updatedSplits });
      this.debounceSubmit();
    };

    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/splits/${split_id}`)
      .then((response) => handleResponse(response))
      .catch((error) => {
        if (error.response) {
          this.setState({ error: error.response.data.error });
        } else {
          console.log('ERROR:', error); // eslint-disable-line no-console
          this.setState({ error });
        }
      });
  }

  copyTransaction(id) {
    const {
      params: { bookId },
    } = this.props;

    const handleResponse = (response) => {
      const { accounts, splits, transaction } = this.state;
      const {
        created_at: trn_ca, updated_at: trn_ua, date_posted, id: trn_id, ...newTransaction
      } = response.data.transaction;
      const updatedTransaction = { ...transaction, ...newTransaction };

      const newSplits = response.data.splits;
      let updatedSplits = [...splits];
      // Overwrite existing splits with new splits
      for (let i = 0; i < Math.min(updatedSplits.length, newSplits.length); i += 1) {
        const {
          created_at, updated_at, etransaction_id, id: spl_id, ...newSplit
        } = newSplits[i];
        updatedSplits[i] = { ...updatedSplits[i], ...newSplit };
      }
      // Append new splits
      for (let i = updatedSplits.length; i < newSplits.length; i += 1) {
        const {
          created_at, updated_at, etransaction_id, id: spl_id, ...newSplit
        } = newSplits[i];
        updatedSplits.push(newSplit);
      }
      // Delete existing splits
      for (let i = newSplits.length; i < updatedSplits.length; i += 1) {
        updatedSplits[i]._destroy = true;
      }
      updatedSplits = this.constructor.calculateStateShownAccount(updatedSplits, accounts);
      updatedSplits = this.constructor.calculateStateFromTo(updatedSplits);
      this.submitTransaction(updatedTransaction, updatedSplits);
    };

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/etransactions/${id}`)
      .then((response) => handleResponse(response))
      .catch((error) => {
        if (error.response) {
          this.setState({ error: error.response.data.error });
        } else {
          console.log('ERROR:', error); // eslint-disable-line no-console
          this.setState({ error });
        }
      });
  }

  submitTransaction(newTransaction, newSplits, setStateOnResponse = true) {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    const { created_at, updated_at, ...transaction } = newTransaction;
    transaction.splits_attributes = newSplits.map((newSplit) => {
      const {
        created_at: ca,
        updated_at: ua,
        _shown_account,
        value_from,
        value_to,
        quantity_from,
        quantity_to,
        ...split
      } = newSplit;
      return split;
    });

    if (transaction.id == null) {
      axios
        .post(`/api/v1/books/${bookId}/etransactions`, { transaction })
        .then((response) => {
          if (setStateOnResponse) {
            this.setStateFromResponse(response);
          }
        })
        .catch((error) => console.log('ERROR:', error)); // eslint-disable-line no-console
    } else {
      axios
        .patch(`/api/v1/books/${bookId}/etransactions/${transaction.id}`, { transaction })
        .then((response) => {
          if (setStateOnResponse) {
            this.setStateFromResponse(response);
          }
        })
        .catch((error) => console.log('ERROR:', error)); // eslint-disable-line no-console
    }
  }
}
ShowTransactionBase.propTypes = {
  params: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
};

export default ShowTransactionBase;
