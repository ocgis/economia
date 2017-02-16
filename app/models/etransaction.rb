class Etransaction < ApplicationRecord
  has_many :slots, dependent: :destroy
  has_many :splits, dependent: :destroy
  accepts_nested_attributes_for :splits, allow_destroy: true
end
