require 'test_helper'

class DatePostedsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @date_posted = date_posteds(:one)
  end

  test "should get index" do
    get date_posteds_url
    assert_response :success
  end

  test "should get new" do
    get new_date_posted_url
    assert_response :success
  end

  test "should create date_posted" do
    assert_difference('DatePosted.count') do
      post date_posteds_url, params: { date_posted: { date: @date_posted.date } }
    end

    assert_redirected_to date_posted_url(DatePosted.last)
  end

  test "should show date_posted" do
    get date_posted_url(@date_posted)
    assert_response :success
  end

  test "should get edit" do
    get edit_date_posted_url(@date_posted)
    assert_response :success
  end

  test "should update date_posted" do
    patch date_posted_url(@date_posted), params: { date_posted: { date: @date_posted.date } }
    assert_redirected_to date_posted_url(@date_posted)
  end

  test "should destroy date_posted" do
    assert_difference('DatePosted.count', -1) do
      delete date_posted_url(@date_posted)
    end

    assert_redirected_to date_posteds_url
  end
end
