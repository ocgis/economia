class Split < ApplicationRecord
  belongs_to :account
  belongs_to :etransaction

  def other_splits
    return self.etransaction.splits.reject { |a| a == self }
  end

  def increase_str
    return Split.posdec2(self.value)
  end

  def decrease_str
    return Split.posdec2(-self.value)
  end

  def self.posdec2(bd)
    if not bd.nil? and bd > 0
      parts = bd.to_s.split('.') + ['']
      parts[1] = (parts[1] + '00')[0..1]
      return parts[0..1].join(".")
    else
      return ""
    end
  end
end
