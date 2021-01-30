import axios from "axios";
import React from "react";
import moment from "moment";
import { Table } from "antd";
import { BookMenu } from "./Book";

class IndexPrice extends React.Component {

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
            prices: null,
            error: null
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

        axios.get(`/api/v1/books/${bookId}/prices`)
            .then(response => {
                let prices = response.data.prices.sort((a, b) => { return moment(b.time) - moment(a.time) });

                this.setState({ prices: prices });
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


    render() {
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        const prices = this.state.prices;
        if (prices == null) {
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
                    title: 'Time',
                    dataIndex: 'time',
                    render: t => moment(t).format('YYYY-MM-DD')
                },
                {
                    title: 'Commodity id',
                    dataIndex: 'commodity_id'
                },
                {
                    title: 'Commodity space',
                    dataIndex: 'commodity_space'
                },
                {
                    title: 'Currency id',
                    dataIndex: 'currency_id'
                },
                {
                    title: 'Currency space',
                    dataIndex: 'currency_space'
                },
                {
                    title: 'Source',
                    dataIndex: 'source'
                },
                {
                    title: 'Value',
                    dataIndex: 'value'
                }
            ];

            let data = this.state.prices;
            return (
                <div>
                  <BookMenu bookId={bookId} />
                  <Table id="pricesTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}


export { IndexPrice };
