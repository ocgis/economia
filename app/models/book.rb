class Book < ApplicationRecord
  has_many :slots
  has_many :commodities
  has_many :accounts
  has_many :etransactions
  has_many :prices
end
