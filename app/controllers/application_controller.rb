# frozen_string_literal: true

# The controller base class
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :local_auth

  def after_sign_in_path_for(_resource)
    url = session[:fall_back_url]
    session[:fall_back_url] = nil
    url = request.env['omniauth.origin'] || root_path if url.nil?
    url
  end

  private

  def local_auth
    session[:fall_back_url] = request.url unless request.url.include?('/users/')
    authenticate_user!
  end
end
