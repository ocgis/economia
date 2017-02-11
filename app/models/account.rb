# coding: utf-8
class Account < ApplicationRecord
  has_many :splits
  has_many :slots

  def increase_name
    if self.type_ == "LIABILITY"
      return "Öka"
    elsif self.type_ == "CASH"
      return "Spendera"
    elsif self.type_ == "EXPENSE"
      return "Återbäring"
    elsif self.type_ == "BANK"
      return "Uttag"
    else
      return "FIXME: Implement increase_name for #{self.type_}"
    end
  end

  def decrease_name
    if self.type_ == "LIABILITY"
      return "Minska"
    elsif self.type_ == "CASH"
      return "Ta emot"
    elsif self.type_ == "EXPENSE"
      return "Kostnad"
    elsif self.type_ == "BANK"
      return "Insättning"
    else
      return "FIXME: Implement decrease_name for #{self.type_}"
    end
  end

end
