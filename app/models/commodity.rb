require 'uuidtools'

class Commodity < ActiveRecord::Base
  before_create :uuid_before_create

  def uuid_before_create
    self.uuid = UUIDTools::UUID.timestamp_create().to_s
  end
end
