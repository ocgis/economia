class Api::V1::PricesController < ApplicationController

  load_and_authorize_resource

  before_action :set_book
  before_action :set_price, only: [:destroy]

  def index
    prices = @book.prices.order(time: :desc).limit(100).map do |price|
      price.attributes
    end

    commodities = @book.commodities.map do |commodity|
      commodity.attributes
    end

    render json: { prices: prices,
                   commodities: commodities }
  end


  def create
    price = @book.prices.build(price_params)
    price.save

    render json: { price: price.attributes }
  end


  def destroy
    @price.destroy

    prices = @book.prices.order(time: :desc).limit(100).map do |price|
      price.attributes
    end

    commodities = @book.commodities.map do |commodity|
      commodity.attributes
    end

    render json: { prices: prices,
                   commodities: commodities }
  end


  private

  def set_book
    @book = Book.find(params[:book_id])
  end

  def set_price
    @price = @book.prices.find(params[:id])
  end

  def price_params
    params.require(:price).permit(:time, :currency_space, :currency_id, :commodity_space, :commodity_id, :source, :type_, :value)
  end

end
