import axios from "axios";
import moment from "moment";
import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Button, Descriptions, Input, Popconfirm, Table } from "antd";
import { TopMenu } from "./TopMenu";

class IndexBook extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      books: null,
      error: null
    };
  }


  componentDidMount() {
    this.loadData();
  }


  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.loadData();
    }
  }


  loadData() {
    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books`)
         .then(response => {
           this.setState({ books: response.data.books });
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


  destroyBook = (bookId) => {
    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.delete(`/api/v1/books/${bookId}`)
         .then(response => {
           this.setState({ books: response.data.books });
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
    let extraEntries = [<Link to={"/books/import"} key="import">Import file</Link>];
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
          title: 'Description',
          key: 'description',
          render: (t) => {
            return (
              <Link to={`/books/${t.id}`}>{t.description}</Link>
            );
          }
        },
        {
          title: 'Filename',
          key: 'filename',
          render: (t) => {
            return (
              <Link to={`/books/${t.id}`}>{t.filename}</Link>
            );
          }
        },
        {
          title: 'Delete',
          key: 'delete',
          render: (t) => {
            return (
              <Popconfirm
                placement="bottom"
                title={`Delete ${t.description}?`}
                onConfirm={ () => { this.destroyBook(t.id); } }
              >
                <Button>Delete</Button>
              </Popconfirm>
            );
          }
        },
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
IndexBook.propTypes = {
  history: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
};


let BookMenu = (props) => {
  let bookEntries = [<Link to={`/books/${props.bookId}/etransactions/new`} key="new">New transaction</Link>,
                     <Link to={`/books/${props.bookId}/accounts`} key="accounts">Accounts</Link>,
                     <Link to={`/books/${props.bookId}/etransactions`} key="transactions">Transactions</Link>,
                     <Link to={`/books/${props.bookId}/reports`} key="reports">Reports</Link>,
                     <Link to={`/books/${props.bookId}/prices`} key="prices">Prices</Link>,
                     <Link to={`/books/${props.bookId}/commodities`} key="commodities">Commodities</Link>,
                     <Link to={`/books/${props.bookId}/export`} key="export">Export</Link>];

  return (
    <TopMenu extraEntries={ bookEntries } />
  );
}
BookMenu.propTypes = {
  bookId: PropTypes.string.isRequired,
};

class ShowBook extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      book: null,
      error: null
    };
  }


  componentDidMount() {
    this.loadData();
  }


  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.loadData();
    }
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
           this.setState({ book: response.data.book });
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
ShowBook.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
};


class ImportBook extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      description: '',
      selectedFiles: null
    };
  }


  render() {
    return (
      <div>
        <TopMenu />
        <Input placeholder="description" onChange={this.onDescriptionChange} />
        <Input type="file" name="file" onChange={this.onChangeHandler} multiple />
        <Button type="button" onClick={this.onClickHandler}>Import</Button>
      </div>
    );
  }


  onDescriptionChange = (event) => {
    this.setState({ description: event.target.value });
  }


  onChangeHandler = (event) => {
    this.setState({ selectedFiles: event.target.files });
  }


  onClickHandler = () => {
    const data = new FormData();
    const files = this.state.selectedFiles;
    for (var i = 0; i < files.length; i++) {
      data.append('files[][file]', files[i]);
      data.append('files[][last_modified]', files[i].lastModified);
    }
    data.append('description', this.state.description);

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    axios.post("/api/v1/books/import", data, {}).then(response => {
      window.location.href = "/";
    })
  }
}


class ExportBook extends React.Component {

  constructor(props) {
    super(props);
  }

  exportBook = () => {
    const {
      match: {
        params: { id }
      }
    } = this.props;

    axios.get(`/api/v1/books/${id}/export`, { responseType: 'arraybuffer' })
	 .then(response => {
	   let url = window.URL.createObjectURL(new Blob([response.data]));
	   let a = document.createElement('a');
	   a.href = url;
           let cd = response.headers['content-disposition'];
           let s = cd.indexOf('"') + 1;
           let e = cd.lastIndexOf('"');
	   a.download = cd.substring(s, e);
	   a.click();
	 });
  }

  render() {
    const {
      match: {
        params: { id }
      }
    } = this.props;

    return (
      <div>
        <BookMenu bookId={id} />
	<button onClick={this.exportBook}>Export in Gnucash format</button>
      </div>
    );
  }
}
ExportBook.propTypes = {
  match: PropTypes.shape().isRequired,
};

export { ShowBook, IndexBook, ImportBook, ExportBook, BookMenu };
