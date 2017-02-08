class CreateCurrencies < ActiveRecord::Migration[5.0]
  def change
    create_table :currencies do |t|
      t.string :id_
      t.string :space

      t.timestamps
    end
  end
end
