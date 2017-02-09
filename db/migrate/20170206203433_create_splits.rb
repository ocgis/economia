class CreateSplits < ActiveRecord::Migration[5.0]
  def change
    create_table :splits do |t|
      t.string :id_
      t.string :memo
      t.string :reconciled_state
      t.string :value
      t.string :quantity
      t.string :account
      t.string :action

      t.datetime :reconcile_date_date
      
      t.timestamps
    end
  end
end
