class Etransaction < ApplicationRecord
  has_many :slots, dependent: :destroy
  has_many :splits, dependent: :delete_all
  belongs_to :currency, class_name: 'Commodity', foreign_key: [:currency_id, :currency_space, :book_id]
  accepts_nested_attributes_for :splits, allow_destroy: true

  def date_posted_str
    if not self.date_posted.nil? then
      return self.date_posted.strftime("%Y-%m-%d")
    else
      return ""
    end
  end

  def date_posted_sort
    if not self.date_posted.nil? then
      return self.date_posted
    else
      return DateTime.now
    end
  end
end
