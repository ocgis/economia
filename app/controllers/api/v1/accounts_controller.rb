# frozen_string_literal: true

module Api
  module V1
    # The accounts controller
    class AccountsController < ApplicationController
      load_and_authorize_resource

      before_action :set_book
      before_action :set_account, only: [:show]

      def index
        accounts_map = @book.accounts.full_name_map

        mapped = {}
        @book.accounts.each do |account|
          mapped[account[:id]] = {}
          mapped[account[:id]][:balance] = BigDecimal(0)
          mapped[account[:id]][:parent] = account.parent_id
        end
        balances = Split.joins(:account).where('accounts.book_id =
          ?', @book.id).select(:account_id, :value).group(:account_id).calculate(:sum, :value)

        dates = Split.joins(:account).where('accounts.book_id =
          ?', @book.id).select(:account_id, :value).group(:account_id).maximum(:updated_at)

        # Include children balances in parent balance
        balances.each do |id, balance|
          until id.nil?
            mapped[id][:balance] += balance
            id = mapped[id][:parent]
          end
        end

        accounts = @book.accounts.map do |account|
          sortdate =  if dates[account.id].nil?
                        account[:updated_at]
                      else
                        dates[account.id]
                      end
          account.attributes.update({ balance: mapped[account.id][:balance],
                                      sortdate: })
        end

        commodities = @book.commodities.map(&:attributes)

        render json: { accounts:,
                       accounts_map:,
                       commodities: }
      end

      def show
        accounts_map = @book.accounts.full_name_map

        account_ids = [@account.id]

        account_ids += params[:include].split(',') if params.key?(:include)

        # Make sure that the passed ids are in the book
        account_sql = @book.accounts.where('id in (?)', account_ids).select(:id).to_sql

        account_splits = Split.where(
          "account_id in (#{account_sql})"
        ).joins(
          :etransaction
        ).order(
          'etransactions.date_posted DESC'
        ).select(
          :etransaction_id
        )

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
          account_splits = account_splits.where(
            'etransactions.date_posted >= :time_from and etransactions.date_posted < :time_to',
            { time_from: start_date,
              time_to: end_date }
          )
        end

        end_balance = Split.where(
          "account_id in (#{account_sql})"
        ).where(
          "etransaction_id in (#{account_splits.to_sql})"
        ).calculate(
          :sum, :value
        )

        account_splits = account_splits.limit(params[:limit]) if params.key?(:limit)

        all_splits = Split.where("etransaction_id in (#{account_splits.to_sql})")

        all_splits_grouped = all_splits.group_by(&:etransaction_id)

        etransactions = Etransaction.where("etransactions.id in (#{account_splits.to_sql})").order(date_posted: :desc)

        splits = []

        etransactions.each do |etransaction|
          num_splits = all_splits_grouped[etransaction.id].size

          splits_regrouped = all_splits_grouped[etransaction.id].group_by do |split|
            account_ids.include? split.account_id ? :account : :other
          end

          splits_regrouped[:account].each do |split|
            if num_splits > 2
              other_account = '-- Delad transaktion --'
            elsif num_splits == 2
              index = split.account_id == all_splits_grouped[etransaction.id][0].account_id ? 1 : 0
              other_account = accounts_map[all_splits_grouped[etransaction.id][index].account_id]
            else
              other_account = ''
            end
            splits.append(split.attributes.update({ etransaction:,
                                                    other_account: }))
          end
        end

        account = @account.attributes.update({ full_name: accounts_map[@account.id] })

        splits.each do |split|
          split[:balance] = end_balance
          end_balance -= split['value']
        end

        render json: { account:,
                       splits: }
      end

      def create
        account = @book.accounts.build(account_params)
        account.save

        accounts_map = @book.accounts.full_name_map

        render json: { account: account.attributes,
                       accounts_map: }
      end

      private

      def set_book
        @book = Book.find(params[:book_id])
      end

      def set_account
        @account = @book.accounts.find(params[:id])
      end

      def account_params
        params.require(
          :account
        ).permit(
          :name, :description, :commodity_scu, :commodity_space, :commodity_id, :type_, :code, :parent_id
        )
      end
    end
  end
end
