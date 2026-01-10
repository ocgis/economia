import axios from 'axios';
import moment from 'moment';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button, CalendarPicker, Dialog, Grid, Input,
} from 'antd-mobile/2x';
import 'antd-mobile/2x/es/global';
import { AddCircleOutline, CollectMoneyOutline, MinusCircleOutline } from 'antd-mobile-icons';
import { debounce, throttle } from 'throttle-debounce';
import BookMenu from './BookMenu';
import {
  calculateStateFromTo,
  calculateStateShownAccount,
  calculateStateValueQuantity,
  commodityMatchesCurrency,
  evaluateField,
} from '../common/Common';
import MobileAutoComplete from './MobileAutoComplete';

const onKeyDownHandler = (event) => {
  switch (event.keyCode) {
    case 38: /* Up arrow */
      {
        const td = event.target.parentElement;
        const tr = td.parentElement;
        const columnIndex = Array.prototype.indexOf.call(td.parentElement.children, td);
        const prevTr = tr.previousSibling;
        if (prevTr != null) {
          const prevTd = prevTr.children[columnIndex];
          const prevInput = prevTd.children[0];
          prevInput.focus();
          prevInput.select();
        }
      }
      event.stopPropagation();
      break;

    case 40: /* Down arrow */
      {
        const td = event.target.parentElement;
        const tr = td.parentElement;
        const columnIndex = Array.prototype.indexOf.call(td.parentElement.children, td);
        const nextTr = tr.nextSibling;
        if (nextTr != null) {
          const nextTd = nextTr.children[columnIndex];
          const nextInput = nextTd.children[0];
          nextInput.focus();
          nextInput.select();
        }
      }
      event.stopPropagation();
      break;

    default:
      // Do nothing
  }
};

class ShowTransaction extends React.Component {
  searchAccountDescriptions = throttle(500, (searchString) => {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    const encodedSearch = encodeURIComponent(searchString);
    axios
      .get(`/api/v1/books/${bookId}/etransactions/search?query=${encodedSearch}`)
      .then((response) => {
        this.setState({
          descriptionOptions: response.data.result,
        });
      })
      .catch((error) => {
        console.log('ERROR:', error); // eslint-disable-line no-console
      });
  });

  searchSplitMemos = throttle(500, (searchString) => {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    const encodedSearch = encodeURIComponent(searchString);
    axios
      .get(`/api/v1/books/${bookId}/splits/search?query=${encodedSearch}`)
      .then((response) => {
        this.setState({
          descriptionOptions: response.data.result,
        });
      })
      .catch((error) => {
        console.log('ERROR:', error); // eslint-disable-line no-console
      });
  });

  debounceSubmit = debounce(
    500,
    () => {
      const { splits, transaction } = this.state;
      const noSetStateOnResponse = false;
      this.submitTransaction(transaction, splits, noSetStateOnResponse);
    },
  );

  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      splits: [],
      descriptionOptions: [],
      datePickerVisible: false,
    };
  }

  componentDidMount() {
    this.loadTransaction();
  }

  componentDidUpdate(prevProps) {
    const { params: { bookId, id } } = this.props;
    if ((prevProps.params.bookId !== bookId)
        || (prevProps.params.id !== id)) {
      this.loadTransaction();
    }
  }

  setStateFromResponse(response) {
    const {
      accounts, error, splits, transaction,
    } = response.data;
    if (error != null) {
      console.log('ERROR:', error); // eslint-disable-line no-console
    }
    const newState = {
      transaction,
      splits: splits.sort((a, b) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return aDate - bDate;
      }),
      accounts,
      account_ids: {},
    };
    Object.keys(newState.accounts).forEach((t) => {
      newState.account_ids[newState.accounts[t].full_name] = t;
    });
    newState.splits = calculateStateShownAccount(newState.splits, newState.accounts);
    newState.splits = calculateStateFromTo(newState.splits);
    this.setState(newState);
  }

  destroyTransaction = () => {
    const {
      params: { bookId },
      navigate,
    } = this.props;
    const { transaction } = this.state;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .delete(`/api/v1/books/${bookId}/etransactions/${transaction.id}`)
      .then(() => {
        navigate(-1);
      })
      .catch((error) => {
        if (error.response) {
          this.setState({ error: `${error.response.status} ${error.response.statusText}` });
        } else {
          console.log('ERROR:', error); // eslint-disable-line no-console
          this.setState({ error });
        }
      });
  };

  removeSplitHandler = (index) => (() => {
    const { splits, transaction } = this.state;
    const newSplits = [...splits];
    newSplits[index]._destroy = true;
    this.submitTransaction(transaction, newSplits);
  });

  balanceSplitHandler = (index) => (() => {
    const { splits, transaction } = this.state;
    let newSplits = [...splits];
    let newValue = newSplits[index].value;
    newSplits.forEach((split) => {
      newValue -= split.value;
    });
    newSplits[index].value = newValue;
    newSplits[index].quantity = newValue;
    newSplits = calculateStateFromTo(newSplits);
    this.submitTransaction(transaction, newSplits);
  });

  loadTransaction() {
    const {
      params: { bookId, id },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/etransactions/${id}`)
      .then((response) => this.setStateFromResponse(response))
      .catch((error) => {
        if (error.response) {
          this.setState({ error: error.response.data.error });
        } else {
          this.setState({ error });
          console.log('ERROR:', error); // eslint-disable-line no-console
        }
      });
  }

  copySplit(split_index, split_id) {
    const handleResponse = (response) => {
      const { accounts, splits, transaction } = this.state;
      const {
        created_at, updated_at, etransaction_id, id, ...newSplit
      } = response.data.split;
      let updatedSplits = [...splits];

      updatedSplits[split_index] = { ...updatedSplits[split_index], ...newSplit };

      updatedSplits = calculateStateShownAccount(updatedSplits, accounts);
      updatedSplits = calculateStateFromTo(updatedSplits);
      this.submitTransaction(transaction, updatedSplits);
    };

    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/splits/${split_id}`)
      .then((response) => handleResponse(response))
      .catch((error) => {
        if (error.response) {
          this.setState({ error: error.response.data.error });
        } else {
          console.log('ERROR:', error); // eslint-disable-line no-console
          this.setState({ error });
        }
      });
  }

  copyTransaction(id) {
    const {
      params: { bookId },
    } = this.props;

    const handleResponse = (response) => {
      const { accounts, splits, transaction } = this.state;
      const {
        created_at: trn_ca, updated_at: trn_ua, date_posted, id: trn_id, ...newTransaction
      } = response.data.transaction;
      const updatedTransaction = { ...transaction, ...newTransaction };

      const newSplits = response.data.splits;
      let updatedSplits = [...splits];
      // Overwrite existing splits with new splits
      for (let i = 0; i < Math.min(updatedSplits.length, newSplits.length); i += 1) {
        const {
          created_at, updated_at, etransaction_id, id: spl_id, ...newSplit
        } = newSplits[i];
        updatedSplits[i] = { ...updatedSplits[i], ...newSplit };
      }
      // Append new splits
      for (let i = updatedSplits.length; i < newSplits.length; i += 1) {
        const {
          created_at, updated_at, etransaction_id, id: spl_id, ...newSplit
        } = newSplits[i];
        updatedSplits.push(newSplit);
      }
      // Delete existing splits
      for (let i = newSplits.length; i < updatedSplits.length; i += 1) {
        updatedSplits[i]._destroy = true;
      }
      updatedSplits = calculateStateShownAccount(updatedSplits, accounts);
      updatedSplits = calculateStateFromTo(updatedSplits);
      this.submitTransaction(updatedTransaction, updatedSplits);
    };

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    axios
      .get(`/api/v1/books/${bookId}/etransactions/${id}`)
      .then((response) => handleResponse(response))
      .catch((error) => {
        if (error.response) {
          this.setState({ error: error.response.data.error });
        } else {
          console.log('ERROR:', error); // eslint-disable-line no-console
          this.setState({ error });
        }
      });
  }

  submitTransaction(newTransaction, newSplits, setStateOnResponse = true) {
    const {
      params: { bookId },
    } = this.props;

    const csrfToken = document.querySelector('[name=csrf-token]').content;
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    const { created_at, updated_at, ...transaction } = newTransaction;
    transaction.splits_attributes = newSplits.map((newSplit) => {
      const {
        created_at: ca,
        updated_at: ua,
        _shown_account,
        value_from,
        value_to,
        quantity_from,
        quantity_to,
        ...split
      } = newSplit;
      return split;
    });

    if (transaction.id == null) {
      axios
        .post(`/api/v1/books/${bookId}/etransactions`, { transaction })
        .then((response) => {
          if (setStateOnResponse) {
            this.setStateFromResponse(response);
          }
        })
        .catch((error) => console.log('ERROR:', error)); // eslint-disable-line no-console
    } else {
      axios
        .patch(`/api/v1/books/${bookId}/etransactions/${transaction.id}`, { transaction })
        .then((response) => {
          if (setStateOnResponse) {
            this.setStateFromResponse(response);
          }
        })
        .catch((error) => console.log('ERROR:', error)); // eslint-disable-line no-console
    }
  }

  renderQuantity = (index) => {
    const { splits, transaction, accounts } = this.state;
    const split = splits[index];

    if (commodityMatchesCurrency(split, transaction, accounts)) {
      return null;
    }
    return (
      <>
        <Grid.Item span={4}>
          <Input
            value={split.quantity_to}
            placeholder="quantity to"
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

              newSplits = calculateStateValueQuantity(newSplits, transaction, accounts);
              newSplits = calculateStateFromTo(newSplits);
              this.submitTransaction(transaction, newSplits);
            }}
            onKeyDown={onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Grid.Item>
        <Grid.Item span={4}>
          <Input
            value={split.quantity_from}
            placeholder="quantity from"
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

              newSplits = calculateStateValueQuantity(newSplits, transaction, accounts);
              newSplits = calculateStateFromTo(newSplits);
              this.submitTransaction(transaction, newSplits);
            }}
            onKeyDown={onKeyDownHandler}
            onFocus={(event) => event.target.select()}
          />
        </Grid.Item>
      </>
    );
  };

  renderSplit = (index) => {
    const { accounts, descriptionOptions, splits } = this.state;
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
                const { splits: oldSplits, transaction } = this.state;
                let newSplits = [...oldSplits];

                newSplits = calculateStateShownAccount(newSplits, accounts);
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
                const { splits: newSplits, transaction } = this.state;
                this.submitTransaction(transaction, newSplits);
              }}
              onChange={(event) => {
                const { splits: oldSplits, transaction } = this.state;
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
            <CollectMoneyOutline onClick={this.balanceSplitHandler(index)} />
          </Grid.Item>
          <Grid.Item span={4} key="to">
            <Input
              value={split.value_to}
              placeholder="value to"
              bordered="false"
              onChange={(value) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];
                newSplits[index].value_to = value;
                this.setState({ splits: newSplits });
              }}
              onBlur={() => {
                const { splits: oldSplits, transaction } = this.state;
                let newSplits = [...oldSplits];

                newSplits[index].value_to = evaluateField(newSplits[index].value_to);
                newSplits = calculateStateValueQuantity(newSplits, transaction, accounts);
                newSplits = calculateStateFromTo(newSplits);
                this.submitTransaction(transaction, newSplits);
              }}
              onKeyDown={onKeyDownHandler}
              onFocus={(event) => event.target.select()}
            />
          </Grid.Item>
          <Grid.Item span={4} key="from">
            <Input
              value={split.value_from}
              placeholder="value from"
              bordered="false"
              onChange={(value) => {
                const { splits: oldSplits } = this.state;
                const newSplits = [...oldSplits];
                newSplits[index].value_from = value;
                this.setState({ splits: newSplits });
              }}
              onBlur={() => {
                const { splits: oldSplits, transaction } = this.state;
                let newSplits = [...oldSplits];

                newSplits[index].value_from = evaluateField(newSplits[index].value_from);
                newSplits = calculateStateValueQuantity(newSplits, transaction, accounts);
                newSplits = calculateStateFromTo(newSplits);
                this.submitTransaction(transaction, newSplits);
              }}
              onKeyDown={onKeyDownHandler}
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
              onKeyDown={onKeyDownHandler}
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
            {`${transaction.currency_space} ${transaction.currency_id}`}
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
