class Api::V1::SplitsController < ApplicationController

  load_and_authorize_resource


  def show
    split = Split.find(params[:id])

    render json: { split: split }
  end


  def search
    splits = Split.where("LOWER(memo) LIKE ?", "%" + params[:query].downcase + "%").order(updated_at: :desc).limit(10)
    result = splits.map do |split|
      { value: split.memo,
        key: split.id }
    end
    render json: { result: result }
  end

  rescue_from CanCan::AccessDenied do |exception|
    render json: { error: "Access denied"}, status: 403
  end

end
