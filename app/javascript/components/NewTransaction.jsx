import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useParams } from 'react-router-dom';
import BookMenu from './BookMenu';

class NewTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      error: null,
    };
  }

  componentDidMount() {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/etransactions/new`)
      .then((response) => {
        this.setState({ transaction: response.data.transaction });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log(error);
        }
      });
  }

  render() {
    const {
      params: { bookId },
    } = this.props;

    const { error, transaction } = this.state;

    if (transaction == null) {
      if (error != null) {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>
              {`Could not load content: ${error}`}
            </h1>
          </div>
        );
      }
      return (
        <div>
          <BookMenu bookId={bookId} />
          <h1>Loading</h1>
        </div>
      );
    }
    return (<Navigate replace to={`/books/${bookId}/etransactions/${transaction.id}`} />);
  }
}
NewTransaction.propTypes = {
  params: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <NewTransaction
      params={useParams()}
    />
  );
}
