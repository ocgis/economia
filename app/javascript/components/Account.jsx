import axios from "axios";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { Button, Col, Descriptions, Input, Row, Select } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import { BookMenu } from "./Book";

class IndexAccount extends React.Component {

    constructor(props) {
        super(props);
        this.resetState();
    }

    
    componentDidMount() {
        this.loadData();
    }

    
    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.loadData();
        }
    }


    resetState() {
        this.state = {
            accounts: null,
            accounts_map: null,
            commodities: null,
            error: null,
            filter: ''
        };
    }

    
    loadData() {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/books/${bookId}/accounts`)
            .then(response => {
                let accounts = response.data.accounts.sort((a, b) => response.data.accounts_map[a.id].localeCompare(response.data.accounts_map[b.id]));

                this.setState({ accounts: accounts,
                                accounts_map: response.data.accounts_map,
                                commodities: response.data.commodities });
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


    updateFilter = (event) => {
        this.setState({ filter: event.target.value });
    }


    render() {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        const accounts = this.state.accounts;
        if (accounts == null) {
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
            let data = this.state.accounts.filter(account => this.state.accounts_map[account.id].toLowerCase().includes(this.state.filter.toLowerCase()));
            return (
                <div>
                  <BookMenu bookId={bookId} />
                  {this.renderAddAccount()}
                  <div style={{"padding": "1em 0.5em"}}>
                    <Input placeholder="filter accounts" onChange={this.updateFilter} />
                  </div>
                  {this.renderAccounts(data)}
                </div>
            );
        }
    }

    renderAddAccount = () => {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        if (this.state.addAccountVisible) {
            return (
                <AddAccount
                  onSubmit={ (account, accounts_map) => { this.state.accounts.unshift(account); this.setState({ accounts: this.state.accounts, addAccountVisible: false, accounts_map: accounts_map }) } }
                  accounts={ this.state.accounts_map }
                  commodities={ this.state.commodities }
                  bookId={ bookId} />
            );
        } else {
            return (
                <PlusCircleOutlined onClick={ () => { this.setState({ addAccountVisible: true }) } } />
            );
        }
    }

    renderAccounts = (accounts) => {
        return accounts.map((account) => this.renderAccount(account));
    }


    renderAccount = (account) => {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        return (
            <React.Fragment key={account.id}>
              <Row>
                <Col span={18}>
                  <Link to={`/books/${bookId}/accounts/${account.id}`}>
                    {this.state.accounts_map[account.id]}
                  </Link>
                </Col>
                <Col span={6}>
                  <div style={{"float": "right"}}>
                    {Number(account.balance).toFixed(2)}
                  </div>
                </Col>
              </Row>
            </React.Fragment>
        );
    }
}

    
class AddAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render = () => {
        const {
            accounts,
            commodities
        } = this.props;

        if (this.state.values == null) {
            this.state.values = {
                type: 'BANK',
                commodity: 0
            }
        }

        let parentOptions = [];

        Object.keys(accounts).forEach((id) => {
            parentOptions = parentOptions.concat(
                <Select.Option value={id} key={id}>
                  { accounts[id] }
                </Select.Option>
            );
        });

        let typeOptions = ["ROOT", "BANK", "EQUITY", "INCOME", "LIABILITY", "ASSET", "CASH", "EXPENSE", "PAYABLE", "MUTUAL", "STOCK", "CREDIT"].map((type) => {
            return (
                <Select.Option value={type} key={type}>
                  {type}
                </Select.Option>
            );
        });

        let commodityOptions = commodities.map((t, i) => {
            return (
                <Select.Option value={i} key={i}>
                  { t.id_ }
                  <br />
                  ({ t.space })
                </Select.Option>
            );
        });

        return (
            <div>
              <Row>
                <Col span={5}>
                  <Input
                    defaultValue={this.state.values.name}
                    placeholder="name"
                    bordered={false}
                    onChange={ event => {this.state.values.name = event.target.value} }
                    />
                </Col>
                <Col span={2}>
                  <Select
                    defaultValue={this.state.values.type}
                    placeholder="type"
                    bordered={false}
                    style={{ minWidth: "100%" }}
                    dropDownStyle={{ minWidth: "100%" }}
                    onChange={ value => {this.state.values.type = value} }
                    >
                    {typeOptions}
                  </Select>
                </Col>
                <Col span={7}>
                  <Select
                    bordered={false}
                    defaultValue={this.state.values.parentId}
                    placeholder="parent account"
                    style={{ minWidth: "100%" }}
                    dropDownStyle={{ minWidth: "100%" }}
                    onChange={ value => {this.state.values.parentId = value} }
                    >
                    {parentOptions}
                  </Select>
                </Col>
                <Col span={10}>
                  <Select defaultValue={this.state.values.commodity} bordered={false} onChange={id => { this.state.values.commodity = id; } }>
                    {commodityOptions}
                  </Select>
                </Col>
              </Row>
              <Row>
                <Col span={2}>
                  <Button onClick={ () => { this.createAccount(this.props.onSubmit); } } >Submit</Button>
                </Col>
              </Row>
            </div>
        );
    }


    createAccount = (onCreated) => {
        const {
            commodities,
            bookId
        } = this.props;

        let account = {
            name: this.state.values.name,
            description: null,
            type_: this.state.values.type,
            commodity_scu: 100,
            code: null,
            parent_id: this.state.values.parentId,
            commodity_id: commodities[this.state.values.commodity].id_,
            commodity_space: commodities[this.state.values.commodity].space,
        }

        const csrfToken = document.querySelector('[name=csrf-token]').content
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

        axios.post(`/api/v1/books/${bookId}/accounts`, { account: account })
            .then(response => {
                onCreated(response.data.account, response.data.accounts_map);
            })
            .catch(error => console.log(error))
    }
}


class ShowAccount extends React.Component {

    constructor(props) {
        super(props);
        this.resetState();
    }

    
    componentDidMount() {
        this.loadData();
    }

    
    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.loadData();
        }
    }


    resetState() {
        this.state = {
            account: null,
            splits: null,
            error: null
        };
    }

    
    loadData() {
        const {
            match: {
                params: { id },
                params: { bookId }
            }
        } = this.props;

        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        let search = this.props.location.search;
        if (search == '') {
            search = search + '?';
        } else {
            search = search + '&';
        }
        search = search + 'limit=100';

        axios.get(`/api/v1/books/${bookId}/accounts/${id}${search}`)
            .then(response => {
                this.state = { account: response.data.account,
                               splits: response.data.splits };
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


    renderSplit = (split) => {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        if (split.value > 0) {
            split.from = null;
            split.to = Number(split.value).toFixed(2);
        } else if (split.value < 0) {
            split.from = Number(-split.value).toFixed(2);
            split.to = null;
        } else {
            split.from = null;
            split.to = null;
        }

        return (
            <Row key={split.id} >
              <Col span={5} >
                { moment(split.etransaction.date_posted).format('YYYY-MM-DD') }
              </Col>
              <Col span={11} >
                <Link to={`/books/${bookId}/etransactions/${split.etransaction_id}`}>{split.etransaction.description}</Link>
              </Col>
              <Col span={4} >
                <div style={{ 'float': 'right' }} >
                  { Number(split.value).toFixed(2) }
                </div>
              </Col>
              <Col span={4} >
                <div style={{ 'float': 'right' }} >
                  { Number(split.balance).toFixed(2) }
                </div>
              </Col>
            </Row>
        );
    }


    renderSplits = () => {
        let elements = this.state.splits.map(split => this.renderSplit(split));
        return elements;
    }


    render() {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        const account = this.state.account;
        const splits = this.state.splits;
        if (account == null) {
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
                  <Descriptions title="Account Information">
                    <Descriptions.Item label="Account">{account.full_name}</Descriptions.Item>
                    <Descriptions.Item label="Type">{account.type_}</Descriptions.Item>
                  </Descriptions>
                  { this.renderSplits() }
                </div>
            );
        }
    }
}


export { ShowAccount, IndexAccount };
