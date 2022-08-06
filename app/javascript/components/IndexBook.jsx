import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Popconfirm, Table } from 'antd';
import { TopMenu } from './TopMenu';

class IndexBook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: null,
      error: null,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (location.search !== prevProps.location.search) {
      this.loadData();
    }
  }

  destroyBook = (bookId) => {
    const { navigate } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .delete(`/api/v1/books/${bookId}`)
      .then((response) => {
        this.setState({ books: response.data.books });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log('Push /');
          navigate('/');
        }
      });
  };

  loadData() {
    const { navigate } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get('/api/v1/books')
      .then((response) => {
        this.setState({ books: response.data.books });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log('Push /');
          navigate('/');
        }
      });
  }

  render() {
    const { books, error } = this.state;

    const extraEntries = [<Link to="/books/import" key="import">Import file</Link>];
    if (books == null) {
      if (error != null) {
        return (
          <div>
            <TopMenu extraEntries={extraEntries} />
            <h1>
              {`Could not load content: ${error}`}
            </h1>
          </div>
        );
      }
      return (
        <div>
          <TopMenu extraEntries={extraEntries} />
          <h1>Loading</h1>
        </div>
      );
    }
    const columns = [
      {
        title: 'Description',
        key: 'description',
        render: (t) => (
          <Link to={`/books/${t.id}`}>{t.description}</Link>
        ),
      },
      {
        title: 'Filename',
        key: 'filename',
        render: (t) => (
          <Link to={`/books/${t.id}`}>{t.filename}</Link>
        ),
      },
      {
        title: 'Delete',
        key: 'delete',
        render: (t) => (
          <Popconfirm
            placement="bottom"
            title={`Delete ${t.description}?`}
            onConfirm={() => { this.destroyBook(t.id); }}
          >
            <Button>Delete</Button>
          </Popconfirm>
        ),
      },
      {
        title: 'Id',
        key: 'id',
        render: (t) => (
          <Link to={`/books/${t.id}`}>{t.id}</Link>
        ),
      },
    ];

    return (
      <div>
        <TopMenu extraEntries={extraEntries} />
        <Table id="booksTable" rowKey="id" columns={columns} dataSource={books} pagination={false} />
      </div>
    );
  }
}
IndexBook.propTypes = {
  location: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
};

export default function wrapper() {
  return (
    <IndexBook
      location={useLocation()}
      navigate={useNavigate()}
    />
  );
}
