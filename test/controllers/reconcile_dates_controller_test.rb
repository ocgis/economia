require 'test_helper'

class ReconcileDatesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @reconcile_date = reconcile_dates(:one)
  end

  test "should get index" do
    get reconcile_dates_url
    assert_response :success
  end

  test "should get new" do
    get new_reconcile_date_url
    assert_response :success
  end

  test "should create reconcile_date" do
    assert_difference('ReconcileDate.count') do
      post reconcile_dates_url, params: { reconcile_date: { date: @reconcile_date.date } }
    end

    assert_redirected_to reconcile_date_url(ReconcileDate.last)
  end

  test "should show reconcile_date" do
    get reconcile_date_url(@reconcile_date)
    assert_response :success
  end

  test "should get edit" do
    get edit_reconcile_date_url(@reconcile_date)
    assert_response :success
  end

  test "should update reconcile_date" do
    patch reconcile_date_url(@reconcile_date), params: { reconcile_date: { date: @reconcile_date.date } }
    assert_redirected_to reconcile_date_url(@reconcile_date)
  end

  test "should destroy reconcile_date" do
    assert_difference('ReconcileDate.count', -1) do
      delete reconcile_date_url(@reconcile_date)
    end

    assert_redirected_to reconcile_dates_url
  end
end
