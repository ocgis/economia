import axios from "axios";
import moment from "moment";
import React from "react";
import { Link, Redirect, useHistory } from "react-router-dom";
import { AutoComplete, Button, Col, DatePicker, Input, InputNumber, Row, Table } from "antd";
import * as math from 'mathjs';
import { MinusCircleOutlined, PlusCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { throttle } from "throttle-debounce";
import { BookMenu } from "./Book";


let mapTransactionToTable = (transaction) => {
    let data = [transaction].map((t, index) =>  ({ reference: 'transaction',
                                                   id: t.id,
                                                   date_posted: t.date_posted,
                                                   num: t.num,
                                                   description: t.description,
                                                   value: 0 }));
    return data;
}

let mapSplitsToTable = (splits) => {
    splits.sort((a, b) => { return a.id - b.id });
    splits =  splits.map((t, index) => ({ reference: 'splits',
                                          id: t.id,
                                          index: index,
                                          memo: t.memo,
                                          _shown_account: t._shown_account,
                                          reconciled_state: t.reconciled_state,
                                          value: t.value,
                                          value_from: t.value_from,
                                          value_to: t.value_to }));
    return splits;
}


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


    submitTransaction() {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        const csrfToken = document.querySelector('[name=csrf-token]').content
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

        let { created_at, updated_at, ...transaction } = this.state.transaction;
        transaction.splits_attributes = this.state.splits;

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


    calculateStateShownAccount = () => {
        this.state.splits.forEach(split => {
            split._shown_account = split.account_id ? this.state.accounts[split.account_id].full_name : undefined;
        });
    }


    calculateStateFromTo = () => {
        this.state.splits.forEach(split => {
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
        this.state.transaction = response.data.transaction;
        this.state.splits = response.data.splits;
        this.state.accounts = response.data.accounts;
        this.state.account_ids = {}
        Object.keys(this.state.accounts).forEach((t) => {
            this.state.account_ids[this.state.accounts[t].full_name] = t;
        });
        this.calculateStateShownAccount();
        this.calculateStateFromTo();
        this.setState(this.state);
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
            .then(response => { this.state.descriptionOptions = response.data.result;
                                this.setState(this.state); })
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
            .then(response => { this.state.descriptionOptions = response.data.result;
                                this.setState(this.state); })
            .catch(error => {
                console.log("ERROR", error);
            });
    });


    copyTransaction(id) {
                const {
            match: {
                params: { bookId }
            }
        } = this.props;

        let handleResponse = response => {
            let {created_at, updated_at, date_posted, id, ...newTransaction} = response.data.transaction;
            this.state.transaction = { ...this.state.transaction, ...newTransaction };

            let newSplits = response.data.splits;
            // Overwrite existing splits with new splits
            for(var i = 0; i < Math.min(this.state.splits.length, newSplits.length); i++) {
                let {created_at, updated_at, etransaction_id, id, ...newSplit} = newSplits[i]
                this.state.splits[i] = { ...this.state.splits[i], ...newSplit };
            }
            // Append new splits
            for(var i = this.state.splits.length; i < newSplits.length; i++) {
                let {created_at, updated_at, etransaction_id, id, ...newSplit} = newSplits[i]
                this.state.splits.push(newSplit);
            }
            // Delete existing splits
            for(var i = newSplits.length; i < this.state.splits.length; i++) {
                this.state.splits[i]._destroy = true;
            }
            this.state.key = Date.now();
            this.calculateStateShownAccount();
            this.calculateStateFromTo();
            this.submitTransaction();
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
            this.state.splits[split_index] = { ...this.state.splits[split_index], ...newSplit };

            this.state.key = Date.now();
            this.calculateStateShownAccount();
            this.calculateStateFromTo();
            this.submitTransaction();
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
            if ((reference == "splits") && ['value_from', 'value_to'].includes(field)) {
                if (this.state.splits[index][field] != '') {
                    let result = math.evaluate(this.state.splits[index][field]).toFixed(2);
                    this.state.splits[index][field] = result == null ? '' : result;
                    this.setState(this.state);
                }
            }
            
            if ((event.relatedTarget == null) || (event.target.parentElement.parentElement != event.relatedTarget.parentElement.parentElement)) {
                this.calculateStateValueQuantity();
                this.calculateStateShownAccount();
                this.calculateStateFromTo();
                this.submitTransaction();
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
            if (index == null) {
                this.state[reference][field] = event.target.value;
            } else {
                this.state[reference][index][field] = event.target.value;
            }
            this.setState(this.state);
        }
    }


    onAutoCompleteChangeHandler = (reference, index, field) => {
        return  (event) => {
            if (index == null) {
                this.state[reference][field] = event;
            } else {
                this.state[reference][index][field] = event;
            }
            this.setState(this.state);
        }
    }


    onAccountChangeHandler(index) {
        return  (value) => {
            this.state.splits[index]._shown_account = value;
            let new_id = this.state.account_ids[value];
            if (new_id != null) {
                this.state.splits[index].account_id = new_id;
            }
            this.setState(this.state);
        }
    }


    onDateChangeHandler(reference, index, field) {
        return  (value) => {
            if (index == null) {
                this.state[reference][field] = value.toISOString();
            } else {
                this.state[reference][index][field] = value.toISOString();
            }
            this.setState(this.state);
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
            this.state.splits[index]._destroy = true;
            this.submitTransaction();
        });
    }


    balanceSplitHandler = (index) => {
        return (() => {
            let newValue = this.state.splits[index].value;
            this.state.splits.forEach((split) => {
                newValue = newValue - split.value;
                });
            this.state.splits[index].value = newValue;
            this.state.splits[index].quantity = newValue;
            this.calculateStateFromTo();
            this.submitTransaction();
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
                      />
                  </Col>
                  <Col span={4} >
                    <Input
                      value={split.quantity_from}
                      placeholder="quantity from"
                      bordered={false}
                      onChange={this.onTextChangeHandler('splits', index, 'quantity_from')}
                      onBlur={this.onBlurHandler('splits', index, 'quantity_from')}
                      onKeyDown={this.onKeyDownHandler} />
                  </Col>
                </React.Fragment>
            );
        }
    }


    renderSplit = (index) => {
        let split = this.state.splits[index];
        let options = Object.keys(this.state.accounts).map((t) => ({ value: this.state.accounts[t].full_name }));
        return (
            <React.Fragment key={index} >
              <Row key={`account${index}`} >
                <Col span={14} >
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
                                  />
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
                    />
                </Col>
                <Col span={4} >
                  <Input
                    value={split.value_from}
                    placeholder="value from"
                    bordered={false}
                    onChange={this.onTextChangeHandler('splits', index, 'value_from')}
                    onBlur={this.onBlurHandler('splits', index, 'value_from')}
                    onKeyDown={this.onKeyDownHandler} />
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
                    onFocus={(event) => this.searchSplitMemos(event.target.value)}
                    onSelect={(value, object) => { this.searchSplitMemos(value);
                    this.copySplit(index, object.key) }}
                    />
                </Col>
                { this.renderQuantity(index) }
              </Row>
            </React.Fragment>
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
            this.submitTransaction();
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
                        onFocus={(event) => this.searchAccountDescriptions(event.target.value)}
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
                  <BackButton />
                </div>
            );
        }
    }
}

function BackButton() {
    const history = useHistory();
    return (<Button onClick={() => { history.goBack(); }} >Back</Button>);
}

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
                this.state = { transactions: response.data.transactions,
                               account_names: response.data.accounts };
                this.calculateStateFromTo();
                this.setState(this.state);
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


    calculateStateFromTo = () => {
        this.state.transactions.forEach(transaction => {
            transaction.splits.forEach(split => {
                split.value_from = split.value < 0 ? Number(-split.value).toFixed(2) : '';
                split.value_to = split.value > 0 ? Number(split.value).toFixed(2) : '';
                split.quantity_from = split.quantity < 0 ? Number(-split.quantity).toFixed(2) : '';
                split.quantity_to = split.quantity > 0 ? Number(split.quantity).toFixed(2) : '';
            });
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
            let data = [];
            this.state.transactions.reverse().forEach((t) => {
                data = data.concat(mapTransactionToTable(t));
                data = data.concat(mapSplitsToTable(t.splits));
            });

            for (var i = 0; i < data.length; i++) {
                data[i].key = i;
            }

            const columns = [
                {
                    title: 'Datum',
                    key: 'date_posted',
                    render: t => {
                        if (t.date_posted == null) {
                            return null;
                        } else {
                            return (
                                <Link to={`/books/${bookId}/etransactions/${t.id}`}>
                                  { moment(t.date_posted).format('YYYY-MM-DD') }
                                </Link>
                            );
                        }
                    }
                },
                {
                    title: 'Num',
                    dataIndex: 'num'
                },
                {
                    title: 'Beskrivning',
                    key: 'description',
                    render: t => {
                        if (t.reference == 'transaction') {
                            return (
                                <Link to={`/books/${bookId}/etransactions/${t.id}`}>
                                  {t.description}
                                </Link>
                            );
                        } else {
                            return t.memo;
                        }
                    }
                },
                {
                    title: 'Konto',
                    key: 'account_id',
                    render: t => {
                        if (t.reference == 'splits') {
                            return this.state.account_names[t.account_id];
                        } else {
                            return null;
                        }
                    }
                },
                {
                    title: 'Avstämt',
                    dataIndex: 'reconciled_state',
                },
                {
                    title: 'Till',
                    dataIndex: 'value_to'
                },
                {
                    title: 'Från',
                    dataIndex: 'value_from'
                }
            ];

            return (
                <div>
                  <BookMenu bookId={bookId} />
                  <Table id="transactionsTable" columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}


export { IndexTransaction, NewTransaction, ShowTransaction };
