class RowItem < ApplicationRecord
  belongs_to :item, polymorphic: true
  belongs_to :row
end
