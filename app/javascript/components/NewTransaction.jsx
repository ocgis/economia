import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { BookMenu } from './Book';

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
      match: {
        params: { bookId },
      },
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
      match: {
        params: { bookId },
      },
    } = this.props;

    const { error, transaction } = this.state;
    if (transaction == null) {
      if (error != null) {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>
              Could not load content:
              {error}
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
    return (<Redirect to={`/books/${bookId}/etransactions/${transaction.id}`} />);
  }
}
NewTransaction.propTypes = {
  match: PropTypes.shape().isRequired,
};

export default NewTransaction;
