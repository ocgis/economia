class CreateTransactions < ActiveRecord::Migration[5.0]
  def change
    create_table :transactions do |t|
      t.string :id_
      t.string :description
      t.string :num

      t.timestamps
    end
  end
end
