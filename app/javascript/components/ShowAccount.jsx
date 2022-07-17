import axios from 'axios';
import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Col, Descriptions, Row,
} from 'antd';
import { BookMenu } from './Book';

class ShowAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      splits: null,
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
      match: {
        params: { id },
        params: { bookId },
      },
      location,
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    let { search } = location;
    if (search === '') {
      search += '?';
    } else {
      search += '&';
    }
    search += 'limit=100';

    axios
      .get(`/api/v1/books/${bookId}/accounts/${id}${search}`)
      .then((response) => {
        this.setState({
          account: response.data.account,
          splits: response.data.splits,
        });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log(error);
        }
      });
  }

  renderSplit = (split) => {
    const {
      match: {
        params: { bookId },
      },
    } = this.props;

    const base = (
      <Row key={split.id}>
        <Col span={5}>
          { moment(split.etransaction.date_posted).format('YYYY-MM-DD') }
        </Col>
        <Col span={11}>
          <Link to={`/books/${bookId}/etransactions/${split.etransaction_id}`}>{split.etransaction.description}</Link>
        </Col>
        <Col span={4}>
          <div style={{ float: 'right' }}>
            { Number(split.value).toFixed(2) }
          </div>
        </Col>
        <Col span={4}>
          <div style={{ float: 'right' }}>
            { Number(split.balance).toFixed(2) }
          </div>
        </Col>
      </Row>
    );

    switch (split.reconciled_state) {
      case 'y':
        return (
          <b key={split.id}>
            { base }
          </b>
        );

      case 'c':
        return base;

      default:
        return (
          <i key={split.id}>
            { base }
          </i>
        );
    }
  };

  renderSplits = () => {
    const { splits } = this.state;
    const elements = splits.map((split) => this.renderSplit(split));
    return elements;
  };

  render() {
    const {
      match: {
        params: { bookId },
      },
    } = this.props;

    const { account, error } = this.state;
    if (account == null) {
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
    return (
      <div>
        <BookMenu bookId={bookId} />
        <Descriptions title="Account Information">
          <Descriptions.Item label="Account">{account.full_name}</Descriptions.Item>
          <Descriptions.Item label="Type">{account.type_}</Descriptions.Item>
        </Descriptions>
        { this.renderSplits() }
      </div>
    );
  }
}
ShowAccount.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
};

export default ShowAccount;
