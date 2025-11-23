import axios from 'axios';
import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { Col, Row } from 'antd';
import BookMenu from './BookMenu';

class IndexTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
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
      .get(`/api/v1/books/${bookId}/etransactions`)
      .then((response) => {
        this.setState({
          transactions: response.data.transactions,
          account_names: response.data.accounts,
        });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log(error);
          this.setState({ error });
        }
      });
  }

  renderTransactions = () => {
    const { transactions } = this.state;
    return transactions.reverse().map((t) => this.renderTransaction(t));
  };

  renderTransaction = (t) => {
    const {
      params: { bookId },
    } = this.props;

    return (
      <React.Fragment key={`t_${t.id}`}>
        <Row>
          <Col span={5}>
            <Link to={`/books/${bookId}/etransactions/${t.id}`}>
              { moment(t.date_posted).format('YYYY-MM-DD') }
            </Link>
          </Col>
          <Col>
            <Link to={`/books/${bookId}/etransactions/${t.id}`}>
              {t.description}
            </Link>
          </Col>
        </Row>
        { this.renderSplits(t.splits) }
        <hr />
      </React.Fragment>
    );
  };

  renderSplits = (splits) => (splits.map((s) => this.renderSplit(s)));

  renderSplit = (s) => {
    const renderMemo = (split) => {
      if (split.memo == null) {
        return null;
      }
      return (
        <Row key={`${split.id}_memo`}>
          <Col span={24}>
            { split.memo }
          </Col>
        </Row>
      );
    };

    const { account_names } = this.state;
    const base = (
      <React.Fragment key={s.id}>
        <Row key={s.id}>
          <Col span={20}>
            { account_names[s.account_id] }
          </Col>
          <Col span={4}>
            <div style={{ float: 'right' }}>
              { Number(s.value).toFixed(2) }
            </div>
          </Col>
        </Row>
        { renderMemo(s) }
      </React.Fragment>
    );

    switch (s.reconciled_state) {
      case 'y':
        return (
          <b key={s.id}>
            { base }
          </b>
        );

      case 'c':
        return base;

      default:
        return (
          <i key={s.id}>
            { base }
          </i>
        );
    }
  };

  render() {
    const {
      params: { bookId },
    } = this.props;

    const { error, transactions } = this.state;
    if (transactions == null) {
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
    return (
      <div>
        <BookMenu bookId={bookId} />
        { this.renderTransactions() }
      </div>
    );
  }
}
IndexTransaction.propTypes = {
  params: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <IndexTransaction
      params={useParams()}
    />
  );
}
