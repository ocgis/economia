import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Link, useLocation, useParams,
} from 'react-router-dom';
import { Button, Popconfirm, Table } from 'antd';
import BookMenu from './BookMenu';

class IndexReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reports: null,
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

  destroyReport = (reportId) => {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .delete(`/api/v1/books/${bookId}/reports/${reportId}`)
      .then((response) => {
        this.setState({ reports: response.data.reports });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          this.setState({ error: `${error}` });
        }
      });
  };

  loadData() {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/reports`)
      .then((response) => {
        this.setState({ reports: response.data.reports });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          this.setState({ error: `${error}` });
        }
      });
  }

  render() {
    const {
      params: { bookId },
    } = this.props;
    const { error, reports } = this.state;

    if (reports == null) {
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
        title: 'Name',
        key: 'name',
        render: (t) => (
          <Link to={`/books/${bookId}/reports/${t.id}`}>{t.name}</Link>
        ),
      },
      {
        title: 'Delete',
        key: 'delete',
        render: (t) => (
          <Popconfirm
            placement="bottom"
            title={`Delete ${t.name}?`}
            onConfirm={() => { this.destroyReport(t.id); }}
          >
            <Button>Delete</Button>
          </Popconfirm>
        ),
      },
      {
        title: 'Id',
        key: 'id',
        render: (t) => (
          <Link to={`/books/${bookId}/reports/${t.id}`}>{t.id}</Link>
        ),
      },
    ];

    const { reports: data } = this.state;
    return (
      <div>
        <BookMenu bookId={bookId} />
        <Table id="reportsTable" rowKey="id" columns={columns} dataSource={data} pagination={false} />
      </div>
    );
  }
}
IndexReport.propTypes = {
  params: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <IndexReport
      params={useParams()}
      location={useLocation()}
    />
  );
}
