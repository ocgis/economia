import axios from "axios";
import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Table } from "antd";
import { BookMenu } from "./Book";


class IndexReport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      reports: null,
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

    axios.get(`/api/v1/books/${bookId}/reports`)
         .then(response => {
           this.setState({ reports: response.data.reports });
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


  render() {
    const {
      match: {
        params: { bookId }
      }
    } = this.props;
    const reports = this.state.reports;
    if (reports == null) {

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
          title: 'Name',
          key: 'name',
          render: (t) => {
            return (
              <Link to={`/books/${bookId}/reports/${t.id}`}>{t.name}</Link>
            );
          }
        },
        {
          title: 'Id',
          key: 'id',
          render: (t) => {
            return (
              <Link to={`/books/${bookId}/reports/${t.id}`}>{t.id}</Link>
            );
          }
        }
      ];

      let data = this.state.reports;
      return (
        <div>
          <BookMenu bookId={bookId} />
          <Table id="reportsTable" rowKey='id' columns={columns} dataSource={data} pagination={false} />
        </div>
      );
    }
  }
}
IndexReport.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
};


class ShowReport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: null,
      year: null,
      month_numbers: null,
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
        params: { bookId, id }
      }
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios.get(`/api/v1/books/${bookId}/reports/${id}${window.location.search}`)
         .then(response => {
           this.setState({
             rows: response.data.rows,
             year: response.data.year,
             month_numbers: response.data.month_numbers
           });
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


  render() {
    const {
      match: {
        params: { bookId, id }
      }
    } = this.props;

    const rows = this.state.rows;
    if (rows == null) {
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
      let header = this.state.rows[0];
      let linkBase = (t) => {
        var include = '';
        if (t.included_accounts != null) {
          include = '&include=' + t.included_accounts.join(',');
        }
        return `/books/${bookId}/accounts/${t.account_id}?year=${this.state.year}${include}`
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
                </Link>);
            } else {
              return t.title;
            }
          }
        },
        {
          title: header.incoming,
          key: 'incoming',
          dataIndex: 'incoming'
        },
        ...header.months.map((o, index) => {
          return {
            title: o,
            key: `month_${index}`,
            render: (t) => {
              if (t.account_id != null) {
                return (
                  <Link to={`${linkBase(t)}&month=${this.state.month_numbers[index]}`}>
                    {t.months[index]}
                  </Link>);
              } else {
                return t.months[index];
              }
            }
          };
        }),
        {
          title: header.average,
          key: 'average',
          dataIndex: 'average'
        },
        {
          title: header.sum,
          key: 'sum',
          dataIndex: 'sum'
        }
      ];

      let data = this.state.rows.slice(1);
      return (
        <div>
          <BookMenu bookId={bookId} />
          <Link to={`/books/${bookId}/reports/${id}?year=${this.state.year-1}`}>&lt;</Link>
          <Link to={`/books/${bookId}/reports/${id}?year=${this.state.year+1}`}>&gt;</Link>
          <Table id="reportsTable" rowKey='title' columns={columns} dataSource={data} pagination={false} />
        </div>
      );
    }
  }
}
ShowReport.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
};


export { IndexReport, ShowReport };
