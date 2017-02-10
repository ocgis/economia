class Slot < ApplicationRecord
  belongs_to :etransaction
  belongs_to :account
end
