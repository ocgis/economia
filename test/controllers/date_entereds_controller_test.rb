require 'test_helper'

class DateEnteredsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @date_entered = date_entereds(:one)
  end

  test "should get index" do
    get date_entereds_url
    assert_response :success
  end

  test "should get new" do
    get new_date_entered_url
    assert_response :success
  end

  test "should create date_entered" do
    assert_difference('DateEntered.count') do
      post date_entereds_url, params: { date_entered: { date: @date_entered.date } }
    end

    assert_redirected_to date_entered_url(DateEntered.last)
  end

  test "should show date_entered" do
    get date_entered_url(@date_entered)
    assert_response :success
  end

  test "should get edit" do
    get edit_date_entered_url(@date_entered)
    assert_response :success
  end

  test "should update date_entered" do
    patch date_entered_url(@date_entered), params: { date_entered: { date: @date_entered.date } }
    assert_redirected_to date_entered_url(@date_entered)
  end

  test "should destroy date_entered" do
    assert_difference('DateEntered.count', -1) do
      delete date_entered_url(@date_entered)
    end

    assert_redirected_to date_entereds_url
  end
end
