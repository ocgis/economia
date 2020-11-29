class Commodity < ApplicationRecord
  self.primary_keys = :id, :space

  alias_method :parent_id, :id

  def id=(value)
    super([value, self.space])
  end

  def id
    return self.parent_id[0]
  end

end
