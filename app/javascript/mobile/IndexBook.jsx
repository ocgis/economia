import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Link, useLocation, useNavigate,
} from 'react-router-dom';
import { Card, SwipeAction } from 'antd-mobile/2x';
import 'antd-mobile/2x/es/global';
import TopMenu from './TopMenu';

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
          navigate('/m');
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
          navigate('/');
        }
      });
  }

  render() {
    const { books, error } = this.state;

    const extraEntries = [<Link to="/m/books/import" key="import">Import file</Link>];
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

    const handleSwipeAction = (action, bookId) => {
      switch (action.key) {
        case 'delete':
          this.destroyBook(bookId);
          break;

        default:
          console.log(`ERROR: IndexBook: handleSwipeAction: Unknown action ${action.key}`); // eslint-disable-line no-console
      }
    };

    const { navigate } = this.props;
    const entries = books.map((book) => (
      <SwipeAction
        key={book.id}
        rightActions={[{
          key: 'delete',
          text: 'Delete',
        }]}
        onAction={(action) => handleSwipeAction(action, book.id)}
      >
        <Card
          title={book.filename}
          onClick={() => {
            navigate(`/m/books/${book.id}`);
          }}
        >
          {book.description}
        </Card>
      </SwipeAction>
    ));

    return (
      <div>
        <TopMenu extraEntries={extraEntries} />
        { entries }
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
