import moment from 'moment';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button, CalendarPicker, Dialog, Grid, Input,
} from 'antd-mobile/2x';
import 'antd-mobile/2x/es/global';
import { AddCircleOutline, CollectMoneyOutline, MinusCircleOutline } from 'antd-mobile-icons';
import ShowTransactionBase from '../common/ShowTransactionBase';
import BookMenu from './BookMenu';
import MobileAutoComplete from './MobileAutoComplete';

class ShowTransaction extends ShowTransactionBase {
  constructor(props) {
    super(props);
    this.datePickerVisible = false;
  }

  renderQuantity = (index) => {
    const { accounts, splits, transaction } = this.state;
    const split = splits[index];
    const { commodity_id } = accounts[split.account_id] || '';

    if (this.commodityMatchesCurrency(split)) {
      return null;
    }
    return (
      <>
        <Grid.Item span={4}>
          <Input
            value={split.quantity_to}
            placeholder={`${commodity_id} to`}
            bordered="false"
            onChange={(value) => {
              const { splits: oldSplits } = this.state;
              const newSplits = [...oldSplits];
              newSplits[index].quantity_to = value;
              this.setState({ splits: newSplits });
            }}
            onBlur={() => {
              const { splits: oldSplits } = this.state;
              let newSplits = [...oldSplits];

              newSplits = this.calculateStateValueQuantity(newSplits);
              this.submitTransaction(transaction, newSplits);
            }}
            onKeyDown={this.onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Grid.Item>
        <Grid.Item span={4}>
          <Input
            value={split.quantity_from}
            placeholder={`${commodity_id} from`}
            bordered="false"
            onChange={(value) => {
              const { splits: oldSplits } = this.state;
              const newSplits = [...oldSplits];
              newSplits[index].quantity_from = value;
              this.setState({ splits: newSplits });
            }}
            onBlur={() => {
              const { splits: oldSplits } = this.state;
              let newSplits = [...oldSplits];

              newSplits = this.calculateStateValueQuantity(newSplits);
              this.submitTransaction(transaction, newSplits);
            }}
            onKeyDown={this.onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Grid.Item>
      </>
    );
  };

  renderSplit = (index) => {
    const {
      accounts, descriptionOptions, splits, transaction,
    } = this.state;
    const split = splits[index];
    const options = Object.keys(accounts).map((t) => ({ value: accounts[t].full_name }));
    const base = (
      <React.Fragment key={split.id}>
        <Grid key={split.id} columns={24}>
          <Grid.Item span={13} key="account">
            <MobileAutoComplete
              value={split._shown_account}
              bordered="false"
              style={{ width: '40ch' }}
              options={options}
              placeholder="välj konto"
              filterOption={(inputValue, option) => (
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              )}
              onBlur={() => {
                const { splits: oldSplits } = this.state;
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
                }
                this.setState({ splits: newSplits });
              }}
              onFocus={(event) => event.target.select()}
            />
          </Grid.Item>
          <Grid.Item span={1} key="reconciled">
            <select
              value={split.reconciled_state}
              bordered="false"
              onBlur={() => {
                const { splits: newSplits } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onChange={(event) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];

                newSplits[index].reconciled_state = event.target.value;
                this.submitTransaction(transaction, newSplits);
              }}
            >
              <option value="n">n</option>
              <option value="c">c</option>
              <option value="y">y</option>
            </select>
          </Grid.Item>
          <Grid.Item span={1}>
            <CollectMoneyOutline
              onClick={() => setTimeout(() => this.balanceSplitHandler(index)(), 100)}
            />
          </Grid.Item>
          <Grid.Item span={4} key="to">
            <Input
              value={split.value_to}
              placeholder={`${transaction.currency_id} to`}
              bordered="false"
              onChange={(value) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];
                newSplits[index].value_to = value;
                this.setState({ splits: newSplits });
              }}
              onBlur={() => {
                const { splits: oldSplits } = this.state;
                let newSplits = [...oldSplits];

                newSplits[index].value_to = this.constructor.evaluateField(
                  newSplits[index].value_to,
                );
                newSplits = this.calculateStateValueQuantity(newSplits);
                this.setState({ splits: newSplits });
                this.debounceSubmit();
              }}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Grid.Item>
          <Grid.Item span={4} key="from">
            <Input
              value={split.value_from}
              placeholder={`${transaction.currency_id} from`}
              bordered="false"
              onChange={(value) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];
                newSplits[index].value_from = value;
                this.setState({ splits: newSplits });
              }}
              onBlur={() => {
                const { splits: oldSplits } = this.state;
                let newSplits = [...oldSplits];

                newSplits[index].value_from = this.constructor.evaluateField(
                  newSplits[index].value_from,
                );
                newSplits = this.calculateStateValueQuantity(newSplits);
                this.setState({ splits: newSplits });
                this.debounceSubmit();
              }}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Grid.Item>
          <Grid.Item span={1} key="remove">
            <MinusCircleOutline onClick={this.removeSplitHandler(index)} />
          </Grid.Item>
        </Grid>
        <Grid key={`description${index}`} columns={24}>
          <Grid.Item span={15} key="memo">
            <MobileAutoComplete
              value={split.memo}
              placeholder="memo"
              bordered="false"
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
                const { splits: newSplits } = this.state;
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
          </Grid.Item>
          { this.renderQuantity(index) }
        </Grid>
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
    const splitsElements = splits.map((split, index) => this.renderSplit(index));

    return (
      <div>
        { splitsElements }
      </div>
    );
  };

  renderCurrencyOptions = () => {
    const { commodities } = this.state;
    const currencyOptions = [];

    Object.keys(commodities).sort().forEach((k) => {
      const commodity = commodities[k];
      currencyOptions.push((
        <option
          value={k}
          key={k}
        >
          {commodity.id_}
        </option>
      ));
    });
    return currencyOptions;
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
    const {
      datePickerVisible, descriptionOptions, error, splits, transaction,
    } = this.state;

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
        <Grid columns={24}>
          <Grid.Item span={5} onClick={() => this.setState({ datePickerVisible: true })}>
            { moment(transaction.date_posted).format('YYYY-MM-DD') }
            <CalendarPicker
              value={transaction.date_posted}
              visible={datePickerVisible}
              onChange={(date) => {
                const newTransaction = { ...transaction, date_posted: date };
                this.submitTransaction(newTransaction, splits);
                this.setState({ datePickerVisible: false });
              }}
              onClose={() => this.setState({ datePickerVisible: false })}
              onMaskClick={() => this.setState({ datePickerVisible: false })}
              title="Select date"
              weekStartsOn="Monday"
              confirmText="Confirm"
              renderTop={null}
              renderBottom={null}
            />
          </Grid.Item>
          <Grid.Item span={3}>
            <Input
              value={transaction.num == null ? '' : transaction.num}
              placeholder="number"
              bordered="false"
              onBlur={() => {
                const { splits: newSplits } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onChange={(value) => {
                this.setState((prevState) => ({
                  transaction: {
                    ...prevState.transaction,
                    num: value,
                  },
                }));
                this.debounceSubmit();
              }}
              onKeyDown={this.onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Grid.Item>
          <Grid.Item span={11}>
            <MobileAutoComplete
              value={transaction.description || undefined}
              bordered="false"
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
          </Grid.Item>
          <Grid.Item span={5}>
            <select
              defaultValue={`${transaction.currency_id}_${transaction.currency_space}`}
              bordered="false"
              onBlur={() => {
                const { splits: newSplits, transaction: newTransaction } = this.state;
                this.submitTransaction(newTransaction, newSplits);
              }}
              onChange={(event) => {
                const { commodities } = this.state;
                const { target: { value } } = event;
                this.setState((prevState) => ({
                  transaction: {
                    ...prevState.transaction,
                    currency_id: commodities[value].id_,
                    currency_space: commodities[value].space,
                  },
                }));
                this.debounceSubmit();
              }}
            >
              { this.renderCurrencyOptions() }
            </select>
          </Grid.Item>
        </Grid>
        { this.renderSplits() }
        <AddCircleOutline onClick={addSplitHandler} />
        <hr />
        <Button onClick={() => navigate(-1)}>Back</Button>
        <Button
          onClick={() => Dialog.confirm({
            content: 'Delete transaction?',
            cancelText: 'Cancel',
            confirmText: 'Delete',
            onConfirm: () => this.destroyTransaction(),
          })}
        >
          Delete
        </Button>
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
