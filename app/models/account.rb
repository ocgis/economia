class Account < ApplicationRecord
  has_many :splits
  has_many :slots
end
