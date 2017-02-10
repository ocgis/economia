require 'test_helper'

class EtransactionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @etransaction = etransactions(:one)
  end

  test "should get index" do
    get etransactions_url
    assert_response :success
  end

  test "should get new" do
    get new_etransaction_url
    assert_response :success
  end

  test "should create etransaction" do
    assert_difference('Etransaction.count') do
      post etransactions_url, params: { etransaction: { currency_id_: @etransaction.currency_id_, currency_space: @etransaction.currency_space, date_entered_date: @etransaction.date_entered_date, date_entered_ns: @etransaction.date_entered_ns, date_posted_date: @etransaction.date_posted_date, date_posted_ns: @etransaction.date_posted_ns, description: @etransaction.description, id_: @etransaction.id_, num: @etransaction.num } }
    end

    assert_redirected_to etransaction_url(Etransaction.last)
  end

  test "should show etransaction" do
    get etransaction_url(@etransaction)
    assert_response :success
  end

  test "should get edit" do
    get edit_etransaction_url(@etransaction)
    assert_response :success
  end

  test "should update etransaction" do
    patch etransaction_url(@etransaction), params: { etransaction: { currency_id_: @etransaction.currency_id_, currency_space: @etransaction.currency_space, date_entered_date: @etransaction.date_entered_date, date_entered_ns: @etransaction.date_entered_ns, date_posted_date: @etransaction.date_posted_date, date_posted_ns: @etransaction.date_posted_ns, description: @etransaction.description, id_: @etransaction.id_, num: @etransaction.num } }
    assert_redirected_to etransaction_url(@etransaction)
  end

  test "should destroy etransaction" do
    assert_difference('Etransaction.count', -1) do
      delete etransaction_url(@etransaction)
    end

    assert_redirected_to etransactions_url
  end
end
