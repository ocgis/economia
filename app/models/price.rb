class Price < ApplicationRecord
  belongs_to :commodity, foreign_key: [:commodity_id, :commodity_space, :book_id]
  belongs_to :currency, class_name: 'Commodity', foreign_key: [:currency_id, :currency_space, :book_id]
end
