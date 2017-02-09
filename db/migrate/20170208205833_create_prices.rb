class CreatePrices < ActiveRecord::Migration[5.0]
  def change
    create_table :prices do |t|
      t.string :id_
      t.string :source
      t.string :value

      t.string :commodity_id_
      t.string :commodity_space
 
      t.string :currency_id_
      t.string :currency_space

      t.datetime :time_date
      
      t.timestamps
    end
  end
end
