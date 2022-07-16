import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Col, Input, Row, Select,
} from 'antd';

class AddAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        type: 'BANK',
        commodity: 0,
      },
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

    axios.post(`/api/v1/books/${bookId}/accounts`, { account }).then(
      (response) => {
        onCreated(response.data.account, response.data.accounts_map);
      },
    ).catch(
      (error) => console.log(error),
    );
  };

  render() {
    const {
      accounts,
      commodities,
      onSubmit,
    } = this.props;
    const { values } = this.state;
    let parentOptions = [];

    Object.keys(accounts).forEach((id) => {
      parentOptions = parentOptions.concat(
        <Select.Option value={id} key={id}>
          { accounts[id] }
        </Select.Option>,
      );
    });

    const typeOptions = ['ROOT', 'BANK', 'EQUITY', 'INCOME', 'LIABILITY', 'ASSET', 'CASH', 'EXPENSE', 'PAYABLE', 'MUTUAL', 'STOCK', 'CREDIT'].map((type) => (
      <Select.Option value={type} key={type}>
        {type}
      </Select.Option>
    ));

    const commodityOptions = commodities.map((t, i) => (
      <Select.Option value={i} key={t.id_}>
        { t.id_ }
        <br />
        (
        { t.space }
        )
      </Select.Option>
    ));

    return (
      <div>
        <Row>
          <Col span={4}>
            <Input
              defaultValue={values.name}
              placeholder="name"
              bordered={false}
              onChange={(event) => {
                const name = event.target.value;
                this.setState((prevState) => ({ values: { ...prevState.values, name } }));
              }}
            />
          </Col>
          <Col span={4}>
            <Select
              defaultValue={values.type}
              placeholder="type"
              bordered={false}
              style={{ minWidth: '100%' }}
              dropdownMatchSelectWidth
              onChange={(value) => {
                const type = value;
                this.setState((prevState) => ({ values: { ...prevState.values, type } }));
              }}
            >
              {typeOptions}
            </Select>
          </Col>
          <Col span={10}>
            <Select
              bordered={false}
              defaultValue={values.parentId}
              placeholder="parent account"
              style={{ minWidth: '100%' }}
              dropdownMatchSelectWidth
              onChange={(value) => {
                const parentId = value;
                this.setState((prevState) => ({ values: { ...prevState.values, parentId } }));
              }}
            >
              {parentOptions}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              defaultValue={values.commodity}
              bordered={false}
              style={{ minWidth: '100%' }}
              dropdownMatchSelectWidth
              onChange={(id) => {
                const commodity = id;
                this.setState((prevState) => ({ values: { ...prevState.values, commodity } }));
              }}
            >
              {commodityOptions}
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={2}>
            <Button onClick={() => { this.createAccount(onSubmit); }}>Submit</Button>
          </Col>
        </Row>
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
