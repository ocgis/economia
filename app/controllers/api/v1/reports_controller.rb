# coding: utf-8
require 'matrix'

class Api::V1::ReportsController < ApplicationController

  load_and_authorize_resource

  before_action :set_book


  def index
    reports = Report.all
    render json: { reports: reports }
  end


  def show
    id = params[:id]
    if params.key?(:year)
      year = params[:year].to_i
    else
      year = DateTime.now.getlocal.year
    end
    number_of_months = 12
    @year = year
    
    @rows = []
    @month_nrs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    start_date = DateTime.new(year, 1, 1)
    end_date = start_date + number_of_months.month

    report = @book.reports.includes(rows: { row_items: :item }).find(id)
    accounts_to_load = get_accounts_to_load(report)

    accounts_in_book_sql = @book.accounts.where("id in (?)", accounts_to_load).select(:id).to_sql

    results = Split.includes(:etransaction).where("etransactions.date_posted >= :time_from and etransactions.date_posted < :time_to",
                                                 { time_from: start_date,
                                                   time_to: end_date }).where("splits.account_id in (#{accounts_in_book_sql})").select(:account_id, :quantity).group(:account_id, "to_char(date_posted, 'MM')").calculate(:sum, :quantity)

    balances = Split.includes(:etransaction).where("etransactions.date_posted < :time_from",
                                                   { time_from: start_date }).where("splits.account_id in (#{accounts_in_book_sql})").select(:account_id, :quantity).group(:account_id).calculate(:sum, :quantity)

    prices = self.get_prices(accounts_to_load)

    @rows.concat(present_report(report, accounts_to_load, results, balances, prices))

    render json: {
             rows: @rows,
             year: @year,
             month_numbers: @month_nrs
           }
  end

  private
  
  def set_book
    @book = Book.find(params[:book_id])
  end


  def get_accounts_from_row(row)
    value = {}
    row.row_items.each do |row_item|
      if row_item.item.is_a?(Row)
        row_value = get_accounts_from_row(row_item.item)
        row_value.each do |k, v|
          value[k] = value.fetch(k, []).concat(v)
        end
      elsif row_item.item.is_a?(Account)
        value[row.kind.to_sym] = value.fetch(row.kind.to_sym, []).append(row_item.item.id)
      else
        Rails.logger.warn("Class #{row_item.item.class.to_s} not handled!")
      end
    end

    return value
  end


  def get_accounts_to_load(report)
    account_ids = []
    report.rows.each do |row|
      row_value = get_accounts_from_row(row)
      row_value.each do |k, v|
        account_ids = account_ids.concat(v)
      end
    end

    return account_ids.uniq
  end


  def present_report(report, accounts_to_load, results_quantity, initial_balances_quantity, prices)
    balances_quantity = {}

    accounts_to_load.each do |account_id|
      balances_quantity[account_id] = {}
      quantity = initial_balances_quantity.fetch(account_id, BigDecimal(0))
      for idx in 0..12
        quantity += results_quantity.fetch([account_id, format("%02d", idx)], BigDecimal(0))
        balances_quantity[account_id][idx] = quantity
      end
    end

    balances_value = {}
    balances_quantity.each do |account_id, values_quantity|
      balances_value[account_id] = {}
      values_quantity.each do |month_idx, value_quantity|
        balance_quantity = balances_quantity[account_id][month_idx]
        price = prices.fetch(account_id, {}).fetch(month_idx, BigDecimal(1))
        balances_value[account_id][month_idx] = balance_quantity * price
      end
    end

    present_rows = []
    report.rows.each do |row|
      account_ids = get_accounts_from_row(row)
      if row[:kind] == 'year_header'
        present_rows.append({ title: @year.to_s,
                              incoming: 'Incoming',
                              months: Date::MONTHNAMES[1..],
                              average: 'Average',
                              sum: 'Sum'})
      elsif row[:kind] == 'result'
        month_results = (1..12).to_a.map do |month_num|
          account_ids[:result].sum do |account_id|
            balances_value.fetch(account_id, {}).fetch(month_num, BigDecimal(0)) -
            balances_value.fetch(account_id, {}).fetch(month_num - 1, BigDecimal(0))
          end
        end
        sum = month_results.sum
        average = sum / month_results.size
        present_rows.append({ title: row.title,
                              account_id: account_ids[:result][0],
                              included_accounts: account_ids[:result][1..-1],
                              incoming: '',
                              months: month_results.map{ |result| format("%.2f", result) },
                              average: format("%.2f", average),
                              sum: format("%.2f", sum) })
      elsif row[:kind] == 'balance'
        month_balances = []
        for month_num in 1..12 do
          month_balances << account_ids[:balance].sum do |account_id|
            balances_value.fetch(account_id, {}).fetch(month_num, BigDecimal(0))
          end
        end
        present_rows.append({ title: row.title,
                              account_id: account_ids[:balance][0],
                              included_accounts: account_ids[:balance][1..-1],
                              incoming: '',
                              months: month_balances.map{ |balance| format("%.2f", balance) },
                              average: '',
                              sum: '' })
      else
        present_rows.append({ title: "WARNING: unhandled type \"#{row[:kind]}\"",
                              account_id: '',
                              included_accounts: [],
                              incoming: '',
                              months: (1..12).to_a,
                              average: '0.00',
                              sum: '0.00' })
      end
    end
    return present_rows
  end


  def get_prices(accounts_to_load)
    default_commodity = @book.accounts.get_default_commodity
    priced_accounts_sql = @book.accounts.where("id in (?) and ((commodity_id <> ?) or (commodity_space <> ?))", accounts_to_load, default_commodity[:id], default_commodity[:space]).select(:id, :commodity_space, :commodity_id).to_sql
    all_prices = @book.prices.joins("INNER JOIN (#{priced_accounts_sql}) AS accounts ON ((prices.commodity_id = accounts.commodity_id) AND (prices.commodity_space = accounts.commodity_space))").order(time: :desc).pluck('accounts.id, prices.value, prices.time').map{ |o| { account_id: o[0], value: o[1], time: o[2] } }.group_by{ |o| o[:account_id] }

    prices = {}
    year_start = DateTime.new(@year, 1, 1)
    all_prices.each do |account_id, values|
      if not prices.keys.include? account_id
        prices[account_id] = {}
      end
      month_idx = DateTime.new(@year, 12, 1)

      values.each do |value|
        month_dt = value[:time].beginning_of_month

        while month_dt <= month_idx do
          if month_idx < year_start
            prices[account_id][0] = value[:value]
            break
          end
          prices[account_id][month_idx.month] = value[:value]
          month_idx -= 1.month
        end

        if month_dt.year < @year
          break
        end
      end
    end

    return prices
  end


end
