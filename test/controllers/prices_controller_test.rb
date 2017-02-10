require 'test_helper'

class PricesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @price = prices(:one)
  end

  test "should get index" do
    get prices_url
    assert_response :success
  end

  test "should get new" do
    get new_price_url
    assert_response :success
  end

  test "should create price" do
    assert_difference('Price.count') do
      post prices_url, params: { price: { commodity_id_: @price.commodity_id_, commodity_space: @price.commodity_space, currency_id_: @price.currency_id_, currency_space: @price.currency_space, id_: @price.id_, source: @price.source, time_date: @price.time_date, value: @price.value } }
    end

    assert_redirected_to price_url(Price.last)
  end

  test "should show price" do
    get price_url(@price)
    assert_response :success
  end

  test "should get edit" do
    get edit_price_url(@price)
    assert_response :success
  end

  test "should update price" do
    patch price_url(@price), params: { price: { commodity_id_: @price.commodity_id_, commodity_space: @price.commodity_space, currency_id_: @price.currency_id_, currency_space: @price.currency_space, id_: @price.id_, source: @price.source, time_date: @price.time_date, value: @price.value } }
    assert_redirected_to price_url(@price)
  end

  test "should destroy price" do
    assert_difference('Price.count', -1) do
      delete price_url(@price)
    end

    assert_redirected_to prices_url
  end
end
