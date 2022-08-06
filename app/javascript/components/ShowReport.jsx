import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Link, useLocation, useNavigate, useParams,
} from 'react-router-dom';
import { Table } from 'antd';
import BookMenu from './BookMenu';

class ShowReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: null,
      year: null,
      month_numbers: null,
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
      params: { bookId, id },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/reports/${id}${window.location.search}`)
      .then((response) => {
        this.setState({
          rows: response.data.rows,
          year: response.data.year,
          month_numbers: response.data.month_numbers,
        });
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

  render() {
    const {
      params: { bookId, id },
    } = this.props;

    const {
      error, month_numbers, rows, year,
    } = this.state;

    if (rows == null) {
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
    const header = rows[0];
    const linkBase = (t) => {
      let include = '';
      if (t.included_accounts != null) {
        include = `&include=${t.included_accounts.join(',')}`;
      }
      return `/books/${bookId}/accounts/${t.account_id}?year=${year}${include}`;
    };

    const columns = [
      {
        title: header.title,
        key: 'title',
        render: (t) => {
          if (t.account_id != null) {
            return (
              <Link to={linkBase(t)}>
                {t.title}
              </Link>
            );
          }
          return t.title;
        },
      },
      {
        title: header.incoming,
        key: 'incoming',
        dataIndex: 'incoming',
      },
      ...header.months.map((o, index) => ({
        title: o,
        key: `month_${index}`,
        render: (t) => {
          if (t.account_id != null) {
            return (
              <Link to={`${linkBase(t)}&month=${month_numbers[index]}`}>
                {t.months[index]}
              </Link>
            );
          }
          return t.months[index];
        },
      })),
      {
        title: header.average,
        key: 'average',
        dataIndex: 'average',
      },
      {
        title: header.sum,
        key: 'sum',
        dataIndex: 'sum',
      },
    ];

    const data = rows.slice(1);
    return (
      <div>
        <BookMenu bookId={bookId} />
        <Link to={`/books/${bookId}/reports/${id}?year=${year - 1}`}>&lt;</Link>
        <Link to={`/books/${bookId}/reports/${id}?year=${year + 1}`}>&gt;</Link>
        <Table id="reportsTable" rowKey="title" columns={columns} dataSource={data} pagination={false} />
      </div>
    );
  }
}
ShowReport.propTypes = {
  params: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
};

export default function wrapper() {
  return (
    <ShowReport
      params={useParams()}
      location={useLocation()}
      navigate={useNavigate()}
    />
  );
}
