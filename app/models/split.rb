# frozen_string_literal: true

# Implementation of the split model
class Split < ApplicationRecord
  belongs_to :account, optional: true
  belongs_to :etransaction
end
