class CreateDatePosteds < ActiveRecord::Migration[5.0]
  def change
    create_table :date_posteds do |t|
      t.datetime :date
      t.integer :ns

      t.timestamps
    end
  end
end
