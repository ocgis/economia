class CreatePrices < ActiveRecord::Migration[5.0]
  def change
    create_table :prices, id: :uuid do |t|
      t.string :source
      t.string :value

      t.string :commodity_id
      t.string :commodity_space
 
      t.string :currency_id
      t.string :currency_space

      t.datetime :time_date
      
      t.timestamps
    end
  end
end
