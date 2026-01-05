import * as math from 'mathjs';

const calculateStateFromTo = (splits) => (
  splits.map((split) => ({
    ...split,
    value_from: split.value < 0 ? Number(-split.value).toFixed(2) : '',
    value_to: split.value > 0 ? Number(split.value).toFixed(2) : '',
    quantity_from: split.quantity < 0 ? Number(-split.quantity).toFixed(2) : '',
    quantity_to: split.quantity > 0 ? Number(split.quantity).toFixed(2) : '',
  }))
);

const commodityMatchesCurrency = (split, transaction, accounts) => {
  const account = accounts[split.account_id];
  if (account != null) {
    return ((account.commodity_space === transaction.currency_space)
         && (account.commodity_id === transaction.currency_id));
  }
  return true;
};

const calculateStateValueQuantity = (splits, transaction, accounts) => (
  splits.map((split) => {
    const newSplit = { ...split };
    const value_to = split.value_to === '' ? 0 : split.value_to;
    const value_from = split.value_from === '' ? 0 : split.value_from;
    newSplit.value = value_to - value_from;
    if (commodityMatchesCurrency(split, transaction, accounts)) {
      newSplit.quantity = split.value;
    } else {
      const quantity_to = split.quantity_to === '' ? 0 : split.quantity_to;
      const quantity_from = split.quantity_from === '' ? 0 : split.quantity_from;
      newSplit.quantity = quantity_to - quantity_from;
    }
    return newSplit;
  })
);

const calculateStateShownAccount = (splits, accounts) => (
  splits.map((split) => ({
    ...split,
    _shown_account: split.account_id ? accounts[split.account_id].full_name : undefined,
  }))
);

const evaluateField = (value) => {
  if (value === '') {
    return '';
  }
  const result = math.evaluate(value).toFixed(2);
  return result == null ? '' : result;
};

export {
  calculateStateFromTo,
  calculateStateValueQuantity,
  calculateStateShownAccount,
  commodityMatchesCurrency,
  evaluateField,
};
