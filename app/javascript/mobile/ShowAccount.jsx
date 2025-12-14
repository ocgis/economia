import axios from 'axios';
import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Link, useLocation, useNavigate, useParams,
} from 'react-router-dom';
import { Grid } from 'antd-mobile/2x';
import 'antd-mobile/2x/es/global';
import BookMenu from './BookMenu';

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
      params: { bookId, id },
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
    search += 'limit=500';

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
      params: { bookId },
      navigate,
    } = this.props;

    const goToTransaction = () => navigate(`/m/books/${bookId}/etransactions/${split.etransaction_id}`);

    const base = (
      <Grid columns={24} key={split.id}>
        <Grid.Item span={5} onClick={goToTransaction}>
          { moment(split.etransaction.date_posted).format('YYYY-MM-DD') }
        </Grid.Item>
        <Grid.Item span={19} onClick={goToTransaction}>
          { split.etransaction.description }
        </Grid.Item>
        <Grid.Item span={18} onClick={goToTransaction}>
          <div style={{ float: 'right' }}>
            { Number(split.value).toFixed(2) }
          </div>
        </Grid.Item>
        <Grid.Item span={6} onClick={goToTransaction}>
          <div style={{ float: 'right' }}>
            { Number(split.balance).toFixed(2) }
          </div>
        </Grid.Item>
      </Grid>
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
      params: { bookId },
    } = this.props;

    const { account, error } = this.state;
    if (account == null) {
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
        <Grid columns={24}>
          <Grid.Item span={3}>
            <b>Account</b>
          </Grid.Item>
          <Grid.Item span={21}>
            { account.full_name }
          </Grid.Item>
          <Grid.Item span={3}>
            <b>Type</b>
          </Grid.Item>
          <Grid.Item span={21}>
            { account.type_ }
          </Grid.Item>
        </Grid>
        <b>Transactions</b>
        { this.renderSplits() }
      </div>
    );
  }
}
ShowAccount.propTypes = {
  location: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
  params: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <ShowAccount
      location={useLocation()}
      navigate={useNavigate()}
      params={useParams()}
    />
  );
}
