class CreateSlots < ActiveRecord::Migration[5.0]
  def change
    create_table :slots do |t|
      t.string :key
      t.integer :value_integer
      t.string :value_string
      t.date :value_gdate
      t.references :book, foreign_key: true, type: :uuid
      t.references :account, foreign_key: true, type: :uuid
      t.references :etransaction, foreign_key: true, type: :uuid
      t.references :slot, foreign_key: true

      t.timestamps
    end
  end
end
