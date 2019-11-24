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

end
