class Commodity < ApplicationRecord
  self.primary_keys = :id_, :space, :book_id
end
