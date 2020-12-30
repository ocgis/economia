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
    accounts_map = @book.accounts.full_name_map

    account_ids = [@account.id]
    if params.key?(:include)
      account_ids = account_ids + params[:include].split(',')
    end

    # Make sure that the passed ids are in the book
    account_sql = @book.accounts.where("id in (?)", account_ids).select(:id).to_sql

    account_splits = Split.where("account_id in (#{account_sql})").joins(:etransaction).order('etransactions.date_posted DESC').select(:etransaction_id)

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
      account_splits = account_splits.where("etransactions.date_posted >= :time_from and etransactions.date_posted < :time_to",
                             { time_from: start_date,
                               time_to: end_date })
    end

    end_balance = Split.where("account_id in (#{account_sql})").where("etransaction_id in (#{account_splits.to_sql})").calculate(:sum, :value)

    if params.key?(:limit)
      account_splits = account_splits.limit(params[:limit])
    end

    all_splits = Split.where("etransaction_id in (#{account_splits.to_sql})")

    all_splits_grouped = all_splits.group_by(&:etransaction_id)

    etransactions = Etransaction.where("etransactions.id in (#{account_splits.to_sql})").order(date_posted: :desc)

    splits = []

    etransactions.each do |etransaction|
      num_splits = all_splits_grouped[etransaction.id].size

      splits_regrouped = all_splits_grouped[etransaction.id].group_by { |split| (account_ids.include? split.account_id) ? :account : :other }

      splits_regrouped[:account].each do |split|
        if num_splits > 2
          other_account = "-- Delad transaktion --"
        elsif num_splits == 2
          index = (split.account_id == all_splits_grouped[etransaction.id][0].account_id) ? 1 : 0
          other_account = accounts_map[all_splits_grouped[etransaction.id][index].account_id]
        else
          other_account = ""
        end
        splits.append(split.attributes.update({ etransaction: etransaction,
                                                other_account: other_account }))
      end
    end

    account = @account.attributes.update({ full_name: accounts_map[@account.id] })

    splits.each do |split|
      split[:balance] = end_balance
      end_balance = end_balance - split['value']
    end

    render json: { account: account,
                   splits: splits }
  end

  private

  def set_book
    @book = Book.find(params[:book_id])
  end

  def set_account
    @account = @book.accounts.find(params[:id])
  end

end
