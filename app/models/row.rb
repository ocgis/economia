class Row < ApplicationRecord
  has_many :row_items, dependent: :destroy
  belongs_to :report
end
