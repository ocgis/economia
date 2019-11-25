class Split < ApplicationRecord
  belongs_to :account
  belongs_to :etransaction

  def other_account
    splits = self.etransaction.splits.reject { |a| a == self }

    if splits.size > 1
      return "-- Delad transaktion --"
    elsif splits.size == 0
      return ""
    else
      return splits[0].account.full_name
    end
  end

  def account_full_name
    if not self.account_id.nil? then
      return self.account.full_name
    else
      return ""
    end
  end

  def value_safe
    if not self.value.nil?
      return self.value
    else
      return BigDecimal(0)
    end
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
