json.extract! transaction, :id, :id_, :description, :num, :currency_id_, :currency_space, :date_entered_date, :date_entered_ns, :date_posted_date, :date_posted_ns, :created_at, :updated_at
json.url transaction_url(transaction, format: :json)