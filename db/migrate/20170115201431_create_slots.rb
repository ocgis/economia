class CreateSlots < ActiveRecord::Migration
  def change
    create_table :slots do |t|
      t.string :key
      t.string :value

      t.date :value_gdate
      
      t.string :value_slot_key
      t.string :value_slot_value
      
      t.string :value_slot_value_slot_key
      t.string :value_slot_value_slot_value

      t.timestamps
    end
  end
end
