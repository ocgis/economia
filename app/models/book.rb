class Book < ApplicationRecord
  has_many :slots, dependent: :destroy
  has_many :commodities, dependent: :delete_all
  has_many :accounts, dependent: :destroy
  has_many :etransactions, dependent: :destroy
  has_many :prices, dependent: :delete_all
end
