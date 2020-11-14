class Api::V1::EtransactionsController < ApplicationController

  load_and_authorize_resource

  before_action :set_transaction, only: [:update]

  def new
    transaction = Etransaction.new(date_entered_date: DateTime.now,
                                   date_entered_ns: 0,
                                   date_posted_date: DateTime.now,
                                   date_posted_ns: 0);
    transaction.save
    render json: { transaction: transaction.attributes }
  end


  def show
    transaction = Etransaction.find(params[:id])
    splits = transaction.splits.map {
      |split| split.attributes
    }
    accounts_map = Account.full_name_map

    render json: { transaction: transaction.attributes,
                   splits: splits,
                   accounts: accounts_map }
  end


  def update
    if @transaction.update(transaction_params)
      splits = @transaction.splits.map {
        |split| split.attributes
      }
      accounts_map = Account.full_name_map

      render json: { transaction: @transaction.attributes,
                     splits: splits,
                     accounts: accounts_map}
    else
      render json: @transaction.errors
    end
  end


  def index
    etransactions = Etransaction.preload(:splits).order("date_posted_date DESC").limit(100).sort_by{|e| e.date_posted_date_sort}

    transactions = etransactions.map do |e|
      splits = e.splits.map do |split|
        split.attributes
      end
      e.attributes.update(splits: splits)
    end
    accounts_map = Account.full_name_map
    render json: { transactions: transactions,
                   accounts: accounts_map }
  end


  def search
    etransactions = Etransaction.where("LOWER(description) LIKE ?", "%" + params[:query].downcase + "%").order(updated_at: :desc).limit(10)
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
    def set_transaction
      @transaction = Etransaction.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def transaction_params
      params.require(:transaction).permit(:id, :id_, :description, :num, :currency_id_, :currency_space, :date_entered_date, :date_entered_ns, :date_posted_date, :date_posted_ns, splits_attributes: [:id, :id_, :memo, :reconciled_state, :value, :quantity, :reconcile_date_date, :reconcile_date_ns, :account_id, :etransaction_id, :_destroy])
    end

end
