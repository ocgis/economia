import moment from 'moment';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  AutoComplete, Button, Col, DatePicker, Input, Popconfirm, Row, Select,
} from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import ShowTransactionBase from '../common/ShowTransactionBase';
import BookMenu from './BookMenu';

const { Option } = Select;

class ShowTransaction extends ShowTransactionBase {
  renderQuantity = (index) => {
    const { accounts, splits, transaction } = this.state;
    const split = splits[index];

    if (this.commodityMatchesCurrency(split, transaction, accounts)) {
      return null;
    }
    return (
      <>
        <Col span={4}>
          <Input
            value={split.quantity_to}
            placeholder="quantity to"
            bordered={false}
            onChange={(event) => {
              const { splits: oldSplits } = this.state;
              const newSplits = [...oldSplits];
              newSplits[index].quantity_to = event.target.value;
              this.setState({ splits: newSplits });
            }}
            onBlur={() => {
              const { splits: oldSplits } = this.state;
              let newSplits = [...oldSplits];

              newSplits = this.constructor.calculateStateValueQuantity(
                newSplits,
                transaction,
                accounts,
              );
              newSplits = this.constructor.calculateStateFromTo(newSplits);
              this.submitTransaction(transaction, newSplits);
            }}
            onKeyDown={this.onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Col>
        <Col span={4}>
          <Input
            value={split.quantity_from}
            placeholder="quantity from"
            bordered={false}
            onChange={(event) => {
              const { splits: oldSplits } = this.state;
              const newSplits = [...oldSplits];
              newSplits[index].quantity_from = event.target.value;
              this.setState({ splits: newSplits });
            }}
            onBlur={() => {
              const { splits: oldSplits } = this.state;
              let newSplits = [...oldSplits];

              newSplits = this.constructor.calculateStateValueQuantity(
                newSplits,
                transaction,
                accounts,
              );
              newSplits = this.constructor.calculateStateFromTo(newSplits);
              this.submitTransaction(transaction, newSplits);
            }}
            onKeyDown={this.onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Col>
      </>
    );
  };

  renderSplit = (index) => {
    const { accounts, descriptionOptions, splits } = this.state;
    const split = splits[index];
    const options = Object.keys(accounts).map((t) => ({ value: accounts[t].full_name }));
    const base = (
      <React.Fragment key={index}>
        <Row key={`account${index}`}>
          <Col span={13}>
            <AutoComplete
              value={split._shown_account}
              bordered={false}
              style={{ width: '40ch' }}
              options={options}
              placeholder="välj konto"
              filterOption={(inputValue, option) => (
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              )}
              onBlur={() => {
                const { splits: oldSplits, transaction } = this.state;
                let newSplits = [...oldSplits];

                newSplits = this.constructor.calculateStateShownAccount(newSplits, accounts);
                this.submitTransaction(transaction, newSplits);
              }}
              onChange={(value) => {
                const { account_ids, splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];

                newSplits[index]._shown_account = value;
                const newId = account_ids[value];
                if (newId != null) {
                  newSplits[index].account_id = newId;
                  this.debounceSubmit();
                }
                this.setState({ splits: newSplits });
              }}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={1}>
            <Select
              defaultValue={split.reconciled_state}
              bordered={false}
              onBlur={() => {
                const { splits: newSplits, transaction } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onChange={(value) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];

                newSplits[index].reconciled_state = value;
                this.setState({ splits: newSplits });
                this.debounceSubmit();
              }}
            >
              <Option value="n">n</Option>
              <Option value="c">c</Option>
              <Option value="y">y</Option>
            </Select>
          </Col>
          <Col span={1}>
            <ThunderboltOutlined onClick={this.balanceSplitHandler(index)} />
          </Col>
          <Col span={4}>
            <Input
              value={split.value_to}
              placeholder="value to"
              bordered={false}
              onChange={(event) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];
                newSplits[index].value_to = event.target.value;
                this.setState({ splits: newSplits });
              }}
              onBlur={() => {
                const { splits: oldSplits, transaction } = this.state;
                let newSplits = [...oldSplits];

                newSplits[index].value_to = this.constructor.evaluateField(
                  newSplits[index].value_to,
                );
                newSplits = this.constructor.calculateStateValueQuantity(
                  newSplits,
                  transaction,
                  accounts,
                );
                newSplits = this.constructor.calculateStateFromTo(newSplits);
                this.submitTransaction(transaction, newSplits);
              }}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={4}>
            <Input
              value={split.value_from}
              placeholder="value from"
              bordered={false}
              onChange={(event) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];
                newSplits[index].value_from = event.target.value;
                this.setState({ splits: newSplits });
              }}
              onBlur={() => {
                const { splits: oldSplits, transaction } = this.state;
                let newSplits = [...oldSplits];

                newSplits[index].value_from = this.constructor.evaluateField(
                  newSplits[index].value_from,
                );
                newSplits = this.constructor.calculateStateValueQuantity(
                  newSplits,
                  transaction,
                  accounts,
                );
                newSplits = this.constructor.calculateStateFromTo(newSplits);
                this.submitTransaction(transaction, newSplits);
              }}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={1}>
            <MinusCircleOutlined onClick={this.removeSplitHandler(index)} />
          </Col>
        </Row>
        <Row key={`description${index}`}>
          <Col span={15}>
            <AutoComplete
              value={split.memo}
              placeholder="memo"
              bordered={false}
              style={{ width: '35ch' }}
              options={descriptionOptions}
              onChange={(value) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];
                newSplits[index].memo = value;
                this.setState({ splits: newSplits });
                this.debounceSubmit();
              }}
              onBlur={() => {
                const { splits: newSplits, transaction } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onSearch={(search) => this.searchSplitMemos(search)}
              onFocus={(event) => {
                event.target.select();
                this.searchSplitMemos(event.target.value);
              }}
              onSelect={(value, object) => {
                this.searchSplitMemos(value);
                this.copySplit(index, object.key);
              }}
            />
          </Col>
          { this.renderQuantity(index) }
        </Row>
      </React.Fragment>
    );

    return (
      <b key={`account${index}`}>
        {base}
      </b>
    );
  };

  renderSplits = () => {
    const { splits } = this.state;
    const splitsElements = [];

    for (let i = 0; i < splits.length; i += 1) {
      splitsElements.push(this.renderSplit(i));
    }
    return (
      <div>
        { splitsElements }
      </div>
    );
  };

  render() {
    const addSplitHandler = () => {
      const { state } = this;
      const splits = [...state.splits];
      splits.push({
        account_id: null,
        _shown_account: '',
        action: '',
        etransaction_id: state.transaction.id,
        id: null,
        memo: '',
        quantity: 0,
        reconcile_date: null,
        reconciled_state: 'n',
        value: 0,
      });
      this.submitTransaction(state.transaction, splits);
    };

    const {
      params: { bookId },
      navigate,
    } = this.props;
    const { descriptionOptions, error, transaction } = this.state;

    if (transaction == null) {
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
        <hr />
        <Row>
          <Col span={4}>
            <DatePicker
              value={moment(transaction.date_posted)}
              bordered={false}
              onBlur={() => {
                const { splits: newSplits } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onChange={(value) => {
                this.setState((prevState) => ({
                  transaction: {
                    ...prevState.transaction,
                    date_posted: value.toISOString(),
                  },
                }));
                this.debounceSubmit();
              }}
              onKeyDown={this.onKeyDownHandler}
              suffixIcon={null}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={3}>
            <Input
              value={transaction.num}
              placeholder="number"
              bordered={false}
              onBlur={() => {
                const { splits: newSplits } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onChange={(event) => {
                this.setState((prevState) => ({
                  transaction: {
                    ...prevState.transaction,
                    num: event.target.value,
                  },
                }));
                this.debounceSubmit();
              }}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Col>
          <Col span={12}>
            <AutoComplete
              value={transaction.description || undefined}
              bordered={false}
              style={{ width: '35ch' }}
              options={descriptionOptions}
              placeholder="description"
              onChange={(value) => {
                this.setState((prevState) => ({
                  transaction: {
                    ...prevState.transaction,
                    description: value,
                  },
                }));
                this.debounceSubmit();
              }}
              onBlur={() => {
                const { splits: newSplits } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onSearch={(search) => this.searchAccountDescriptions(search)}
              onFocus={(event) => {
                event.target.select();
                this.searchAccountDescriptions(event.target.value);
              }}
              onSelect={(value, object) => {
                this.searchAccountDescriptions(value);
                this.copyTransaction(object.key);
              }}
            />
          </Col>
          <Col span={5}>
            {`${transaction.currency_space} ${transaction.currency_id}`}
          </Col>
        </Row>
        { this.renderSplits() }
        <PlusCircleOutlined onClick={addSplitHandler} />
        <hr />
        <Button onClick={() => navigate(-1)}>Back</Button>
        <Popconfirm
          placement="bottom"
          title="Delete transaction?"
          onConfirm={this.destroyTransaction}
        >
          <Button>Delete</Button>
        </Popconfirm>
      </div>
    );
  }
}
ShowTransaction.propTypes = {
  params: PropTypes.shape().isRequired,
  navigate: PropTypes.func.isRequired,
};

export default function wrapper() {
  return (
    <ShowTransaction
      navigate={useNavigate()}
      params={useParams()}
    />
  );
}
