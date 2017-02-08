json.extract! transaction, :id, :id_, :description, :created_at, :updated_at
json.url transaction_url(transaction, format: :json)