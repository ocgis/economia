# frozen_string_literal: true

# Implementation of the commodity model
class Commodity < ApplicationRecord
  self.primary_keys = :id_, :space, :book_id

  def self.commodities_map
    commodities_map = {}
    all.each do |commodity|
      id = "#{commodity.id_}_#{commodity.space}"
      commodities_map[id] = commodity.attributes
    end
    commodities_map
  end
end
