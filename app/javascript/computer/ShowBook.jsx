import axios from 'axios';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import BookMenu from './BookMenu';
import TopMenu from './TopMenu';

class ShowBook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      book: null,
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

  loadData() {
    const {
      location,
      navigate,
      params: { id },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${id}${location.search}`)
      .then((response) => {
        this.setState({ book: response.data.book });
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
    const { book, error } = this.state;
    if (book == null) {
      if (error != null) {
        return (
          <div>
            <TopMenu />
            <h1>
              { `Could not load content: ${error}` }
            </h1>
          </div>
        );
      }
      return (
        <div>
          <TopMenu />
          <h1>Loading</h1>
        </div>
      );
    }
    return (
      <div>
        <BookMenu bookId={book.id} />
      </div>
    );
  }
}
ShowBook.propTypes = {
  location: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
  params: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <ShowBook
      location={useLocation()}
      params={useParams()}
      navigate={useNavigate()}
    />
  );
}
