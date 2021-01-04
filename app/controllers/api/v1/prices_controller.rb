class Api::V1::PricesController < ApplicationController

  load_and_authorize_resource

  before_action :set_book

  def index
    prices = @book.prices.map do |price|
      price.attributes
    end

    render json: { prices: prices }
  end

  private

  def set_book
    @book = Book.find(params[:book_id])
  end

end
