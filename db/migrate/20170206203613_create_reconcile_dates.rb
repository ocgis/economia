class CreateReconcileDates < ActiveRecord::Migration[5.0]
  def change
    create_table :reconcile_dates do |t|
      t.datetime :date
      t.integer :ns

      t.timestamps
    end
  end
end
