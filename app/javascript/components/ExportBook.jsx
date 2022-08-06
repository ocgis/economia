import axios from 'axios';
import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import BookMenu from './BookMenu';

class ExportBook extends React.Component {
  exportBook = () => {
    const {
      params: { id },
    } = this.props;

    axios
      .get(`/api/v1/books/${id}/export`, { responseType: 'arraybuffer' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        const cd = response.headers['content-disposition'];
        const s = cd.indexOf('"') + 1;
        const e = cd.lastIndexOf('"');
        a.download = cd.substring(s, e);
        a.click();
      });
  };

  render() {
    const {
      params: { id },
    } = this.props;

    return (
      <div>
        <BookMenu bookId={id} />
        <button type="button" onClick={this.exportBook}>Export in Gnucash format</button>
      </div>
    );
  }
}
ExportBook.propTypes = {
  params: PropTypes.shape().isRequired,
};

export default function wrapper() {
  return (
    <ExportBook
      params={useParams()}
    />
  );
}
