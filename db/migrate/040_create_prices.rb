class CreatePrices < ActiveRecord::Migration[5.0]
  def change
    create_table :prices, id: :uuid do |t|
      t.string :source
      t.decimal :value

      t.string :type_

      t.string :commodity_id
      t.string :commodity_space
 
      t.string :currency_id
      t.string :currency_space

      t.references :book, foreign_key: true, type: :uuid

      t.datetime :time
      
      t.timestamps
    end
  end
end
