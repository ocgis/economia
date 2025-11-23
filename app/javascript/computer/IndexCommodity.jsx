import axios from 'axios';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import AddCommodity from './AddCommodity';
import BookMenu from './BookMenu';

class IndexCommodity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  loadData() {
    const {
      navigate,
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/commodities`)
      .then((response) => {
        const { commodities } = response.data;

        this.setState({ commodities });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log('Push /');
          navigate('/');
        }
      });
  }

  renderAddCommodity = () => {
    const {
      params: { bookId },
    } = this.props;

    const { addCommodityVisible } = this.state;

    if (addCommodityVisible) {
      return (
        <AddCommodity
          onSubmit={(commodity) => {
            this.setState((prevState) => ({
              commodities: [...prevState.commodities, commodity],
              addCommodityVisible: false,
            }));
          }}
          bookId={bookId}
        />
      );
    }
    return (
      <PlusCircleOutlined
        onClick={() => {
          this.setState({
            addCommodityVisible: true,
          });
        }}
      />
    );
  };

  render() {
    const {
      params: { bookId },
    } = this.props;

    const { commodities, error } = this.state;

    if (commodities == null) {
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
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id_',
      },
      {
        title: 'Space',
        dataIndex: 'space',
      },
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Xcode',
        dataIndex: 'xcode',
      },
      {
        title: 'Fraction',
        dataIndex: 'fraction',
      },
      {
        title: 'Get quotes',
        dataIndex: 'get_quotes',
      },
      {
        title: 'Quote source',
        dataIndex: 'quote_source',
      },
      {
        title: 'Quote TZ',
        dataIndex: 'quote_tz',
      },
    ];

    return (
      <div>
        <BookMenu bookId={bookId} />
        {this.renderAddCommodity()}
        <Table
          id="commoditiesTable"
          rowKey={(record) => `${record.id_},${record.space}`}
          columns={columns}
          dataSource={commodities}
          pagination={false}
        />
      </div>
    );
  }
}
IndexCommodity.propTypes = {
  location: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
  params: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <IndexCommodity
      location={useLocation()}
      params={useParams()}
      navigate={useNavigate()}
    />
  );
}
