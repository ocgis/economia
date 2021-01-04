class Api::V1::CommoditiesController < ApplicationController

  load_and_authorize_resource

  before_action :set_book

  def index
    commodities = @book.commodities.map do |commodity|
      commodity.attributes
    end

    render json: { commodities: commodities }
  end

  private

  def set_book
    @book = Book.find(params[:book_id])
  end

end
