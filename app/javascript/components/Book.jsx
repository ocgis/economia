import axios from "axios";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { Descriptions, Table } from "antd";
import { TopMenu } from "./TopMenu";

class IndexBook extends React.Component {

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
            books: null,
            error: null
        };
    }

    
    loadData() {
        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        axios.get(`/api/v1/books`)
            .then(response => {
                this.state = { books: response.data.books };
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
        const books = this.state.books;
        if (books == null) {
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
                    title: 'Id',
                    key: 'id',
                    render: (t) => {
                        return (
                            <Link to={`/books/${t.id}`}>{t.id}</Link>
                        );
                    }
                }
            ];

            let data = this.state.books;
            return (
                <div>
                  <TopMenu />
                  <Table id="booksTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}


let BookMenu = () => {
    let bookEntries = [<Link to={"/etransactions/new"}>New transaction</Link>,
                       <Link to={"/accounts"}>Accounts</Link>,
                       <Link to={"/summary"}>Summary</Link>,
                       <Link to={"/etransactions"}>Transactions</Link>];
                         
    return (
        <TopMenu extraEntries={ bookEntries } />
    );
}


class ShowBook extends React.Component {

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
            book: null,
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

        axios.get(`/api/v1/books/${id}${this.props.location.search}`)
            .then(response => {
                this.state = { book: response.data.book };
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
        const book = this.state.book;
        if (book == null) {
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
            return (
                <div>
                  <BookMenu />
                </div>
            );
        }
    }
}


export { ShowBook, IndexBook, BookMenu };
