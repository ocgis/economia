class Commodity < ApplicationRecord
  self.primary_keys = :id, :space, :book_id

  alias_method :parent_id, :id

  def id=(value)
    super([value, self.space, self.book_id])
  end

  def id
    return self.parent_id[0]
  end

end
