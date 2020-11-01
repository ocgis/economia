# coding: utf-8
class Account < ApplicationRecord
  belongs_to :account_parent, :class_name => 'Account', :foreign_key => :account_parent_id
  has_many :account_children, :class_name => 'Account'

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

  def full_name
    accounts_map = {}
    Account.all.each do |account|
      accounts_map[account.id] = account
    end

    return self.full_name_by_map(accounts_map)
  end

  def self.full_name_map
    all_accounts = Account.all
    accounts_map = {}
    all_accounts.each do |account|
      accounts_map[account.id] = account
    end

    full_name_map = {}
    all_accounts.each do |account|
      full_name_map[account.id] = account.full_name_by_map(accounts_map)
    end
    return full_name_map
  end

  def full_name_by_map(accounts_map)
    if self.account_parent_id == nil
      return self.name
    else
      parent_name = accounts_map[self.account_parent_id].full_name_by_map(accounts_map)
      if parent_name == "Root Account"
        return self.name
      else
        return "#{parent_name}:#{self.name}"
      end
    end
  end

  def self.find_by_full_name(full_name)
    if not full_name.nil?
      name = full_name.split(":")[-1]
      candidates = Account.where(name: name)
      candidates.each do |candidate|
        if candidate.full_name == full_name then
          return candidate
        end
      end
    end
    return nil
  end


end
