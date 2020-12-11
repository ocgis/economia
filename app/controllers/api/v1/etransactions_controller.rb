class Api::V1::EtransactionsController < ApplicationController

  load_and_authorize_resource

  before_action :set_book
  before_action :set_transaction, only: [:show, :update]

  def new
    transaction = @book.etransactions.build(date_posted: DateTime.now);
    transaction.save
    render json: { transaction: transaction.attributes }
  end


  def show
    splits = @transaction.splits.map {
      |split| split.attributes
    }
    accounts_map = @book.accounts.full_name_map

    render json: { transaction: @transaction.attributes,
                   splits: splits,
                   accounts: accounts_map }
  end


  def update
    if @transaction.update(transaction_params)
      splits = @transaction.splits.map {
        |split| split.attributes
      }
      accounts_map = @book.accounts.full_name_map

      render json: { transaction: @transaction.attributes,
                     splits: splits,
                     accounts: accounts_map}
    else
      render json: @transaction.errors
    end
  end


  def index
    etransactions = @book.etransactions.preload(:splits).order("date_posted DESC").limit(100).sort_by{|e| e.date_posted_sort}

    transactions = etransactions.map do |e|
      splits = e.splits.map do |split|
        split.attributes
      end
      e.attributes.update(splits: splits)
    end
    accounts_map = @book.accounts.full_name_map
    render json: { transactions: transactions,
                   accounts: accounts_map }
  end


  def search
    etransactions = @book.etransactions.where("LOWER(description) LIKE ?", "%" + params[:query].downcase + "%").order(updated_at: :desc).limit(10)
    result = etransactions.map do |etransaction|
      { value: etransaction.description,
        key: etransaction.id }
    end
    render json: { result: result }
  end


  rescue_from CanCan::AccessDenied do |exception|
    render json: { error: "Access denied"}, status: 403
  end

  private
  # Use callbacks to share common setup or constraints between actions.

  def set_book
    @book = Book.find(params[:book_id])
  end

  def set_transaction
    @transaction = @book.etransactions.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def transaction_params
    params.require(:transaction).permit(:id, :description, :num, :currency_id_, :currency_space, :date_posted, splits_attributes: [:id, :memo, :reconciled_state, :value, :quantity, :reconcile_date, :account_id, :etransaction_id, :_destroy])
  end

end
