import axios from 'axios';
import React from 'react';
import { Button, Input } from 'antd';
import { TopMenu } from './TopMenu';

class ImportBook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      description: '',
      selectedFiles: null,
    };
  }

  onDescriptionChange = (event) => {
    this.setState({ description: event.target.value });
  };

  onChangeHandler = (event) => {
    this.setState({ selectedFiles: event.target.files });
  };

  onClickHandler = () => {
    const { description, selectedFiles: files } = this.state;
    const data = new FormData();
    for (let i = 0; i < files.length; i += 1) {
      data.append('files[][file]', files[i]);
      data.append('files[][last_modified]', files[i].lastModified);
    }
    data.append('description', description);

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    axios
      .post('/api/v1/books/import', data, {})
      .then(() => {
        window.location.href = '/';
      });
  };

  render() {
    return (
      <div>
        <TopMenu />
        <Input placeholder="description" onChange={this.onDescriptionChange} />
        <Input type="file" name="file" onChange={this.onChangeHandler} multiple />
        <Button type="button" onClick={this.onClickHandler}>Import</Button>
      </div>
    );
  }
}

export default ImportBook;
