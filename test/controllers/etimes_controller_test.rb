require 'test_helper'

class EtimesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @etime = etimes(:one)
  end

  test "should get index" do
    get etimes_url
    assert_response :success
  end

  test "should get new" do
    get new_etime_url
    assert_response :success
  end

  test "should create etime" do
    assert_difference('Etime.count') do
      post etimes_url, params: { etime: { date: @etime.date } }
    end

    assert_redirected_to etime_url(Etime.last)
  end

  test "should show etime" do
    get etime_url(@etime)
    assert_response :success
  end

  test "should get edit" do
    get edit_etime_url(@etime)
    assert_response :success
  end

  test "should update etime" do
    patch etime_url(@etime), params: { etime: { date: @etime.date } }
    assert_redirected_to etime_url(@etime)
  end

  test "should destroy etime" do
    assert_difference('Etime.count', -1) do
      delete etime_url(@etime)
    end

    assert_redirected_to etimes_url
  end
end
