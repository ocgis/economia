require 'test_helper'

class AccountsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @account = accounts(:one)
  end

  test "should get index" do
    get accounts_url
    assert_response :success
  end

  test "should get new" do
    get new_account_url
    assert_response :success
  end

  test "should create account" do
    assert_difference('Account.count') do
      post accounts_url, params: { account: { code: @account.code, commodity_id_: @account.commodity_id_, commodity_scu: @account.commodity_scu, commodity_space: @account.commodity_space, description: @account.description, id_: @account.id_, name: @account.name, parent: @account.parent, type_: @account.type_ } }
    end

    assert_redirected_to account_url(Account.last)
  end

  test "should show account" do
    get account_url(@account)
    assert_response :success
  end

  test "should get edit" do
    get edit_account_url(@account)
    assert_response :success
  end

  test "should update account" do
    patch account_url(@account), params: { account: { code: @account.code, commodity_id_: @account.commodity_id_, commodity_scu: @account.commodity_scu, commodity_space: @account.commodity_space, description: @account.description, id_: @account.id_, name: @account.name, parent: @account.parent, type_: @account.type_ } }
    assert_redirected_to account_url(@account)
  end

  test "should destroy account" do
    assert_difference('Account.count', -1) do
      delete account_url(@account)
    end

    assert_redirected_to accounts_url
  end
end
