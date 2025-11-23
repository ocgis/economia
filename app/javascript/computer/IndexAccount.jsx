import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Col, Input, Row,
} from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import BookMenu from './BookMenu';
import AddAccount from './AddAccount';

class IndexAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: null,
      accounts_map: null,
      commodities: null,
      error: null,
      filter: '',
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

  updateFilter = (event) => {
    this.setState({ filter: event.target.value });
  };

  loadData() {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/accounts`)
      .then((response) => {
        const accounts = response.data.accounts.sort((a, b) => {
          const aDate = new Date(a.sortdate);
          const bDate = new Date(b.sortdate);
          return bDate - aDate;
        });

        this.setState({
          accounts,
          accounts_map: response.data.accounts_map,
          commodities: response.data.commodities,
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

  renderAddAccount = () => {
    const {
      params: { bookId },
    } = this.props;
    const { addAccountVisible, accounts_map, commodities } = this.state;
    if (addAccountVisible) {
      return (
        <AddAccount
          onSubmit={(account, accountsMap) => {
            const { accounts } = this.state;
            const newAccounts = [...accounts];
            newAccounts.unshift(account);
            this.setState({
              accounts: newAccounts,
              addAccountVisible: false,
              accounts_map: accountsMap,
            });
          }}
          accounts={accounts_map}
          commodities={commodities}
          bookId={bookId}
        />
      );
    }
    return (
      <PlusCircleOutlined
        onClick={() => {
          this.setState({ addAccountVisible: true });
        }}
      />
    );
  };

  renderAccounts = (accounts) => accounts.map((account) => this.renderAccount(account));

  renderAccount = (account) => {
    const {
      params: { bookId },
    } = this.props;
    const { accounts_map } = this.state;

    return (
      <React.Fragment key={account.id}>
        <Row>
          <Col span={18}>
            <Link to={`/books/${bookId}/accounts/${account.id}`}>
              {accounts_map[account.id]}
            </Link>
          </Col>
          <Col span={6}>
            <div style={{ float: 'right' }}>
              {Number(account.balance).toFixed(2)}
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  };

  render() {
    const {
      params: { bookId },
    } = this.props;

    const {
      accounts, accounts_map, error, filter,
    } = this.state;
    if (accounts == null) {
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
    const data = accounts.filter(
      (account) => accounts_map[account.id].toLowerCase().includes(filter.toLowerCase()),
    );
    return (
      <div>
        <BookMenu bookId={bookId} />
        {this.renderAddAccount()}
        <div style={{ padding: '1em 0.5em' }}>
          <Input placeholder="filter accounts" onChange={this.updateFilter} />
        </div>
        {this.renderAccounts(data)}
      </div>
    );
  }
}
IndexAccount.propTypes = {
  params: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <IndexAccount
      params={useParams()}
      location={useLocation()}
    />
  );
}
