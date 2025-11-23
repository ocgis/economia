import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Button, Col, DatePicker, Input, Row, Select,
} from 'antd';

class AddPrice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        time: moment(),
        value: 1.0,
        currency: 0,
        commodity: 0,
      },
    };
  }

  createPrice = (onCreated) => {
    const {
      commodities,
      bookId,
    } = this.props;
    const {
      values: {
        commodity, currency, time, value,
      },
    } = this.state;

    const price = {
      time,
      currency_space: commodities[currency].space,
      currency_id: commodities[currency].id_,
      commodity_space: commodities[commodity].space,
      commodity_id: commodities[commodity].id_,
      source: 'user:price',
      type_: 'unknown',
      value,
    };

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .post(`/api/v1/books/${bookId}/prices`, { price })
      .then((response) => {
        onCreated(response.data.price);
      })
      .catch((error) => console.log(error));
  };

  render() {
    const { commodities, onSubmit } = this.props;
    const {
      values: {
        commodity, currency, time, value,
      },
    } = this.state;

    const options = commodities.map((t, i) => (
      <Select.Option value={i} key={`${t.id_}_${t.space}`}>
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
          <Col span={5}>
            <DatePicker
              defaultValue={time}
              bordered={false}
              suffixIcon={null}
              onChange={(newTime) => {
                this.setState((prevState) => ({
                  values: {
                    ...prevState.values,
                    time: newTime,
                  },
                }));
              }}
            />
          </Col>
          <Col span={6}>
            <Input
              defaultValue={Number(value).toFixed(2)}
              placeholder="price"
              bordered={false}
              onChange={(event) => {
                const newValue = Number(event.target.value);
                this.setState((prevState) => ({
                  values: {
                    ...prevState.values,
                    value: newValue,
                  },
                }));
              }}
            />
          </Col>
          <Col span={1} />
          <Col span={12}>
            <Select
              defaultValue={currency}
              bordered={false}
              onChange={(newCurrency) => {
                this.setState((prevState) => ({
                  values: {
                    ...prevState.values,
                    currency: newCurrency,
                  },
                }));
              }}
            >
              {options}
            </Select>
            /
            <Select
              defaultValue={commodity}
              bordered={false}
              onChange={(newCommodity) => {
                this.setState((prevState) => ({
                  values: {
                    ...prevState.values,
                    commodity: newCommodity,
                  },
                }));
              }}
            >
              {options}
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={2}>
            <Button
              onClick={() => {
                this.createPrice(onSubmit);
              }}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}
AddPrice.propTypes = {
  commodities: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onSubmit: PropTypes.func.isRequired,
  bookId: PropTypes.string.isRequired,
};

export default AddPrice;
