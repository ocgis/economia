# frozen_string_literal: true

class Api::V1::EtransactionsController < ApplicationController
  load_and_authorize_resource

  before_action :set_book
  before_action :set_transaction, only: %i[show update destroy]

  def new
    default_commodity = @book.accounts.get_default_commodity
    transaction = @book.etransactions.build(date_posted: DateTime.now,
                                            currency_space: default_commodity[:space],
                                            currency_id: default_commodity[:id])
    transaction.save
    render json: { transaction: transaction.attributes }
  end

  def show
    splits = @transaction.splits.map(&:attributes)
    accounts_map = @book.accounts.accounts_map

    render json: { transaction: @transaction.attributes,
                   splits:,
                   accounts: accounts_map }
  end

  def update
    if @transaction.update(transaction_params)
      splits = @transaction.splits.map(&:attributes)
      accounts_map = @book.accounts.accounts_map

      render json: { transaction: @transaction.attributes,
                     splits:,
                     accounts: accounts_map }
    else
      render json: { error: @transaction.errors.inspect }
    end
  end

  def index
    etransactions = @book.etransactions
                         .preload(:splits)
                         .order('date_posted DESC').limit(500).sort_by(&:date_posted_sort)

    transactions = etransactions.map do |e|
      splits = e.splits.map(&:attributes)
      e.attributes.update(splits:)
    end
    accounts_map = @book.accounts.full_name_map
    render json: { transactions:,
                   accounts: accounts_map }
  end

  def search
    latest_sql = @book.etransactions.select('etransactions.*').order('description, updated_at DESC').to_sql
    etransactions = Etransaction
                    .preload(:splits)
                    .select('*')
                    .where('LOWER(description) LIKE ?', "%#{params[:query].downcase}%")
                    .from("(#{latest_sql}) as latest_sql").order(updated_at: :desc).limit(100)
    result = []

    count = 0
    etransactions.each do |etransaction|
      memos = etransaction.splits.pluck(:memo).compact.sort.join('|')
      description =
        if memos.blank?
          etransaction.description
        else
          "#{etransaction.description} : #{memos}"
        end

      next if result.size.positive? && (result.map { |r| r[:value] }.include? description)

      result.append({ value: description,
                      key: etransaction.id })
      count += 1
      break if count >= 10
    end
    render json: { result: }
  end

  def destroy
    @transaction.destroy

    render json: {}
  end

  rescue_from CanCan::AccessDenied do
    render json: { error: 'Access denied' }, status: 403
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
    params.require(:transaction)
          .permit(:id, :book_id, :description, :num, :currency_id, :currency_space, :date_posted,
                  splits_attributes: %i[id memo reconciled_state value quantity reconcile_date account_id
                                        etransaction_id _destroy])
  end
end
