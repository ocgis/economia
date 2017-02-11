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
end
