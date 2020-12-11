class Slot < ApplicationRecord
  belongs_to :etransaction
  belongs_to :account
  belongs_to :slot
  has_many :value_frame, class_name: 'Slot', dependent: :destroy
end
