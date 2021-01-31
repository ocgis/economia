import axios from "axios";
import React from "react";
import moment from "moment";
import { Button, Col, DatePicker, Input, Row, Select, Table } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import { BookMenu } from "./Book";

class IndexPrice extends React.Component {

    constructor(props) {
        super(props);
        this.resetState();
    }

    
    componentDidMount() {
        this.loadData();
    }

    
    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.loadData();
        }
    }


    resetState() {
        this.state = {
            prices: null,
            commodities: null,
            error: null
        };
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
            const columns = [
                {
                    title: 'Time',
                    dataIndex: 'time',
                    render: t => moment(t).format('YYYY-MM-DD')
                },
                {
                    title: 'Commodity id',
                    dataIndex: 'commodity_id'
                },
                {
                    title: 'Commodity space',
                    dataIndex: 'commodity_space'
                },
                {
                    title: 'Currency id',
                    dataIndex: 'currency_id'
                },
                {
                    title: 'Currency space',
                    dataIndex: 'currency_space'
                },
                {
                    title: 'Source',
                    dataIndex: 'source'
                },
                {
                    title: 'Value',
                    dataIndex: 'value'
                }
            ];

            let data = this.state.prices;
            return (
                <div>
                  <BookMenu bookId={bookId} />
                  { this.renderAddPrice() }
                  <br />
                  <Table id="pricesTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
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


}


class AddPrice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render = () => {
        const {
            commodities
        } = this.props;

        if (this.state.values == null) {
            this.state.values = {
                time: moment(),
                value: 1.0,
                currency: 0,
                commodity: 0
            }
        }

        let options = commodities.map((t, i) => {
            return (
                <Select.Option value={i} key={i}>
                  { `${t.id_} (${t.space})` }
                </Select.Option>
            );
        });

        return (
            <Row>
              <Col span={1}>
                <DatePicker defaultValue={ this.state.values.time } bordered={false} suffixIcon={null}
                            onChange={ m => { this.state.values.time = m; } } />
              </Col>
              <Col span={1}>
                <Input defaultValue={ Number(this.state.values.value).toFixed(2) } placeholder="price" bordered={false}
                       onChange={ event => { this.state.values.value = Number(event.target.value); } } />
              </Col>
              <Col span={2}>
                <Select defaultValue={this.state.values.currency} bordered={false} onChange={id => { this.state.values.currency = id; } }>
                  {options}
                </Select>
              </Col>
              <Col span={1}>
                /
              </Col>
              <Col span={2}>
                <Select defaultValue={this.state.values.commodity} bordered={false} onChange={id => { this.state.values.commodity = id; } }>
                  {options}
                </Select>
              </Col>
              <Col span={1}>
                <Button onClick={ () => { this.createPrice(this.props.onSubmit); } } >Submit</Button>
              </Col>
            </Row>
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


export { IndexPrice };
