class Api::V1::AccountsController < ApplicationController

  load_and_authorize_resource

  before_action :set_book
  before_action :set_account, only: [:show]

  def index
    accounts = @book.accounts.map do |account|
      account.attributes
    end
    accounts_map = @book.accounts.full_name_map

    render json: { accounts: accounts,
                   accounts_map: accounts_map }
  end

  def show
    all_splits = @account.splits.preload(:etransaction).joins(:etransaction).order('etransactions.date_posted')
    accounts_map = @book.accounts.full_name_map

    if params.key?(:year)
      year = params[:year].to_i
      if params.key?(:month)
        month = params[:month].to_i
        start_date = DateTime.new(year, month, 1)
        end_date = start_date + 1.month
      else
        start_date = DateTime.new(year, 1, 1)
        end_date = start_date + 1.year
      end
      splits_objs = all_splits.where("etransactions.date_posted >= :time_from and etransactions.date_posted < :time_to",
                             { time_from: start_date,
                               time_to: end_date })
    else
      splits_objs = all_splits
    end

    splits = splits_objs.preload({ etransaction: { splits: :account },
                                   account: {} }).map do |split|
      etransaction = split.etransaction.attributes
      other_splits = split.other_splits

      if other_splits.size > 1
        other_account = "-- Delad transaktion --"
      elsif other_splits.size == 0
        other_account = ""
      else
        other_account = accounts_map[other_splits[0].account_id]
      end

      split.attributes.update({ etransaction: etransaction,
                                other_account: other_account })
    end
    account = @account.attributes.update({ full_name: @account.full_name,
                                           decrease_name: @account.decrease_name,
                                           increase_name: @account.increase_name })
    render json: { account: account,
                   splits: splits }
  end
  
  private

  def set_book
    @book = Book.find(params[:book_id])
  end

  def set_account
    @account = @book.accounts.preload(:splits).find(params[:id])
  end

end
