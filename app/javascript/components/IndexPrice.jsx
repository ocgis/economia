import axios from 'axios';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Col, Popconfirm, Row } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AddPrice from './AddPrice';
import BookMenu from './BookMenu';

class IndexPrice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prices: null,
      commodities: null,
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

  destroyPrice = (priceId) => {
    const {
      navigate,
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .delete(`/api/v1/books/${bookId}/prices/${priceId}`)
      .then((response) => {
        const prices = response.data.prices.sort((a, b) => moment(b.time) - moment(a.time));

        this.setState({
          prices,
          commodities: response.data.commodities,
        });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log(error);
          console.log('Push /');
          navigate('/');
        }
      });
  };

  loadData() {
    const {
      navigate,
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/prices`)
      .then((response) => {
        const prices = response.data.prices.sort((a, b) => moment(b.time) - moment(a.time));

        this.setState({
          prices,
          commodities: response.data.commodities,
        });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log(error);
          console.log('Push /');
          navigate('/');
        }
      });
  }

  renderAddPrice = () => {
    const {
      params: { bookId },
    } = this.props;
    const { addPriceVisible, commodities } = this.state;

    if (addPriceVisible) {
      return (
        <AddPrice
          onSubmit={(price) => {
            this.setState((prevState) => ({
              prices: [price, ...prevState.prices],
              addPriceVisible: false,
            }));
          }}
          commodities={commodities}
          bookId={bookId}
        />
      );
    }
    return (
      <PlusCircleOutlined
        onClick={() => {
          this.setState({ addPriceVisible: true });
        }}
      />
    );
  };

  renderPrices = () => {
    const { prices } = this.state;
    return prices.map((price) => this.renderPrice(price));
  };

  renderPrice = (price) => (
    <Row key={price.id}>
      <Col span={5}>
        { moment(price.time).format('YYYY-MM-DD') }
      </Col>
      <Col span={6}>
        <div style={{ float: 'right' }}>
          { Number(price.value).toFixed(4) }
        </div>
      </Col>
      <Col span={1} />
      <Col span={11}>
        { `${price.currency_id} / ${price.commodity_id}` }
      </Col>
      <Col span={1}>
        <Popconfirm
          placement="bottom"
          title="Delete price?"
          onConfirm={() => { this.destroyPrice(price.id); }}
        >
          <MinusCircleOutlined />
        </Popconfirm>
      </Col>
    </Row>
  );

  render() {
    const {
      params: { bookId },
    } = this.props;

    const { error, prices } = this.state;
    if (prices == null) {
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
        { this.renderAddPrice() }
        <br />
        { this.renderPrices() }
      </div>
    );
  }
}
IndexPrice.propTypes = {
  location: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
  params: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <IndexPrice
      location={useLocation()}
      params={useParams()}
      navigate={useNavigate()}
    />
  );
}
