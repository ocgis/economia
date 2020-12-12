import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { BookMenu } from "./Book";

class IndexSummary extends React.Component {

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
            rows: null,
            year: null,
            month_numbers: null,
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

        axios.get(`/api/v1/books/${bookId}/summary${window.location.search}`)
            .then(response => {
                this.state = { rows: response.data.rows,
                               year: response.data.year,
                               month_numbers: response.data.month_numbers };
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
        const {
            match: {
                params: { bookId }
            }
        } = this.props;

        const rows = this.state.rows;
        if (rows == null) {
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
            let header = this.state.rows[0];
            const columns = [
                {
                    title: header.title,
                    key: 'title',
                    render: (t) => {
                        if (t.account_id != null) {
                            return (
                                <Link to={`/books/${bookId}/accounts/${t.account_id}?year=${this.state.year}`}>
                                  {t.title}
                                </Link>);
                        } else {
                            return t.title;
                        }
                    }
                },
                {
                    title: header.incoming,
                    key: 'incoming',
                    dataIndex: 'incoming'
                },
                ...header.months.map((o, index) => {
                    return {
                        title: o,
                        key: `month_${index}`,
                        render: (t) => {
                            if (t.account_id != null) {
                                return (
                                    <Link to={`/books/${bookId}/accounts/${t.account_id}?year=${this.state.year}&month=${this.state.month_numbers[index]}`}>
                                      {t.months[index]}
                                    </Link>);
                            } else {
                                return t.months[index];
                            }
                        }
                    };
                    
                }),
                {
                    title: header.average,
                    key: 'average',
                    dataIndex: 'average'
                },
                {
                    title: header.sum,
                    key: 'sum',
                    dataIndex: 'sum'
                }
            ];

            let data = this.state.rows.slice(1);
            return (
                <div>
                  <BookMenu bookId={bookId} />
                  <Link to={`/summary?year=${this.state.year-1}`}>&lt;</Link>
                  <Link to={`/summary?year=${this.state.year+1}`}>&gt;</Link>
                  <Table id="summaryTable" rowKey='title' columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}

    
export { IndexSummary };
