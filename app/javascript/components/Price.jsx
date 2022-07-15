import axios from "axios";
import React from "react";
import PropTypes from 'prop-types';
import moment from "moment";
import { Button, Col, DatePicker, Input, Popconfirm, Row, Select } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { BookMenu } from "./Book";

class AddPrice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        time: moment(),
        value: 1.0,
        currency: 0,
        commodity: 0
      }
    };
  }

  render = () => {
    const {
      commodities
    } = this.props;

    let options = commodities.map((t, i) => {
      return (
        <Select.Option value={i} key={i}>
          { t.id_ }
          <br />
          ({ t.space })
        </Select.Option>
      );
    });

    return (
      <div>
        <Row>
          <Col span={5}>
            <DatePicker
              defaultValue={ this.state.values.time }
              bordered={false}
              suffixIcon={null}
              onChange={ time => {
                this.setState((prevState) => ({values: {...prevState.values, time}}));
              } }
            />
          </Col>
          <Col span={6}>
            <Input
              defaultValue={ Number(this.state.values.value).toFixed(2) }
              placeholder="price"
              bordered={false}
              onChange={ event => {
                const value = Number(event.target.value);
                this.setState((prevState) => ({values: {...prevState.values, value}}));
              } }
            />
          </Col>
          <Col span={1}/>
          <Col span={12}>
            <Select
              defaultValue={this.state.values.currency}
              bordered={false}
              onChange={ currency => {
                this.setState((prevState) => ({values: {...prevState.values, currency}}));
              } }
            >
              {options}
            </Select>
            /
            <Select
              defaultValue={this.state.values.commodity}
              bordered={false}
              onChange={commodity => {
                this.setState((prevState) => ({values: {...prevState.values, commodity}}));
              } }
            >
              {options}
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={2}>
            <Button
              onClick={ () => {
                this.createPrice(this.props.onSubmit);
              } }
            >Submit</Button>
          </Col>
        </Row>
      </div>
    );
  }


  createPrice = (onCreated) => {
    const {
      commodities,
      bookId
    } = this.props;

    let price = {
      time: this.state.values.time,
      currency_space: commodities[this.state.values.currency].space,
      currency_id: commodities[this.state.values.currency].id_,
      commodity_space: commodities[this.state.values.commodity].space,
      commodity_id: commodities[this.state.values.commodity].id_,
      source: "user:price",
      type_: "unknown",
      value: this.state.values.value
    };

    const csrfToken = document.querySelector('[name=csrf-token]').content
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

    axios.post(`/api/v1/books/${bookId}/prices`, { price: price })
         .then(response => {
           onCreated(response.data.price);
         })
         .catch(error => console.log(error))
  }
}
AddPrice.propTypes = {
  commodities: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onSubmit: PropTypes.func.isRequired,
  bookId: PropTypes.string.isRequired,
};

class IndexPrice extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      prices: null,
      commodities: null,
      error: null
    };
  }


  componentDidMount() {
    this.loadData();
  }


  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.loadData();
    }
  }


  loadData() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books/${bookId}/prices`)
         .then(response => {
           let prices = response.data.prices.sort((a, b) => { return moment(b.time) - moment(a.time) });

           this.setState({ prices: prices,
                           commodities: response.data.commodities });
         })
         .catch(error => {
           if (error.response) {
             this.setState({ error: `${error.response.status} ${error.response.statusText}` });
           } else {
             console.log(error);
             console.log("Push /");
             this.props.history.push("/");
           }
         });
  }


  render() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const prices = this.state.prices;
    if (prices == null) {
      if (this.state.error != null) {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Could not load content: {this.state.error}</h1>
          </div>
        );
      } else {
        return (
          <div>
            <BookMenu bookId={bookId} />
            <h1>Loading</h1>
          </div>
        );
      }
    } else {
      return (
        <div>
          <BookMenu bookId={bookId} />
          { this.renderAddPrice() }
          <br />
          { this.renderPrices() }
        </div>
      );
    }
  }


  renderAddPrice = () => {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    if (this.state.addPriceVisible) {
      return (
        <AddPrice onSubmit={ (price) => { this.state.prices.unshift(price); this.setState({ prices: this.state.prices, addPriceVisible: false }) } } commodities={ this.state.commodities } bookId={ bookId} />
      );
    } else {
      return (
        <PlusCircleOutlined onClick={ () => { this.setState({ addPriceVisible: true }) } } />
      );
    }
  }


  renderPrices = () => {
    return this.state.prices.map((price) => this.renderPrice(price));
  }


  renderPrice = (price) => {
    return (
      <Row key={ price.id }>
        <Col span={ 5 }>
          { moment(price.time).format('YYYY-MM-DD') }
        </Col>
        <Col span={ 6 }>
          <div style={{ 'float': 'right' }}>
            { Number(price.value).toFixed(4) }
          </div>
        </Col>
        <Col span={ 1 } />
        <Col span={ 11 }>
          { price.currency_id } / { price.commodity_id }
        </Col>
        <Col span={ 1 }>
          <Popconfirm
            placement="bottom"
            title={`Delete price?`}
            onConfirm={() => { this.destroyPrice(price.id); }}
          >
            <MinusCircleOutlined />
          </Popconfirm>
        </Col>
      </Row>
    );
  }


  destroyPrice = (priceId) => {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.delete(`/api/v1/books/${bookId}/prices/${priceId}`)
         .then(response => {
           let prices = response.data.prices.sort((a, b) => { return moment(b.time) - moment(a.time) });

           this.setState({ prices: prices,
                           commodities: response.data.commodities });
         })
         .catch(error => {
           if (error.response) {
             this.setState({ error: `${error.response.status} ${error.response.statusText}` });
           } else {
             console.log(error);
             console.log("Push /");
             this.props.history.push("/");
           }
         });
  }
}
IndexPrice.propTypes = {
  match: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
};


export { IndexPrice };
