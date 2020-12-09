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
        let extraEntries = [<a href={"/books/import"}>Import file</a>];
        if (books == null) {

            if (this.state.error != null) {
                return (
                    <div>
                      <TopMenu extraEntries={extraEntries} />
                      <h1>Could not load content: {this.state.error}</h1>
                    </div>
                );
            } else {
                return (
                    <div>
                      <TopMenu extraEntries={extraEntries} />
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
                  <TopMenu extraEntries={extraEntries} />
                  <Table id="booksTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
                </div>
            );
        }
    }
}


let BookMenu = (props) => {
    let bookEntries = [<Link to={`/books/${props.bookId}/etransactions/new`}>New transaction</Link>,
                       <Link to={`/books/${props.bookId}/accounts`}>Accounts</Link>,
                       <Link to={`/books/${props.bookId}/summary`}>Summary</Link>,
                       <Link to={`/books/${props.bookId}/etransactions`}>Transactions</Link>];
                         
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
                  <BookMenu bookId={book.id} />
                </div>
            );
        }
    }
}


class ImportBook extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: null
        };
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onClickHandler = this.onClickHandler.bind(this);
    }


    render() {
        return (
            <div>
              <TopMenu />
              <input type="file" name="file" onChange={this.onChangeHandler} multiple />
              <button type="button" onClick={this.onClickHandler}>Import</button>
            </div>
        );
    }


    onChangeHandler(event) {
        this.setState({
            selectedFiles: event.target.files,
            loaded: 0,
        });
    }


    onClickHandler() {
        const data = new FormData();
        const files = this.state.selectedFiles;
        for (var i = 0; i < files.length; i++) {
            data.append('files[][file]', files[i]);
            data.append('files[][last_modified]', files[i].lastModified);
        }

        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
        axios.post("/api/v1/books/import", data, {}).then(response => {
            window.location.href = "/";
        })
    }  
}


export { ShowBook, IndexBook, ImportBook, BookMenu };
