class RootController < ApplicationController
  protect_from_forgery with: :exception
  before_action :authenticate_user!


  # If we get here, the user should be logged in
  def index
  end


  def error
  end

end
