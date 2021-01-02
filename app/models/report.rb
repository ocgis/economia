class Report < ApplicationRecord
  has_many :rows, dependent: :destroy
  belongs_to :book
end
