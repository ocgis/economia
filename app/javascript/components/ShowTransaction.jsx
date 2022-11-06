import axios from 'axios';
import moment from 'moment';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  AutoComplete, Button, Col, DatePicker, Input, Popconfirm, Row, Select,
} from 'antd';
import * as math from 'mathjs';
import { MinusCircleOutlined, PlusCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { throttle } from 'throttle-debounce';
import BookMenu from './BookMenu';

const { Option } = Select;

const calculateStateFromTo = (splits) => (
  splits.map((split) => ({
    ...split,
    value_from: split.value < 0 ? Number(-split.value).toFixed(2) : '',
    value_to: split.value > 0 ? Number(split.value).toFixed(2) : '',
    quantity_from: split.quantity < 0 ? Number(-split.quantity).toFixed(2) : '',
    quantity_to: split.quantity > 0 ? Number(split.quantity).toFixed(2) : '',
  }))
);

const calculateStateShownAccount = (splits, accounts) => (
  splits.map((split) => ({
    ...split,
    _shown_account: split.account_id ? accounts[split.account_id].full_name : undefined,
  }))
);

const onKeyDownHandler = (event) => {
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

class ShowTransaction extends React.Component {
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
        console.log('ERROR', error);
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
        console.log('ERROR', error);
      });
  });

  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      splits: [],
      descriptionOptions: [],
      key: Date.now(),
    };

    this.onTextChangeHandler = this.onTextChangeHandler.bind(this);
    this.onDateChangeHandler = this.onDateChangeHandler.bind(this);
  }

  componentDidMount() {
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
          console.log(error);
        }
      });
  }

  onBlurHandler(reference, index, field) {
    return (event) => {
      const { state } = this;
      let splits = [...state.splits];
      if ((reference === 'splits') && ['value_from', 'value_to'].includes(field)) {
        if (splits[index][field] !== '') {
          const result = math.evaluate(splits[index][field]).toFixed(2);
          splits[index][field] = result == null ? '' : result;
          this.setState({ splits });
        }
      }

      if ((event.relatedTarget == null)
          || (event.target.parentElement.parentElement
            !== event.relatedTarget.parentElement.parentElement)) {
        this.calculateStateValueQuantity();
        splits = calculateStateShownAccount(splits, state.accounts);
        splits = calculateStateFromTo(splits);
        this.submitTransaction(state.transaction, splits);
      }
    };
  }

  onTextChangeHandler(reference, index, field) {
    return (event) => {
      const { state } = this;
      const newState = {};
      newState[reference] = JSON.parse(JSON.stringify(state[reference]));
      if (index == null) {
        newState[reference][field] = event.target.value;
      } else {
        newState[reference][index][field] = event.target.value;
      }
      this.setState(newState);
    };
  }

  onAccountChangeHandler(index) {
    return (value) => {
      const { account_ids, splits } = this.state;
      const newSplits = [...splits];

      newSplits[index]._shown_account = value;
      const newId = account_ids[value];
      if (newId != null) {
        newSplits[index].account_id = newId;
      }
      this.setState({ splits: newSplits });
    };
  }

  onReconcileStateChangeHandler(index) {
    return (value) => {
      const { splits } = this.state;
      const newSplits = [...splits];

      newSplits[index].reconciled_state = value;
      this.setState({ splits: newSplits });
    };
  }

  onDateChangeHandler(reference, index, field) {
    return (value) => {
      const { state } = this;
      const newState = {};
      newState[reference] = JSON.parse(JSON.stringify(state[reference]));
      if (index == null) {
        newState[reference][field] = value.toISOString();
      } else {
        newState[reference][index][field] = value.toISOString();
      }
      this.setState(newState);
    };
  }

  setStateFromResponse(response) {
    const {
      accounts, error, splits, transaction,
    } = response.data;
    if (error != null) {
      console.log(`ERROR: ${error}`);
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
    newState.splits = calculateStateShownAccount(newState.splits, newState.accounts);
    newState.splits = calculateStateFromTo(newState.splits);
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

  calculateStateValueQuantity = () => {
    const { splits } = this.state;
    return splits.map((split) => {
      const newSplit = split;
      const value_to = split.value_to === '' ? 0 : split.value_to;
      const value_from = split.value_from === '' ? 0 : split.value_from;
      newSplit.value = value_to - value_from;
      if (this.commodityMatchesCurrency(split)) {
        newSplit.quantity = split.value;
      } else {
        const quantity_to = split.quantity_to === '' ? 0 : split.quantity_to;
        const quantity_from = split.quantity_from === '' ? 0 : split.quantity_from;
        newSplit.quantity = quantity_to - quantity_from;
      }
      return newSplit;
    });
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
          console.log(error);
          this.setState({ error });
        }
      });
  };

  onAutoCompleteChangeHandler = (reference, index, field) => ((event) => {
    const { state } = this;
    const newState = {};
    newState[reference] = JSON.parse(JSON.stringify(state[reference]));
    if (index == null) {
      newState[reference][field] = event;
    } else {
      newState[reference][index][field] = event;
    }
    this.setState(newState);
  });

  removeSplitHandler = (index) => (() => {
    const { splits, transaction } = this.state;
    const newSplits = [...splits];
    newSplits[index]._destroy = true;
    this.submitTransaction(transaction, newSplits);
  });

  balanceSplitHandler = (index) => (() => {
    const { splits, transaction } = this.state;
    let newSplits = [...splits];
    let newValue = newSplits[index].value;
    newSplits.forEach((split) => {
      newValue -= split.value;
    });
    newSplits[index].value = newValue;
    newSplits[index].quantity = newValue;
    newSplits = calculateStateFromTo(newSplits);
    this.submitTransaction(transaction, newSplits);
  });

  copySplit(split_index, split_id) {
    const handleResponse = (response) => {
      const { accounts, splits, transaction } = this.state;
      const {
        created_at, updated_at, etransaction_id, id, ...newSplit
      } = response.data.split;
      let updatedSplits = [...splits];

      updatedSplits[split_index] = { ...updatedSplits[split_index], ...newSplit };

      updatedSplits = calculateStateShownAccount(updatedSplits, accounts);
      updatedSplits = calculateStateFromTo(updatedSplits);
      this.submitTransaction(transaction, updatedSplits);
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
          console.log(error);
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
      updatedSplits = calculateStateShownAccount(updatedSplits, accounts);
      updatedSplits = calculateStateFromTo(updatedSplits);
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
          console.log(error);
          this.setState({ error });
        }
      });
  }

  submitTransaction(newTransaction, newSplits) {
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
        .then((response) => this.setStateFromResponse(response))
        .catch((error) => console.log(error));
    } else {
      axios
        .patch(`/api/v1/books/${bookId}/etransactions/${transaction.id}`, { transaction })
        .then((response) => this.setStateFromResponse(response))
        .catch((error) => console.log(error));
    }
  }

  renderQuantity = (index) => {
    const { splits } = this.state;
    const split = splits[index];

    if (this.commodityMatchesCurrency(split)) {
      return null;
    }
    return (
      <>
        <Col span={4}>
          <Input
            value={split.quantity_to}
            placeholder="quantity to"
            bordered={false}
            onChange={this.onTextChangeHandler('splits', index, 'quantity_to')}
            onBlur={this.onBlurHandler('splits', index, 'quantity_to')}
            onKeyDown={onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Col>
        <Col span={4}>
          <Input
            value={split.quantity_from}
            placeholder="quantity from"
            bordered={false}
            onChange={this.onTextChangeHandler('splits', index, 'quantity_from')}
            onBlur={this.onBlurHandler('splits', index, 'quantity_from')}
            onKeyDown={onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Col>
      </>
    );
  };

  renderSplit = (index) => {
    const { accounts, descriptionOptions, splits } = this.state;
    const split = splits[index];
    const options = Object.keys(accounts).map((t) => ({ value: accounts[t].full_name }));
    const base = (
      <React.Fragment key={index}>
        <Row key={`account${index}`}>
          <Col span={13}>
            <AutoComplete
              value={split._shown_account}
              bordered={false}
              style={{ width: '40ch' }}
              options={options}
              placeholder="välj konto"
              filterOption={(inputValue, option) => (
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              )}
              onBlur={this.onBlurHandler('splits', index, 'account_id')}
              onChange={this.onAccountChangeHandler(index)}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={1}>
            <Select
              defaultValue={split.reconciled_state}
              bordered={false}
              onBlur={this.onBlurHandler('splits', index, 'reconciled_state')}
              onChange={this.onReconcileStateChangeHandler(index)}
            >
              <Option value="n">n</Option>
              <Option value="c">c</Option>
              <Option value="y">y</Option>
            </Select>
          </Col>
          <Col span={1}>
            <ThunderboltOutlined onClick={this.balanceSplitHandler(index)} />
          </Col>
          <Col span={4}>
            <Input
              value={split.value_to}
              placeholder="value to"
              bordered={false}
              onChange={this.onTextChangeHandler('splits', index, 'value_to')}
              onBlur={this.onBlurHandler('splits', index, 'value_to')}
              onKeyDown={onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={4}>
            <Input
              value={split.value_from}
              placeholder="value from"
              bordered={false}
              onChange={this.onTextChangeHandler('splits', index, 'value_from')}
              onBlur={this.onBlurHandler('splits', index, 'value_from')}
              onKeyDown={onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={1}>
            <MinusCircleOutlined onClick={this.removeSplitHandler(index)} />
          </Col>
        </Row>
        <Row key={`description${index}`}>
          <Col span={15}>
            <AutoComplete
              value={split.memo}
              placeholder="memo"
              bordered={false}
              style={{ width: '35ch' }}
              options={descriptionOptions}
              onChange={this.onAutoCompleteChangeHandler('splits', index, 'memo')}
              onBlur={this.onBlurHandler('splits', index, 'description')}
              onSearch={(search) => this.searchSplitMemos(search)}
              onFocus={(event) => {
                event.target.select();
                this.searchSplitMemos(event.target.value);
              }}
              onSelect={(value, object) => {
                this.searchSplitMemos(value);
                this.copySplit(index, object.key);
              }}
            />
          </Col>
          { this.renderQuantity(index) }
        </Row>
      </React.Fragment>
    );

    return (
      <b>
        {base}
      </b>
    );
  };

  renderSplits = () => {
    const { splits } = this.state;
    const splitsElements = [];

    for (let i = 0; i < splits.length; i += 1) {
      splitsElements.push(this.renderSplit(i));
    }
    return (
      <div>
        { splitsElements }
      </div>
    );
  };

  render() {
    const addSplitHandler = () => {
      const { state } = this;
      const splits = [...state.splits];
      splits.push({
        account_id: null,
        _shown_account: '',
        action: '',
        etransaction_id: state.transaction.id,
        id: null,
        memo: '',
        quantity: 0,
        reconcile_date: null,
        reconciled_state: 'n',
        value: 0,
      });
      this.submitTransaction(state.transaction, splits);
    };

    const {
      params: { bookId },
      navigate,
    } = this.props;
    const { descriptionOptions, error, transaction } = this.state;

    if (transaction == null) {
      if (error != null) {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>
              {`Could not load content: ${error}`}
            </h1>
          </div>
        );
      }
      return (
        <div>
          <BookMenu bookId={bookId} />
          <h1>Loading</h1>
        </div>
      );
    }
    return (
      <div>
        <BookMenu bookId={bookId} />
        <hr />
        <Row>
          <Col span={4}>
            <DatePicker
              value={moment(transaction.date_posted)}
              bordered={false}
              onBlur={this.onBlurHandler('transaction', null, 'date_posted')}
              onChange={this.onDateChangeHandler('transaction', null, 'date_posted')}
              onKeyDown={onKeyDownHandler}
              suffixIcon={null}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={3}>
            <Input
              value={transaction.num}
              placeholder="number"
              bordered={false}
              onBlur={this.onBlurHandler('transaction', null, 'num')}
              onChange={this.onTextChangeHandler('transaction', null, 'num')}
              onKeyDown={onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={12}>
            <AutoComplete
              value={transaction.description || undefined}
              bordered={false}
              style={{ width: '35ch' }}
              options={descriptionOptions}
              placeholder="description"
              onChange={this.onAutoCompleteChangeHandler('transaction', null, 'description')}
              onBlur={this.onBlurHandler('transaction', null, 'description')}
              onSearch={(search) => this.searchAccountDescriptions(search)}
              onFocus={(event) => {
                event.target.select();
                this.searchAccountDescriptions(event.target.value);
              }}
              onSelect={(value, object) => {
                this.searchAccountDescriptions(value);
                this.copyTransaction(object.key);
              }}
            />
          </Col>
          <Col span={5}>
            {`${transaction.currency_space} ${transaction.currency_id}`}
          </Col>
        </Row>
        { this.renderSplits() }
        <PlusCircleOutlined onClick={addSplitHandler} />
        <hr />
        <Button onClick={() => navigate(-1)}>Back</Button>
        <Popconfirm
          placement="bottom"
          title="Delete transaction?"
          onConfirm={this.destroyTransaction}
        >
          <Button>Delete</Button>
        </Popconfirm>
      </div>
    );
  }
}
ShowTransaction.propTypes = {
  params: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
};

export default function wrapper() {
  return (
    <ShowTransaction
      navigate={useNavigate()}
      params={useParams()}
    />
  );
}
