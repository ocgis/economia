import axios from "axios";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { Descriptions, Table } from "antd";
import TopMenu from "./TopMenu";

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
            error: null
        };
    }

    
    loadData() {
        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/accounts`)
            .then(response => {
                this.state = { accounts: response.data.accounts,
                               accounts_map: response.data.accounts_map };
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


    render() {
        const accounts = this.state.accounts;
        if (accounts == null) {
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
            const columns = [
                {
                    title: 'Name',
                    key: 'id',
                    render: (t) => {
                        return (
                            <Link to={`/accounts/${t.id}`}>
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
                    title: 'Type',
                    dataIndex: 'type_'
                },
                {
                    title: 'Id',
                    dataIndex: 'id_'
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
                    dataIndex: 'commodity_id_'
                },
                {
                    title: 'Commodity space',
                    dataIndex: 'commodity_space'
                }
            ];

            let data = this.state.accounts;
            return (
                <div>
                  <TopMenu />
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
                params: { id }
            }
        } = this.props;

        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/accounts/${id}${this.props.location.search}`)
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


    render() {
        const account = this.state.account;
        const splits = this.state.splits;
        if (account == null) {
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
            const columns = [
                {
                    title: 'Datum',
                    key: 'date_posted_date',
                    render: t => {
                        if (t.etransaction.date_posted_date == null) {
                            return null;
                        } else {
                            return moment(t.etransaction.date_posted_date).format('YYYY-MM-DD');
                        }
                    }
                },
                {
                    title: 'Num',
                    key: 'num',
                    render: t => t.etransaction.num
                },
                {
                    title: 'Beskrivning',
                    key: 'description',
                    render: t => (
                        <Link to={`/etransactions/${t.etransaction_id}`}>{t.etransaction.description}</Link>
                    )
                },
                {
                    title: 'Memo',
                    dataIndex: 'memo'
                },
                {
                    title: 'Överföring',
                    dataIndex: 'other_account'
                },
                {
                    title: 'Avstämt',
                    dataIndex: 'reconciled_state',
                },
                {
                    title: account.decrease_name,
                    key: 'decrease',
                    render: split => {
                        if (split.value > 0) {
                            return Number(split.value).toFixed(2);
                        } else {
                            return null;
                        }
                    }
                },
                {
                    title: account.increase_name,
                    key: 'increase',
                    render: split => {
                        if (split.value < 0) {
                            return Number(-split.value).toFixed(2);
                        } else {
                            return null;
                        }
                    }
                },
                {
                    title: 'Saldo',
                    dataIndex: 'balance'
                }
            ];

            let balance = 0;
            let data = this.state.splits;
            for (var i = 0; i < data.length; i++) {
                balance = Number(data[i].value) + Number(balance);
                data[i].balance = balance.toFixed(2);
            }

            return (
                <div>
                  <TopMenu />
                  <Descriptions title="Account Information">
                    <Descriptions.Item label="Name">{account.full_name}</Descriptions.Item>
                    <Descriptions.Item label="Description">{account.description}</Descriptions.Item>
                    <Descriptions.Item label="Type">{account.type_}</Descriptions.Item>
                    <Descriptions.Item label="Id">{account.id_}</Descriptions.Item>
                    <Descriptions.Item label="Commodity scu">{account.commodity_scu}</Descriptions.Item>
                    <Descriptions.Item label="Code">{account.code}</Descriptions.Item>
                    <Descriptions.Item label="Parent">{account.parent}</Descriptions.Item>
                    <Descriptions.Item label="Commodity id">{account.commodity_id_}</Descriptions.Item>
                    <Descriptions.Item label="Commodity space">{account.commodity_space}</Descriptions.Item>
                  </Descriptions>
                  <Table id="splitsTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}


export { ShowAccount, IndexAccount };
