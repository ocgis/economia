class Price < ApplicationRecord
  belongs_to :commodity, foreign_key: [:commodity_id, :commodity_space]
  belongs_to :currency, class_name: 'Commodity', foreign_key: [:currency_id, :currency_space]
end
