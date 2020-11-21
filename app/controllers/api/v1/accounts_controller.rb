class Api::V1::AccountsController < ApplicationController

  load_and_authorize_resource

  before_action :set_account, only: [:show]

  def index
    accounts = Account.all.map do |account|
      account.attributes
    end
    accounts_map = Account.full_name_map

    render json: { accounts: accounts,
                   accounts_map: accounts_map }
  end

  def show
    all_splits = @account.splits.preload(:etransaction).joins(:etransaction).order('etransactions.date_posted_date')

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
      splits_objs = all_splits.where("etransactions.date_posted_date >= :time_from and etransactions.date_posted_date < :time_to",
                             { time_from: start_date,
                               time_to: end_date })
    else
      splits_objs = all_splits
    end

    splits = splits_objs.map do |split|
      split.attributes.update({ etransaction: split.etransaction.attributes,
                                other_account: split.other_account })
    end
    account = @account.attributes.update({ full_name: @account.full_name,
                                           decrease_name: @account.decrease_name,
                                           increase_name: @account.increase_name })
    render json: { account: account,
                   splits: splits }
  end
  
  private

  def set_account
    @account = Account.find(params[:id])
  end

end
