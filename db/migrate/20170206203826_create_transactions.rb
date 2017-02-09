class CreateTransactions < ActiveRecord::Migration[5.0]
  def change
    create_table :transactions do |t|
      t.string :id_
      t.string :description
      t.string :num

      t.string :currency_id_
      t.string :currency_space

      t.datetime :date_entered_date
      t.string :date_entered_ns

      t.datetime :date_posted_date
      
      t.timestamps
    end
  end
end
