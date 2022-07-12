class Api::V1::CommoditiesController < ApplicationController
  load_and_authorize_resource

  before_action :set_book

  def index
    commodities = @book.commodities.map(&:attributes)

    render json: { commodities: commodities }
  end

  def create
    commodity = @book.commodities.build(commodity_params)
    commodity.save

    render json: { commodity: commodity.attributes }
  end

  private

  def set_book
    @book = Book.find(params[:book_id])
  end

  def commodity_params
    params.require(:commodity).permit(:id_, :space, :fraction)
  end
end
