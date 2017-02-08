module UUIDHelper
  def uuid_before_create
    puts "###########################"
    self.uuid = UUID.timestamp_create().to_s
  end
end
