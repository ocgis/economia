import axios from "axios";
import React from "react";
import { Table } from "antd";
import { BookMenu } from "./Book";

class IndexCommodity extends React.Component {

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
            commodities: null,
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

        axios.get(`/api/v1/books/${bookId}/commodities`)
            .then(response => {
                let commodities = response.data.commodities;

                this.setState({ commodities: commodities });
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

        const commodities = this.state.commodities;
        if (commodities == null) {
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
                    title: 'Id',
                    dataIndex: 'id_'
                },
                {
                    title: 'Space',
                    dataIndex: 'space'
                },
                {
                    title: 'Name',
                    dataIndex: 'name'
                },
                {
                    title: 'Xcode',
                    dataIndex: 'xcode'
                },
                {
                    title: 'Fraction',
                    dataIndex: 'fraction'
                },
                {
                    title: 'Get quotes',
                    dataIndex: 'get_quotes'
                },
                {
                    title: 'Quote source',
                    dataIndex: 'quote_source'
                },
                {
                    title: 'Quote TZ',
                    dataIndex: 'quote_tz'
                }
            ];

            let data = this.state.commodities;
            return (
                <div>
                  <BookMenu bookId={bookId} />
                  <Table id="commoditiesTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}


export { IndexCommodity };
