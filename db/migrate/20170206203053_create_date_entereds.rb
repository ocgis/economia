class CreateDateEntereds < ActiveRecord::Migration[5.0]
  def change
    create_table :date_entereds do |t|
      t.datetime :date
      t.integer :ns

      t.timestamps
    end
  end
end
