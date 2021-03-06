# coding: utf-8
class Account < ApplicationRecord
  belongs_to :book
  belongs_to :account_parent, :class_name => 'Account', :foreign_key => :parent_id
  has_many :account_children, :class_name => 'Account', foreign_key: :parent_id
  belongs_to :commodity, foreign_key: [:commodity_id, :commodity_space, :book_id]
  has_many :splits, dependent: :delete_all
  has_many :slots, dependent: :destroy


  def full_name
    accounts_map = {}
    book.accounts.all.each do |account|
      accounts_map[account.id] = account
    end

    return self.full_name_by_map(accounts_map)
  end


  def self.accounts_map
    accounts_map = {}
    all.each do |account|
      accounts_map[account.id] = account
    end

    account_attrs_map = {}
    all.each do |account|
      account_attrs_map[account.id] = account.attributes.update(full_name: account.full_name_by_map(accounts_map))
    end
    return account_attrs_map
  end


  def self.full_name_map
    all_accounts = all
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
    if self.parent_id == nil
      return self.name
    else
      parent_name = accounts_map[self.parent_id].full_name_by_map(accounts_map)
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


  def self.get_default_commodity
    commodity_list_sorted = all.group_by{ |account| { space: account.commodity_space, id: account.commodity_id} }.each_pair.sort{ |a, b| b[1].size <=> a[1].size }
    if commodity_list_sorted.size >= 1
      return commodity_list_sorted[0][0]
    else
      return { space: nil, id: nil }
    end
  end


end
