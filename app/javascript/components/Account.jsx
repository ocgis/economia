import axios from "axios";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { Col, Descriptions, Input, Row, Table } from "antd";
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
                                accounts_map: response.data.accounts_map });
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
            const columns = [
                {
                    title: 'Name',
                    key: 'id',
                    render: (t) => {
                        return (
                            <Link to={`/books/${bookId}/accounts/${t.id}`}>
                              {this.state.accounts_map[t.id]}
                            </Link>
                        );
                    }
                },
                {
                    title: 'Description',
                    dataIndex: 'description'
                },
                {
                    title: 'Balance',
                    dataIndex: 'balance'
                },
                {
                    title: 'Type',
                    dataIndex: 'type_'
                },
                {
                    title: 'Id',
                    dataIndex: 'id'
                },
                {
                    title: 'Commodity scu',
                    dataIndex: 'commodity_scu'
                },
                {
                    title: 'Code',
                    dataIndex: 'code'
                },
                {
                    title: 'Parent',
                    dataIndex: 'parent'
                },
                {
                    title: 'Commodity id',
                    dataIndex: 'commodity_id'
                },
                {
                    title: 'Commodity space',
                    dataIndex: 'commodity_space'
                }
            ];

            let data = this.state.accounts.filter(account => this.state.accounts_map[account.id].toLowerCase().includes(this.state.filter.toLowerCase()));
            return (
                <div>
                  <BookMenu bookId={bookId} />
                  <Input placeholder="filter accounts" onChange={this.updateFilter} />
                  <Table id="accountsTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
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
                  </Descriptions>
                  { this.renderSplits() }
                </div>
            );
        }
    }
}


export { ShowAccount, IndexAccount };
