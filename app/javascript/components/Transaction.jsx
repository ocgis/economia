import axios from "axios";
import moment from "moment";
import React from "react";
import PropTypes from 'prop-types';
import { Link, Redirect, useHistory } from "react-router-dom";
import { AutoComplete, Button, Col, DatePicker, Input, InputNumber, Popconfirm, Row, Select } from "antd";
import * as math from 'mathjs';
import { MinusCircleOutlined, PlusCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { throttle } from "throttle-debounce";
import { BookMenu } from "./Book";

const { Option } = Select;

class NewTransaction extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      error: null
    };
  }


  componentDidMount() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books/${bookId}/etransactions/new`)
         .then(response => {
           this.setState({ transaction: response.data.transaction });
         })
         .catch(error => {
           if (error.response) {
             this.setState({ error: `${error.response.status} ${error.response.statusText}` });
           } else {
             console.log("Push /");
             this.props.history.push("/");
           }
         });
  }


  render() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const transaction = this.state.transaction;
    if (transaction == null) {
      if (this.state.error != null) {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Could not load content: {this.state.error}</h1>
          </div>
        );
      } else {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Loading</h1>
          </div>
        );
      }
    } else {
      return (<Redirect to={`/books/${bookId}/etransactions/${transaction.id}`} />);
    }
  }
}
NewTransaction.propTypes = {
  match: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
};

class ShowTransaction extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      splits: [],
      descriptionOptions: [],
      key: Date.now()
    };

    this.onTextChangeHandler = this.onTextChangeHandler.bind(this);
    this.onDateChangeHandler = this.onDateChangeHandler.bind(this);
  }


  componentDidMount() {
    const {
      match: {
        params: { id },
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books/${bookId}/etransactions/${id}`)
         .then(response => this.setStateFromResponse(response))
         .catch(error => {
           if (error.response) {
             this.setState({ error: error.response.data.error });
           } else {
             this.props.history.push("/");
           }
         });
  }


  submitTransaction(newTransaction, newSplits) {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

    let { created_at, updated_at, ...transaction } = newTransaction;
    transaction.splits_attributes = newSplits;

    if(transaction.id == null) {
      axios.post(`/api/v1/books/${bookId}/etransactions`, { transaction: transaction })
           .then(response => this.setStateFromResponse(response))
           .catch(error => console.log(error))
    } else {
      axios.patch(`/api/v1/books/${bookId}/etransactions/${transaction.id}`, { transaction: transaction })
           .then(response => this.setStateFromResponse(response))
           .catch(error => { console.log(error) })
    }
  }


  calculateStateShownAccount = (splits, accounts) => {
    splits.forEach(split => {
      split._shown_account = split.account_id ? accounts[split.account_id].full_name : undefined;
    });
  }


  calculateStateFromTo = (splits) => {
    splits.forEach(split => {
      split.value_from = split.value < 0 ? Number(-split.value).toFixed(2) : '';
      split.value_to = split.value > 0 ? Number(split.value).toFixed(2) : '';
      split.quantity_from = split.quantity < 0 ? Number(-split.quantity).toFixed(2) : '';
      split.quantity_to = split.quantity > 0 ? Number(split.quantity).toFixed(2) : '';
    });
  }


  commodityMatchesCurrency = (split) => {
    let transaction = this.state.transaction;
    let account = this.state.accounts[split.account_id];
    if (account != null) {
      return ((account.commodity_space == transaction.currency_space) &&
              (account.commodity_id == transaction.currency_id));
    } else {
      return true;
    }
  }


  calculateStateValueQuantity = () => {
    this.state.splits.forEach(split => {
      let value_to = split.value_to === "" ? 0 : split.value_to;
      let value_from = split.value_from === "" ? 0 : split.value_from;
      split.value = value_to - value_from;
      if (this.commodityMatchesCurrency(split)) {
        split.quantity = split.value;
      } else {
        let quantity_to = split.quantity_to === "" ? 0 : split.quantity_to;
        let quantity_from = split.quantity_from === "" ? 0 : split.quantity_from;
        split.quantity = quantity_to - quantity_from;
      }
    });
  }


  setStateFromResponse(response) {
    let newState = {
      'transaction': response.data.transaction,
      'splits': response.data.splits,
      'accounts': response.data.accounts,
      'account_ids': {}
    };
    Object.keys(newState.accounts).forEach((t) => {
      newState.account_ids[newState.accounts[t].full_name] = t;
    });
    this.calculateStateShownAccount(newState.splits, newState.accounts);
    this.calculateStateFromTo(newState.splits);
    this.setState(newState);
  }


  searchAccountDescriptions = throttle(500, (searchString) => {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    let encodedSearch = encodeURIComponent(searchString);
    axios.get(`/api/v1/books/${bookId}/etransactions/search?query=${encodedSearch}`)
         .then(response => {
           this.setState({
             'descriptionOptions': response.data.result
           }); })
         .catch(error => {
           console.log("ERROR", error);
         });
  });


  searchSplitMemos = throttle(500, (searchString) => {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    let encodedSearch = encodeURIComponent(searchString);
    axios.get(`/api/v1/books/${bookId}/splits/search?query=${encodedSearch}`)
         .then(response => {
           this.setState({
             'descriptionOptions': response.data.result
           });
         })
         .catch(error => {
           console.log("ERROR", error);
         });
  });


  destroyTransaction = () => {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.delete(`/api/v1/books/${bookId}/etransactions/${this.state.transaction.id}`)
         .then(response => {
           this.props.history.goBack();
         })
         .catch(error => {
           if (error.response) {
             this.setState({ error: `${error.response.status} ${error.response.statusText}` });
           } else {
             console.log(error);
             console.log("Push /");
             this.props.history.push("/");
           }
         });
  }


  copyTransaction(id) {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    let handleResponse = response => {
      let {created_at, updated_at, date_posted, id, ...newTransaction} = response.data.transaction;
      let updatedTransaction = { ...this.state.transaction, ...newTransaction };

      let newSplits = response.data.splits;
      let updatedSplits = [...this.state.splits];
      // Overwrite existing splits with new splits
      for(var i = 0; i < Math.min(updatedSplits.length, newSplits.length); i++) {
        let {created_at, updated_at, etransaction_id, id, ...newSplit} = newSplits[i]
        updatedSplits[i] = { ...updatedSplits[i], ...newSplit };
      }
      // Append new splits
      for(var i = updatedSplits.length; i < newSplits.length; i++) {
        let {created_at, updated_at, etransaction_id, id, ...newSplit} = newSplits[i]
        updatedSplits.push(newSplit);
      }
      // Delete existing splits
      for(var i = newSplits.length; i < updatedSplits.length; i++) {
        updatedSplits[i]._destroy = true;
      }
      this.calculateStateShownAccount(updatedSplits, this.state.accounts);
      this.calculateStateFromTo(updatedSplits);
      this.submitTransaction(updatedTransaction, updatedSplits);
    }

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books/${bookId}/etransactions/${id}`)
         .then(response => handleResponse(response))
         .catch(error => {
           if (error.response) {
             this.setState({ error: error.response.data.error });
           } else {
             this.props.history.push("/");
           }
         });
  }

  copySplit(split_index, id) {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    let handleResponse = response => {
      let {created_at, updated_at, etransaction_id, id, ...newSplit} = response.data.split;
      let updatedSplits = [...this.state.splits];

      updatedSplits[split_index] = { ...updatedSplits[split_index], ...newSplit };

      this.calculateStateShownAccount(updatedSplits, this.state.accounts);
      this.calculateStateFromTo(updatedSplits);
      this.submitTransaction(this.state.transaction, updatedSplits);
    }

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books/${bookId}/splits/${id}`)
         .then(response => handleResponse(response))
         .catch(error => {
           if (error.response) {
             this.setState({ error: error.response.data.error });
           } else {
             this.props.history.push("/");
           }
         });
  }


  onBlurHandler(reference, index, field) {
    return  (event) => {
      let splits = [...this.state.splits];
      if ((reference == "splits") && ['value_from', 'value_to'].includes(field)) {
        if (splits[index][field] != '') {
          let result = math.evaluate(splits[index][field]).toFixed(2);
          splits[index][field] = result == null ? '' : result;
          this.setState({ splits });
        }
      }

      if ((event.relatedTarget == null) || (event.target.parentElement.parentElement != event.relatedTarget.parentElement.parentElement)) {
        this.calculateStateValueQuantity();
        this.calculateStateShownAccount(splits, this.state.accounts);
        this.calculateStateFromTo(splits);
        this.submitTransaction(this.state.transaction, splits);
      }
    }
  }

  onKeyDownHandler(event) {
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
    }
  }


  onTextChangeHandler(reference, index, field) {
    return  (event) => {
      let newState = {};
      newState[reference] = JSON.parse(JSON.stringify(this.state[reference]));
      if (index == null) {
        newState[reference][field] = event.target.value;
      } else {
        newState[reference][index][field] = event.target.value;
      }
      this.setState(newState);
    }
  }


  onAutoCompleteChangeHandler = (reference, index, field) => {
    return  (event) => {
      let newState = {};
      newState[reference] = JSON.parse(JSON.stringify(this.state[reference]));
      if (index == null) {
        newState[reference][field] = event;
      } else {
        newState[reference][index][field] = event;
      }
      this.setState(newState);
    }
  }


  onAccountChangeHandler(index) {
    return  (value) => {
      let splits = [...this.state.splits];

      splits[index]._shown_account = value;
      let new_id = this.state.account_ids[value];
      if (new_id != null) {
        splits[index].account_id = new_id;
      }
      this.setState({ splits });
    }
  }


  onReconcileStateChangeHandler(index) {
    return  (value) => {
      let splits = [...this.state.splits];

      splits[index].reconciled_state = value;
      this.setState({ splits });
    }
  }


  onDateChangeHandler(reference, index, field) {
    return  (value) => {
      let newState = {};
      newState[reference] = JSON.parse(JSON.stringify(this.state[reference]));
      if (index == null) {
        newState[reference][field] = value.toISOString();
      } else {
        newState[reference][index][field] = value.toISOString();
      }
      this.setState(newState);
    }
  }


  matchingChildren = (parent, tag) => {
    const search = document.evaluate(".//" + tag, parent, null, XPathResult.ANY_TYPE,null);
    let elements = [];

    let element = search.iterateNext();
    while(element) {
      elements.push(element);
      element = search.iterateNext();
    }
    return elements;
  }


  removeSplitHandler = (index) => {
    return (() => {
      let newSplits = [...this.state.splits];
      newSplits[index]._destroy = true;
      this.submitTransaction(this.state.transaction, newSplits);
    });
  }


  balanceSplitHandler = (index) => {
    return (() => {
      let newSplits = [...this.state.splits];
      let newValue = newSplits[index].value;
      newSplits.forEach((split) => {
        newValue = newValue - split.value;
      });
      newSplits[index].value = newValue;
      newSplits[index].quantity = newValue;
      this.calculateStateFromTo(newSplits);
      this.submitTransaction(this.state.transaction, newSplits);
    });
  }


  renderQuantity = (index) => {
    let split = this.state.splits[index];

    if(this.commodityMatchesCurrency(split)) {
      return null;
    } else {
      return (
        <React.Fragment>
          <Col span={4} >
            <Input
              value={split.quantity_to}
              placeholder="quantity to"
              bordered={false}
              onChange={this.onTextChangeHandler('splits', index, 'quantity_to')}
              onBlur={this.onBlurHandler('splits', index, 'quantity_to')}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={4} >
            <Input
              value={split.quantity_from}
              placeholder="quantity from"
              bordered={false}
              onChange={this.onTextChangeHandler('splits', index, 'quantity_from')}
              onBlur={this.onBlurHandler('splits', index, 'quantity_from')}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
        </React.Fragment>
      );
    }
  }


  renderSplit = (index) => {
    let split = this.state.splits[index];
    let options = Object.keys(this.state.accounts).map((t) => ({ value: this.state.accounts[t].full_name }));
    let base = (
      <React.Fragment key={index} >
        <Row key={`account${index}`} >
          <Col span={13} >
            <AutoComplete
              key={this.state.key}
              value={split._shown_account}
              bordered={false}
              style={{ width: '40ch' }}
              options={options}
              placeholder="välj konto"
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
              onBlur={this.onBlurHandler('splits', index, 'account_id')}
              onChange={this.onAccountChangeHandler(index)}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={1} >
            <Select
              defaultValue={split.reconciled_state}
              bordered={false}
              onChange={this.onReconcileStateChangeHandler(index)}
            >
              <Option value="n">n</Option>
              <Option value="c">c</Option>
              <Option value="y">y</Option>
            </Select>
          </Col>
          <Col span={1} >
            <ThunderboltOutlined onClick={this.balanceSplitHandler(index)} />
          </Col>
          <Col span={4} >
            <Input
              value={split.value_to}
              placeholder="value to"
              bordered={false}
              onChange={this.onTextChangeHandler('splits', index, 'value_to')}
              onBlur={this.onBlurHandler('splits', index, 'value_to')}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={4} >
            <Input
              value={split.value_from}
              placeholder="value from"
              bordered={false}
              onChange={this.onTextChangeHandler('splits', index, 'value_from')}
              onBlur={this.onBlurHandler('splits', index, 'value_from')}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={1} >
            <MinusCircleOutlined onClick={this.removeSplitHandler(index)} />
          </Col>
        </Row>
        <Row key={`description${index}`} >
          <Col span={15} >
            <AutoComplete
              value={split.memo}
              placeholder="memo"
              bordered={false}
              style={{ width: '35ch' }}
              options={this.state.descriptionOptions}
              onChange={this.onAutoCompleteChangeHandler('splits', index, 'memo')}
              onBlur={this.onBlurHandler('splits', index, 'description')}
              onSearch={(search) => this.searchSplitMemos(search)}
              onFocus={(event) => {
                event.target.select();
                this.searchSplitMemos(event.target.value);
              } }
              onSelect={(value, object) => { this.searchSplitMemos(value);
                this.copySplit(index, object.key) }}
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
  }


  renderSplits = () => {
    let splitsElements = [];

    for (var i = 0; i < this.state.splits.length; i++) {
      splitsElements.push(this.renderSplit(i));
    }
    return (
      <div>
        { splitsElements }
      </div>
    );
  }


  render () {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    let addSplitHandler = () => {
      this.state.splits.push({account_id: null,
                              _shown_account: "",
                              action: "",
                              etransaction_id: this.state.transaction.id,
                              from: "",
                              id: null,
                              memo: "",
                              quantity: 0,
                              reconcile_date: null,
                              reconciled_state: "n",
                              to: "",
                              value: 0});
      this.submitTransaction(this.state.transaction, this.state.splits);
    }

    const transaction = this.state.transaction;
    if (transaction == null) {
      if (this.state.error != null) {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Could not load content: {this.state.error}</h1>
          </div>
        );
      } else {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Loading</h1>
          </div>
        );
      }
    } else {
      let transaction = this.state.transaction;
      return (
        <div>
          <BookMenu bookId={bookId} />
          <hr />
          <Row>
            <Col span={4} >
              <DatePicker
                value={moment(transaction.date_posted)}
                bordered={false}
                onBlur={this.onBlurHandler('transaction', null, 'date_posted')}
                onChange={this.onDateChangeHandler('transaction', null, 'date_posted')}
                onKeyDown={this.onKeyDownHandler} suffixIcon={null}
                onFocus={(event) => event.target.select()}
              />
            </Col>
            <Col span={3} >
              <Input
                value={transaction.num}
                placeholder="number"
                bordered={false}
                onBlur={this.onBlurHandler('transaction', null, 'num')}
                onChange={this.onTextChangeHandler('transaction', null, 'num')}
                onKeyDown={this.onKeyDownHandler}
                onFocus={(event) => event.target.select()}
              />
            </Col>
            <Col span={12} >
              <AutoComplete
                value={transaction.description || undefined}
                bordered={false}
                style={{ width: '35ch' }}
                options={this.state.descriptionOptions}
                placeholder="description"
                onChange={this.onAutoCompleteChangeHandler('transaction', null, 'description')}
                onBlur={this.onBlurHandler('transaction', null, 'description')}
                onSearch={(search) => this.searchAccountDescriptions(search)}
                onFocus={(event) => {
                  event.target.select();
                  this.searchAccountDescriptions(event.target.value);
                } }
                onSelect={(value, object) => { this.searchAccountDescriptions(value);
                  this.copyTransaction(object.key); }}
              />
            </Col>
            <Col span={5} >
              {`${transaction.currency_space} ${transaction.currency_id}`}
            </Col>
          </Row>
          { this.renderSplits() }
          <PlusCircleOutlined onClick={addSplitHandler} />
          <hr />
          <Button onClick={this.props.history.goBack}>Back</Button>
          <Popconfirm
            placement="bottom"
            title={`Delete transaction?`}
            onConfirm={this.destroyTransaction}
          >
            <Button>Delete</Button>
          </Popconfirm>
        </div>
      );
    }
  }
}
ShowTransaction.propTypes = {
  match: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
};


class IndexTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
      error: null
    };
  }


  componentDidMount() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books/${bookId}/etransactions`)
         .then(response => {
           this.setState({ transactions: response.data.transactions,
                           account_names: response.data.accounts });
         })
         .catch(error => {
           if (error.response) {
             this.setState({ error: `${error.response.status} ${error.response.statusText}` });
           } else {
             console.log("Push /");
             this.props.history.push("/");
           }
         });
  }


  render() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const transactions = this.state.transactions;
    if (transactions == null) {
      if (this.state.error != null) {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Could not load content: {this.state.error}</h1>
          </div>
        );
      } else {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Loading</h1>
          </div>
        );
      }
    } else {
      return (
        <div>
          <BookMenu bookId={bookId} />
          { this.renderTransactions() }
        </div>
      );
    }
  }


  renderTransactions = () => {
    return this.state.transactions.reverse().map((t) => {
      return this.renderTransaction(t);
    });
  }


  renderTransaction = (t) => {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    return (
      <React.Fragment key={`t_${t.id}`}>
        <Row>
          <Col span={5}>
            <Link to={`/books/${bookId}/etransactions/${t.id}`}>
              { moment(t.date_posted).format('YYYY-MM-DD') }
            </Link>
          </Col>
          <Col>
            <Link to={`/books/${bookId}/etransactions/${t.id}`}>
              {t.description}
            </Link>
          </Col>
        </Row>
        { this.renderSplits(t.splits) }
        <hr />
      </React.Fragment>
    );
  }


  renderSplits = (splits) => {
    return splits.map(s => this.renderSplit(s));
  }


  renderSplit = (s) => {
    const renderMemo = (s) => {
      if (s.memo == null) {
        return null;
      }
      return (
        <Row key={`${s.id}_memo`}>
          <Col span={24}>
            { s.memo }
          </Col>
        </Row>
      );
    }

    let base = (
      <React.Fragment key={s.id}>
        <Row key={s.id}>
          <Col span={20}>
            { this.state.account_names[s.account_id] }
          </Col>
          <Col span={4}>
            <div style={{ 'float': 'right' }} >
              { Number(s.value).toFixed(2) }
            </div>
          </Col>
        </Row>
        { renderMemo(s) }
      </React.Fragment>
    );

    switch(s.reconciled_state)
    {
      case 'y':
      return (
        <b key={s.id}>
          { base }
        </b>
      );

      case 'c':
      return base;

      default:
      return (
        <i key={s.id}>
          { base }
        </i>
      );
    }
  }
}
IndexTransaction.propTypes = {
  match: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
};


export { IndexTransaction, NewTransaction, ShowTransaction };
