import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, CheckList, Grid, Input,
} from 'antd-mobile/2x';
import 'antd-mobile/2x/es/global';

const stateMain = 0;
const stateType = 1;
const stateParent = 2;
const stateCommodity = 3;

class AddAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        name: undefined,
        type: 'BANK',
        parentId: null,
        commodity: 0,
      },
      aaState: stateMain,
    };
  }

  createAccount = (onCreated) => {
    const {
      commodities,
      bookId,
    } = this.props;
    const { values } = this.state;
    const account = {
      name: values.name,
      description: null,
      type_: values.type,
      commodity_scu: 100,
      code: null,
      parent_id: values.parentId,
      commodity_id: commodities[values.commodity].id_,
      commodity_space: commodities[values.commodity].space,
    };

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .post(`/api/v1/books/${bookId}/accounts`, { account })
      .then((response) => {
        onCreated(response.data.account, response.data.accounts_map);
      })
      .catch(
        (error) => console.log('ERROR:', error), // eslint-disable-line no-console
      );
  };

  render() {
    const {
      accounts,
      commodities,
      onSubmit,
    } = this.props;
    const { values, aaState } = this.state;

    const typeListItems = ['ROOT', 'BANK', 'EQUITY', 'INCOME', 'LIABILITY', 'ASSET', 'CASH', 'EXPENSE', 'PAYABLE', 'MUTUAL', 'STOCK', 'CREDIT'].map((t) => (
      <CheckList.Item key={t} value={t}>
        {t}
      </CheckList.Item>
    ));

    const parentListItems = Object.keys(accounts).map((id) => (
      <CheckList.Item key={id} value={id}>
        { accounts[id] }
      </CheckList.Item>
    ));

    const commodityListItems = commodities.map((t, i) => (
      <CheckList.Item key={t.id_} value={i}>
        { `${t.id_} (${t.space})` }
      </CheckList.Item>
    ));

    return (
      <div>
        <Grid columns={24}>
          <Grid.Item span={4}>
            <Input
              defaultValue={values.name}
              placeholder="name"
              bordered={false}
              onChange={(name) => {
                this.setState((prevState) => ({ values: { ...prevState.values, name } }));
              }}
            />
          </Grid.Item>
          <Grid.Item span={4} onClick={() => this.setState({ aaState: stateType })}>
            <Input
              value={values.type}
              placeholder="type"
              bordered={false}
            />
          </Grid.Item>
          <Grid.Item span={10} onClick={() => this.setState({ aaState: stateParent })}>
            <Input
              value={accounts[values.parentId]}
              placeholder="parent account"
              bordered={false}
            />
          </Grid.Item>
          <Grid.Item span={6} onClick={() => this.setState({ aaState: stateCommodity })}>
            <Input
              value={`${commodities[values.commodity].id_} (${commodities[values.commodity].space})`}
              placeholder="commodity"
              bordered={false}
            />
          </Grid.Item>
        </Grid>
        {aaState === stateMain
      && (
      <Grid columns={24}>
        <Grid.Item span={2}>
          <Button onClick={() => { this.createAccount(onSubmit); }}>Submit</Button>
        </Grid.Item>
      </Grid>
      )}
        {aaState === stateType
      && (
        <CheckList
          defaultValue={[values.type]}
          onChange={([type]) => {
            this.setState((prevState) => ({
              values: { ...prevState.values, type },
              aaState: stateMain,
            }));
          }}
        >
          {typeListItems}
        </CheckList>
      )}
        {aaState === stateParent
      && (
        <CheckList
          defaultValue={[values.parentId]}
          onChange={([parentId]) => {
            this.setState((prevState) => ({
              values: { ...prevState.values, parentId },
              aaState: stateMain,
            }));
          }}
        >
          {parentListItems}
        </CheckList>
      )}
        {aaState === stateCommodity
      && (
        <CheckList
          defaultValue={[values.commodity]}
          onChange={([commodity]) => {
            this.setState((prevState) => ({
              values: { ...prevState.values, commodity },
              aaState: stateMain,
            }));
          }}
        >
          {commodityListItems}
        </CheckList>
      )}
      </div>
    );
  }
}
AddAccount.propTypes = {
  accounts: PropTypes.shape().isRequired,
  commodities: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onSubmit: PropTypes.func.isRequired,
  bookId: PropTypes.string.isRequired,
};

export default AddAccount;
