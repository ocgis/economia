# frozen_string_literal: true

# Controller for computer version of app
class ComputerController < ApplicationController
  # If we get here, the user should be logged in
  def index; end

  def error
    @notice = params[:notice]
  end
end
