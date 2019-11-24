class Etransaction < ApplicationRecord
  has_many :slots, dependent: :destroy
  has_many :splits, dependent: :destroy
  accepts_nested_attributes_for :splits, allow_destroy: true

  def date_posted_date_str
    if not self.date_posted_date.nil? then
      return self.date_posted_date.strftime("%Y-%m-%d")
    else
      return ""
    end
  end

  def date_posted_date_sort
    if not self.date_posted_date.nil? then
      return self.date_posted_date
    else
      return DateTime.now
    end
  end
end
