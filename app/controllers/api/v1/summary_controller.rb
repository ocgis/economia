# coding: utf-8
require 'matrix'

class Api::V1::SummaryController < ApplicationController

  authorize_resource class: false

  before_action :set_book

  def index
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

    report = @book.reports.includes(rows: { row_items: :item })[0]
    accounts_to_load = get_accounts_to_load(report)

    result_accounts_in_book_sql = @book.accounts.where("id in (?)", accounts_to_load[:result]).select(:id).to_sql

    results = Split.includes(:etransaction).where("etransactions.date_posted >= :time_from and etransactions.date_posted < :time_to",
                                                 { time_from: start_date,
                                                   time_to: end_date }).where("splits.account_id in (#{result_accounts_in_book_sql})").select(:account_id, :value).group(:account_id, "to_char(date_posted, 'MM')").calculate(:sum, :value)

    balance_accounts_in_book_sql = @book.accounts.where("id in (?)", accounts_to_load[:balance]).select(:id).to_sql

    balances = Split.includes(:etransaction).where("etransactions.date_posted < :time_from",
                                                 { time_from: start_date,
                                                   time_to: end_date }).where("splits.account_id in (#{balance_accounts_in_book_sql})").select(:account_id, :value).group(:account_id).calculate(:sum, :value)

    @rows.concat(present_report(report, results, balances))

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
    value = {}
    report.rows.each do |row|
      row_value = get_accounts_from_row(row)
      row_value.each do |k, v|
        value[k] = value.fetch(k, []).concat(v)
      end
    end

    value.each do |k, v|
      value[k] = v.uniq
    end
    return value
  end

  def present_report(report, results, balances)
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
            results.fetch([account_id, format("%02d", month_num)], BigDecimal(0))
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
        current_balance = account_ids[:balance].sum{ |account_id| balances.fetch(account_id, BigDecimal(0)) }
        for month_num in 1..12 do
          current_balance += account_ids[:balance].sum do |account_id|
            results.fetch([account_id, format("%02d", month_num)], BigDecimal(0))
          end
          month_balances << current_balance
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

end
