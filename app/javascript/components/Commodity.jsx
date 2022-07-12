import axios from "axios";
import React from "react";
import PropTypes from 'prop-types';
import { Button, Col, Input, Row, Table } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import { BookMenu } from "./Book";

class AddCommodity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commodity: {
        id_: '',
        space: '',
        fraction: 100
      }
    };
  }

  render = () => {
    let parentOptions = [];

    return (
      <div>
        <Row>
          <Col span={4}>
            <Input
              defaultValue={this.state.commodity.id_}
              placeholder="id"
              bordered={false}
              onChange={ event => {
                const id_ = event.target.value;
                this.setState((prevState) => ({commodity: {...prevState.commodity, id_}}));
              } }
            />
          </Col>
          <Col span={4}>
            <Input
              defaultValue={this.state.commodity.space}
              placeholder="space"
              bordered={false}
              onChange={ event => {
                const space = event.target.value;
                this.setState((prevState) => ({commodity: {...prevState.commodity, space}}));
              } }
            />
          </Col>
          <Col span={4}>
            <Input
              defaultValue={this.state.commodity.fraction}
              placeholder="fraction"
              bordered={false}
              onChange={ event => {
                const fraction = event.target.value;
                this.setState((prevState) => ({commodity: {...prevState.commodity, fraction}}));
              } }
            />
          </Col>
        </Row>
        <Row>
          <Col span={2}>
            <Button onClick={ () => { this.createCommodity(this.props.onSubmit); } } >Submit</Button>
          </Col>
        </Row>
      </div>
    );
  }


  createCommodity = (onCreated) => {
    const {
      bookId
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

    axios.post(`/api/v1/books/${bookId}/commodities`, { commodity: this.state.commodity })
         .then(response => {
           onCreated(response.data.commodity);
         })
         .catch(error => console.log(error))
  }
}
AddCommodity.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  bookId: PropTypes.string.isRequired,
};

class IndexCommodity extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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

    axios.get(`/api/v1/books/${bookId}/commodities`)
         .then(response => {
           let commodities = response.data.commodities;

           this.setState({ commodities: commodities });
         })
         .catch(error => {
           if (error.response) {
             this.setState({ error: `${error.response.status} ${error.response.statusText}` });
           } else {
             console.log("Push /");
             this.props.history.push("/");
           }
         });
  }


  renderAddCommodity = () => {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    if (this.state.addCommodityVisible) {
      return (
        <AddCommodity
          onSubmit={ (commodity) => {
            this.setState((prevState) => ({
              commodities: [...prevState.commodities, commodity],
              addCommodityVisible: false}));
          } }
          bookId={ bookId} />
      );
    } else {
      return (
        <PlusCircleOutlined onClick={ () => {
          this.setState({
            addCommodityVisible: true
          }) } } />
      );
    }
  }

  render() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;

    const commodities = this.state.commodities;
    if (commodities == null) {
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
          title: 'Id',
          dataIndex: 'id_'
        },
        {
          title: 'Space',
          dataIndex: 'space'
        },
        {
          title: 'Name',
          dataIndex: 'name'
        },
        {
          title: 'Xcode',
          dataIndex: 'xcode'
        },
        {
          title: 'Fraction',
          dataIndex: 'fraction'
        },
        {
          title: 'Get quotes',
          dataIndex: 'get_quotes'
        },
        {
          title: 'Quote source',
          dataIndex: 'quote_source'
        },
        {
          title: 'Quote TZ',
          dataIndex: 'quote_tz'
        }
      ];

      let data = this.state.commodities;
      return (
        <div>
          <BookMenu bookId={bookId} />
          {this.renderAddCommodity()}
          <Table
            id="commoditiesTable"
            rowKey={record => `${record.id_},${record.space}`}
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        </div>
      );
    }
  }
}
IndexCommodity.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
};

export { IndexCommodity };
