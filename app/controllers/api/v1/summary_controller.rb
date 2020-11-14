# coding: utf-8
class Api::V1::SummaryController < ApplicationController

  authorize_resource class: false

  def index
    accounts = Account.all()

    if params.key?(:collapse)
      collapses = params[:collapse].split(',')
    else
      collapses = 'Tillgångar,Lån,Utgifter:Mat,Utgifter:Hemmet,Utgifter:Hälsa,Inkomster:Lön,Utgifter:Fritid,Utgifter:Läsning,Utgifter:Kommunikation,Utgifter:Försäkringar,Utgifter:Nöjen,Resultat,Utgifter:Värdepappersinköp'.split(',')
    end

    if params.key?(:hide)
      hides = params[:hide].split(',')
    else
      hides = 'Root Account,Resultat,Utgifter,Inkomster,Imbalance-SEK,Obalans-SEK,Föräldralös-SEK,Utgifter:Bil'.split(',')
    end

    if params.key?(:year)
      year = params[:year].to_i
    else
      year = DateTime.now.getlocal.year
    end
    number_of_months = 12
    @year = year
    @prev_year = year - 1
    @next_year = year + 1

    all_rows = []

    start_date = DateTime.new(year, 1, 1)
    end_date = start_date + number_of_months.month
    splits = Split.preload(:etransaction).joins(:etransaction).where("etransactions.date_posted_date >= :time_from and etransactions.date_posted_date < :time_to",
                                              { time_from: start_date,
                                                time_to: end_date })
    account_splits = {}
    accounts.each do |account|
      account_splits[account.id] = {}
      current_date = start_date
      number_of_months.times do
        account_splits[account.id][[current_date.year, current_date.month]] = []
        current_date = current_date + 1.month
      end
    end

    splits.each do |split|
      date = split.etransaction.date_posted_date
      if date.nil? or split.account_id.nil?
        if date.nil?
          puts "ERROR: date_posted_date is nil"
          puts split.etransaction.inspect
        end
        if split.account_id.nil?
          puts "ERROR: account_id is nil"
          puts split.inspect
        end
      else
        account_splits[split.account_id][[date.year, date.month]].append(split)
      end
    end

    accounts_map = Account.full_name_map
    accounts.each do |account|
      row = { title: accounts_map[account.id],
              account_id: account.id,
              incoming: '',
              months: [],
              average: BigDecimal(0),
              sum: BigDecimal(0)}
      start_date = DateTime.new(year, 1, 1)
      number_of_months.times do
        end_date = start_date + 1.month
        total = BigDecimal.new(0)
        account_splits[account.id][[start_date.year, start_date.month]].each do |split|
          total = total + split[:value]
        end
        row[:months].append(total)
        start_date = end_date
      end
      calculate_sum_and_average(row)
      
      all_rows.append(row)
    end

    collapses.each do |collapse|
      new_row = {title: collapse,
                 incoming: '',
                 months: Array.new(number_of_months, BigDecimal.new(0)),
                 average: BigDecimal(0),
                 sum: BigDecimal(0)}
      delete_rows = []
      all_rows.each do |row|
        if row[:title] == new_row[:title]
          new_row[:account_id] = row[:account_id]
        end

        if row[:title].start_with?(new_row[:title])
          new_row[:months] = sum_lists(new_row[:months], row[:months])
          delete_rows.append(row)
        end
      end

      delete_rows.each do |delete_row|
        all_rows.delete(delete_row)
      end
      calculate_sum_and_average(new_row)
      all_rows.append(new_row)
    end

    hides.each do |hide|
      delete_rows = []
      all_rows.each do |row|
        if row[:title] == hide
          delete_rows.append(row)
        end
      end

      delete_rows.each do |delete_row|
        all_rows.delete(delete_row)
      end      
    end
    
    @rows = [{ title: year.to_s,
               incoming: 'Ingående',
               months: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
               average: 'Medel',
               sum: 'Totalt'}]
    @month_nrs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    living_titles = ['Utgifter:Bostadsköp', 'Utgifter:Skatt:Vinstskatt']
    income_tax_titles = ['Utgifter:Skatt:Inkomstskatt']

    expenses = []
    all_rows.each do |row|
      if row[:title].start_with?('Utgifter') and not (living_titles + income_tax_titles).include? row[:title]
        expenses.append(row)
      end
    end
    expenses.each do |delete_row|
      all_rows.delete(delete_row)
    end
    expenses = expenses.sort_by { |f| [f[:title]] }

    expenses_sums = { title: "Summa utgifter",
                      incoming: '',
                      months: Array.new(number_of_months, BigDecimal.new(0)),
                      average: BigDecimal(0),
                      sum: BigDecimal(0)}
    expenses.each do |expense|
      expense[:title] = expense[:title]['Utgifter:'.length..-1]
      expenses_sums[:months] = sum_lists(expenses_sums[:months], expense[:months])
    end
    calculate_sum_and_average(expenses_sums)

    @rows = @rows + expenses
    @rows.append(expenses_sums)

    living_expenses = []
    all_rows.each do |row|
      if living_titles.include? row[:title]
        living_expenses.append(row)
      end
    end
    living_expenses.each do |delete_row|
      all_rows.delete(delete_row)
    end
    living_expenses = living_expenses.sort_by { |f| [f[:title]] }

    living_expenses_sums = { title: "Totala utgifter",
                             incoming: '',
                             months: Array.new(number_of_months, BigDecimal.new(0)),
                             average: BigDecimal(0),
                             sum: BigDecimal(0) }
    (living_expenses + [expenses_sums]).each do |living_expense|
      living_expenses_sums[:months] = sum_lists(living_expenses_sums[:months], living_expense[:months])
    end
    calculate_sum_and_average(living_expenses_sums)

    living_expenses.each do |living_expense|
      living_expense[:title] = living_expense[:title]['Utgifter:'.length..-1]
    end
    @rows = @rows + living_expenses
    
    @rows.append(living_expenses_sums)
    
    incomes = []
    all_rows.each do |row|
      if row[:title].start_with?('Inkomster')
        incomes.append(row)
      end
    end
    incomes.each do |delete_row|
      all_rows.delete(delete_row)
    end
    incomes = incomes.sort_by { |f| [f[:title]] }

    incomes_sums = { title: "Total inkomst",
                     incoming: '',
                     months: Array.new(number_of_months, BigDecimal.new(0)),
                     average: BigDecimal(0),
                     sum: BigDecimal(0)}
    incomes.each do |income|
      income[:title] = income[:title]['Inkomster:'.length..-1]
    end
    incomes.each do |income|
      for i in 0..number_of_months-1
        income[:months][i] = -income[:months][i]
      end
    end
    incomes.each do |income|
      incomes_sums[:months] = sum_lists(incomes_sums[:months], income[:months])
    end
    calculate_sum_and_average(incomes_sums)

    @rows = @rows + incomes
    @rows.append(incomes_sums)

    income_taxes = []
    all_rows.each do |row|
      if income_tax_titles.include? row[:title]
        income_taxes.append(row)
      end
    end
    income_taxes.each do |delete_row|
      all_rows.delete(delete_row)
    end
    income_taxes = income_taxes.sort_by { |f| [f[:title]] }

    income_taxes_sums = { title: "Inkomst efter skatt",
                          incoming: '',
                          months: Array.new(number_of_months, BigDecimal.new(0)),
                          average: BigDecimal(0),
                          sum: BigDecimal(0) }
    income_taxes_sums[:months] = sum_lists(income_taxes_sums[:months], incomes_sums[:months])
    income_taxes.each do |income_tax|
      income_taxes_sums[:months] = subtract_lists(income_taxes_sums[:months], income_tax[:months])
    end
    calculate_sum_and_average(income_taxes_sums)    

    income_taxes.each do |income_tax|
      income_tax[:title] = income_tax[:title]['Utgifter:'.length..-1]
    end

    @rows = @rows + income_taxes
    @rows.append(income_taxes_sums)

    loans = []
    
    loans_sums = { title: "Inlånat",
                   incoming: '',
                   months: Array.new(number_of_months, BigDecimal.new(0)),
                   average: BigDecimal(0),
                   sum: BigDecimal(0) }
    all_rows.each do |row|
      if row[:title] == "Lån"
        loans.append(row)
        loans_sums[:months] = subtract_lists(loans_sums[:months], row[:months])
      end        
    end
    calculate_sum_and_average(loans_sums)

    loans.each do |delete_row|
      all_rows.delete(delete_row)
    end
    
    @rows.append(loans_sums)
    
    assets = []
    assets_sums = { title: "Bank",
                    incoming: '',
                    months: Array.new(number_of_months, BigDecimal.new(0)),
                    average: BigDecimal(0),
                    sum: BigDecimal(0) }
    all_rows.each do |row|
      if row[:title] == "Tillgångar"
        assets.append(row)
        assets_sums[:months] = sum_lists(assets_sums[:months], row[:months])
      end        
    end
    calculate_sum_and_average(assets_sums)
    
    assets.each do |delete_row|
      all_rows.delete(delete_row)
    end

    @rows.append(assets_sums)
    
    @rows = @rows + all_rows

    render json: {
             rows: @rows,
             year: @year,
             month_numbers: @month_nrs
           }
  end

  private
  
  def sum_lists(list1, list2)
    return (Vector.elements(list1) + Vector.elements(list2)).to_a
  end

  def subtract_lists(list1, list2)
    return (Vector.elements(list1) - Vector.elements(list2)).to_a
  end

  def average(list)
    return sum(list) / list.length
  end

  def sum(list)
    return list.inject(BigDecimal(0)) { |sum, x| sum + x }
  end

  def calculate_sum_and_average(row)
    row[:average] = average(row[:months]).round(2)
    row[:sum] = sum(row[:months]).round(2)
  end

end
