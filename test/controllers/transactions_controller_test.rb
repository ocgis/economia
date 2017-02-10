require 'test_helper'

class TransactionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @transaction = transactions(:one)
  end

  test "should get index" do
    get transactions_url
    assert_response :success
  end

  test "should get new" do
    get new_transaction_url
    assert_response :success
  end

  test "should create transaction" do
    assert_difference('Transaction.count') do
      post transactions_url, params: { transaction: { currency_id_: @transaction.currency_id_, currency_space: @transaction.currency_space, date_entered_date: @transaction.date_entered_date, date_entered_ns: @transaction.date_entered_ns, date_posted_date: @transaction.date_posted_date, date_posted_ns: @transaction.date_posted_ns, description: @transaction.description, id_: @transaction.id_, num: @transaction.num } }
    end

    assert_redirected_to transaction_url(Transaction.last)
  end

  test "should show transaction" do
    get transaction_url(@transaction)
    assert_response :success
  end

  test "should get edit" do
    get edit_transaction_url(@transaction)
    assert_response :success
  end

  test "should update transaction" do
    patch transaction_url(@transaction), params: { transaction: { currency_id_: @transaction.currency_id_, currency_space: @transaction.currency_space, date_entered_date: @transaction.date_entered_date, date_entered_ns: @transaction.date_entered_ns, date_posted_date: @transaction.date_posted_date, date_posted_ns: @transaction.date_posted_ns, description: @transaction.description, id_: @transaction.id_, num: @transaction.num } }
    assert_redirected_to transaction_url(@transaction)
  end

  test "should destroy transaction" do
    assert_difference('Transaction.count', -1) do
      delete transaction_url(@transaction)
    end

    assert_redirected_to transactions_url
  end
end
