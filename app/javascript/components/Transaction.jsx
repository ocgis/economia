import axios from "axios";
import moment from "moment";
import React from "react";
import { Link, Redirect } from "react-router-dom";
import { AutoComplete, DatePicker, Input, InputNumber, Table } from "antd";
import "antd/dist/antd.css";
import * as math from 'mathjs';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { throttle } from "throttle-debounce";
import TopMenu from "./TopMenu";


let mapTransactionToTable = (transaction, splits) => {
    let data = [transaction].map((t, index) =>  ({ reference: 'transaction',
                                                   id: t.id,
                                                   date_posted_date: t.date_posted_date,
                                                   num: t.num,
                                                   description: t.description,
                                                   value: 0 }));
    splits.sort((a, b) => { return a.id - b.id });
    splits =  splits.map((t, index) => ({ reference: 'splits',
                                          id: t.id,
                                          index: index,
                                          memo: t.memo,
                                          account_id: t.account_id,
                                          reconciled_state: t.reconciled_state,
                                          value: t.value,
                                          from: t.from,
                                          to: t.to }));
    data = data.concat(splits);

    return data;
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
        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/etransactions/new`)
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
        const transaction = this.state.transaction;
        if (transaction == null) {
            if (this.state.error != null) {
                return (
                    <div>
                      <TopMenu />
                      <h1>Could not load content: {this.state.error}</h1>
                    </div>
                );
            } else {
                return (
                    <div>
                      <TopMenu />
                      <h1>Loading</h1>
                    </div>
                );
            }
        } else {
            return (<Redirect to={`/etransactions/${transaction.id}`} />);
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
                params: { id }
            }
        } = this.props;

        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/etransactions/${id}`)
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
        const csrfToken = document.querySelector('[name=csrf-token]').content
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

        let { created_at, updated_at, ...transaction } = this.state.transaction;
        transaction.splits_attributes = this.state.splits;

        if(transaction.id == null) {
            axios.post('/api/v1/etransactions', { transaction: transaction })
                .then(response => this.setStateFromResponse(response))
                .catch(error => console.log(error))
        } else {
            axios.patch(`/api/v1/etransactions/${transaction.id}`, { transaction: transaction })
                .then(response => this.setStateFromResponse(response))
                .catch(error => { console.log(error) })                      
        }
    }


    calculateStateFromTo() {
        var i;
        for (i = 0; i < this.state.splits.length; i++) {
            this.state.splits[i].from = this.state.splits[i].value < 0 ? Number(-this.state.splits[i].value).toFixed(2) : '';
            this.state.splits[i].to = this.state.splits[i].value > 0 ? Number(this.state.splits[i].value).toFixed(2) : '';
        }
    }


    calculateStateValueQuantity() {
        var i;
        for (i = 0; i < this.state.splits.length; i++) {
            let to = this.state.splits[i].to === "" ? 0 : this.state.splits[i].to;
            let from = this.state.splits[i].from === "" ? 0 : this.state.splits[i].from;
            this.state.splits[i].value = to - from;
            this.state.splits[i].quantity = this.state.splits[i].value;
        }
    }


    setStateFromResponse(response) {
        this.state.transaction = response.data.transaction;
        this.state.splits = response.data.splits;
        this.state.account_names = response.data.accounts;
        this.state.account_ids = {}
        Object.keys(this.state.account_names).forEach((t) => {
            this.state.account_ids[this.state.account_names[t]] = t;
        });
        this.calculateStateFromTo();
        this.setState(this.state);
    }


    searchAccountDescriptions = throttle(500, (searchString) => {
        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        let encodedSearch = encodeURIComponent(searchString);
        axios.get(`/api/v1/etransactions/search?query=${encodedSearch}`)
            .then(response => { this.state.descriptionOptions = response.data.result;
                                this.setState(this.state); })
            .catch(error => {
                console.log("ERROR", error);
            });
    });


    copyTransaction(id) {
        let handleResponse = response => {
            let {created_at, updated_at, date_entered_date, date_entered_ns, date_posted_date, date_posted_ns, id, id_, ...newTransaction} = response.data.transaction;
            this.state.transaction = { ...this.state.transaction, ...newTransaction };

            let newSplits = response.data.splits;
            // Overwrite existing splits with new splits
            for(var i = 0; i < Math.min(this.state.splits.length, newSplits.length); i++) {
                let {created_at, updated_at, etransaction_id, id, id_, ...newSplit} = newSplits[i]
                this.state.splits[i] = { ...this.state.splits[i], ...newSplit };
            }
            // Append new splits
            for(var i = this.state.splits.length; i < newSplits.length; i++) {
                let {created_at, updated_at, etransaction_id, id, id_, ...newSplit} = newSplits[i]
                this.state.splits.push(newSplit);
            }
            // Delete existing splits
            for(var i = newSplits.length; i < this.state.splits.length; i++) {
                this.state.splits[i]._destroy = true;
            }
            this.state.key = Date.now();
            this.calculateStateFromTo();
            this.submitTransaction();
        }

        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/etransactions/${id}`)
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
            if ((reference == "splits") && ['from', 'to'].includes(field)) {
                if (this.state.splits[index][field] != '') {
                    let result = math.evaluate(this.state.splits[index][field]).toFixed(2);
                    this.state.splits[index][field] = result == null ? '' : result;
                    this.setState(this.state);
                }
            }
            
            if ((event.relatedTarget == null) || (event.target.parentElement.parentElement != event.relatedTarget.parentElement.parentElement)) {
                this.calculateStateValueQuantity();
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


    onAccountChangeHandler(index) {
        return  (value) => {
            let new_id = this.state.account_ids[value];
            if (new_id != null) {
                this.state.splits[index].account_id = new_id;
                this.setState(this.state);
            }
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
        
    render () {
        let addSplitHandler = () => {
            this.state.splits.push({account_id: null,
                                    action: "",
                                    etransaction_id: this.state.transaction.id,
                                    from: "",
                                    id: null,
                                    id_: "economia fixme",
                                    memo: "",
                                    quantity: 0,
                                    reconcile_date_date: null,
                                    reconcile_date_ns: null,
                                    reconciled_state: "n",
                                    to: "",
                                    value: 0});
            this.submitTransaction();
        }

        let removeSplitHandler = (t) => {
            return (() => {
                this.state.splits[t.index]._destroy = true;
                this.submitTransaction();
            });
        }
 
        const transaction = this.state.transaction;
        if (transaction == null) {
            if (this.state.error != null) {
                return (
                    <div>
                      <TopMenu />
                      <h1>Could not load content: {this.state.error}</h1>
                    </div>
                );
            } else {
                return (
                    <div>
                      <TopMenu />
                      <h1>Loading</h1>
                    </div>
                );
            }
        } else {
            let splits = this.state.splits;
            const columns = [
                {
                    title: 'Datum',
                    key: 'date_posted_date',
                    render: t => {
                        if (t.date_posted_date == null) {
                            return null;
                        } else {
                            return (<DatePicker value={moment(t.date_posted_date)} bordered={false} onBlur={this.onBlurHandler(t.reference, t.index, 'date_posted_date')} onChange={this.onDateChangeHandler(t.reference, t.index, 'date_posted_date')} onKeyDown={this.onKeyDownHandler} />);
                        }
                    }
                },
                {
                    title: 'Num',
                    key: 'num',
                    render: t => {
                        if (t.num == null) {
                            return null;
                        } else {
                            return (<Input value={t.num} bordered={false} onBlur={this.onBlurHandler(t.reference, t.index, 'num')} onChange={this.onTextChangeHandler(t.reference, t.index, 'num')} onKeyDown={this.onKeyDownHandler} />);
                        }
                    }
                },
                {
                    title: 'Beskrivning',
                    key: 'description',
                    render: t => {
                        if (t.reference == 'transaction') {
                            let options = Object.keys(this.state.account_names).map((t) => ({ value: this.state.account_names[t] }));
                            return (<AutoComplete
                                    defaultValue={t.description}
                                    bordered={false}
                                    style={{ width: 200 }}
                                    options={this.state.descriptionOptions}
                                    placeholder="skriv beskrivning"
                                    onBlur={this.onBlurHandler(t.reference, t.index, 'description')}
                                    onSearch={(search) => this.searchAccountDescriptions(search)}
                                    onFocus={(event) => this.searchAccountDescriptions(event.target.value)}
                                    onSelect={(value, object) => this.copyTransaction(object.key)}
                                    />);
                        } else {
                            return (<Input value={t.memo} bordered={false} onBlur={this.onBlurHandler(t.reference, t.index, 'description')} onChange={this.onTextChangeHandler(t.reference, t.index, 'memo')} onKeyDown={this.onKeyDownHandler} />);
                        }
                    }
                },
                {
                    title: 'Konto',
                    key: 'account_id',
                    render: t => {
                        if (t.reference == 'splits') {
                            let options = Object.keys(this.state.account_names).map((t) => ({ value: this.state.account_names[t] }));
                            return (<AutoComplete
                                    key={this.state.key}
                                    defaultValue={this.state.account_names[t.account_id]}
                                    bordered={false}
                                    style={{ width: 200 }}
                                    options={options}
                                    placeholder="välj konto"
                                    filterOption={(inputValue, option) =>
                                                  option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                                 }
                                    onBlur={this.onBlurHandler(t.reference, t.index, 'account_id')}
                                    onChange={this.onAccountChangeHandler(t.index)}
                                    />);
                        } else {
                            return null;
                        }
                    }
                },
                {
                    title: 'Avstämt',
                    key: 'reconciled_state',
                    render: t => {
                        if (t.reconciled_state == null) {
                            return null;
                        } else {
                            return (<Input value={t.reconciled_state} bordered={false} onBlur={this.onBlurHandler(t.reference, t.index, 'reconciled_state')} onChange={this.onTextChangeHandler(t.reference, t.index, 'reconciled_state')} onKeyDown={this.onKeyDownHandler} />);
                        }
                    }
                },
                {
                    title: 'Till',
                    key: 'to',
                    render: t => {
                        return (<Input value={t.to} bordered={false} onChange={this.onTextChangeHandler(t.reference, t.index, 'to')} onBlur={this.onBlurHandler(t.reference, t.index, 'to')} onKeyDown={this.onKeyDownHandler} />);
                    }
                },
                {
                    title: 'Från',
                    key: 'from',
                    render: t => {
                        return (<Input value={t.from} bordered={false} onChange={this.onTextChangeHandler(t.reference, t.index, 'from')} onBlur={this.onBlurHandler(t.reference, t.index, 'from')} onKeyDown={this.onKeyDownHandler} />);
                    }
                },
                {
                    title: 'Ta bort',
                    key: 'remove',
                    render: t => {
                        if (t.reference == "splits") {
                            return (<MinusCircleOutlined onClick={removeSplitHandler(t)}/>);
                        } else {
                            return null;
                        }
                    }
                }
            ];

            let data = mapTransactionToTable(transaction, splits);
            for (var i = 0; i < data.length; i++) {
                data[i].key = i;
            }

            return (
                <div>
                  <TopMenu />
                  <Table id="transactionTable" columns={columns} dataSource={data} pagination={false} />
                  <PlusCircleOutlined onClick={addSplitHandler} />
                </div>
            );
        }
    }
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
        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/etransactions`)
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


    calculateStateFromTo() {
        var i;
        var j;
        for (j = 0; j < this.state.transactions.length; j++) {
            for (i = 0; i < this.state.transactions[j].splits.length; i++) {
                this.state.transactions[j].splits[i].from = this.state.transactions[j].splits[i].value < 0 ? Number(-this.state.transactions[j].splits[i].value).toFixed(2) : '';
                this.state.transactions[j].splits[i].to = this.state.transactions[j].splits[i].value > 0 ? Number(this.state.transactions[j].splits[i].value).toFixed(2) : '';
            }
        }
    }

    render() {
        const transactions = this.state.transactions;
        if (transactions == null) {
            if (this.state.error != null) {
                return (
                    <div>
                      <TopMenu />
                      <h1>Could not load content: {this.state.error}</h1>
                    </div>
                );
            } else {
                return (
                    <div>
                      <TopMenu />
                      <h1>Loading</h1>
                    </div>
                );
            }
        } else {
            let data = [];
            this.state.transactions.forEach((t) => {
                data = data.concat(mapTransactionToTable(t, t.splits));
            });

            for (var i = 0; i < data.length; i++) {
                data[i].key = i;
            }

            const columns = [
                {
                    title: 'Datum',
                    key: 'date_posted_date',
                    render: t => {
                        if (t.date_posted_date == null) {
                            return null;
                        } else {
                            return moment(t.date_posted_date).format('YYYY-MM-DD');
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
                                <Link to={`/etransactions/${t.id}`}>
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
                    dataIndex: 'to'
                },
                {
                    title: 'Från',
                    dataIndex: 'from'
                }
            ];

            return (
                <div>
                  <TopMenu />
                  <Table id="transactionsTable" columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}


export { IndexTransaction, NewTransaction, ShowTransaction };
