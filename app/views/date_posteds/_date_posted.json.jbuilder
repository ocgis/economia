json.extract! date_posted, :id, :date, :created_at, :updated_at
json.url date_posted_url(date_posted, format: :json)