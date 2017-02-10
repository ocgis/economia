class Etransaction < ApplicationRecord
  has_many :slots
  has_many :splits
end
