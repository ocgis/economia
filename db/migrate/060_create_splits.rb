class CreateSplits < ActiveRecord::Migration[5.0]
  def change
    create_table :splits, id: :uuid do |t|
      t.string :memo
      t.string :reconciled_state
      t.decimal :value
      t.decimal :quantity
      t.string :action
      t.datetime :reconcile_date
      t.references :account, foreign_key: true, type: :uuid
      t.references :etransaction, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
