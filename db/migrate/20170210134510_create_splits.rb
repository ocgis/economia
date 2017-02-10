class CreateSplits < ActiveRecord::Migration[5.0]
  def change
    create_table :splits do |t|
      t.string :id_
      t.string :memo
      t.string :reconciled_state
      t.decimal :value
      t.decimal :quantity
      t.string :account_id_
      t.string :action
      t.datetime :reconcile_date_date
      t.integer :reconcile_date_ns
      t.references :account, foreign_key: true
      t.references :etransaction, foreign_key: true

      t.timestamps
    end
  end
end
