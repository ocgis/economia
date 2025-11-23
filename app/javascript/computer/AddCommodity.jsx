import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Col, Input, Row,
} from 'antd';

class AddCommodity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commodity: {
        id_: '',
        space: '',
        fraction: 100,
      },
    };
  }

  createCommodity = (onCreated) => {
    const { bookId } = this.props;
    const { commodity } = this.state;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .post(`/api/v1/books/${bookId}/commodities`, { commodity })
      .then((response) => {
        onCreated(response.data.commodity);
      })
      .catch((error) => console.log(error));
  };

  render() {
    const { onSubmit } = this.props;
    const { commodity } = this.state;

    return (
      <div>
        <Row>
          <Col span={4}>
            <Input
              defaultValue={commodity.id_}
              placeholder="id"
              bordered={false}
              onChange={(event) => {
                const id_ = event.target.value;
                this.setState((prevState) => ({
                  commodity: {
                    ...prevState.commodity,
                    id_,
                  },
                }));
              }}
            />
          </Col>
          <Col span={4}>
            <Input
              defaultValue={commodity.space}
              placeholder="space"
              bordered={false}
              onChange={(event) => {
                const space = event.target.value;
                this.setState((prevState) => ({
                  commodity: {
                    ...prevState.commodity,
                    space,
                  },
                }));
              }}
            />
          </Col>
          <Col span={4}>
            <Input
              defaultValue={commodity.fraction}
              placeholder="fraction"
              bordered={false}
              onChange={(event) => {
                const fraction = event.target.value;
                this.setState((prevState) => ({
                  commodity: {
                    ...prevState.commodity,
                    fraction,
                  },
                }));
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={2}>
            <Button
              onClick={() => {
                this.createCommodity(onSubmit);
              }}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}
AddCommodity.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  bookId: PropTypes.string.isRequired,
};

export default AddCommodity;
