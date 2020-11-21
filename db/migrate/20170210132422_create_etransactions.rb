class CreateEtransactions < ActiveRecord::Migration[5.0]
  def change
    create_table :etransactions, id: :uuid do |t|
      t.string :description
      t.string :num
      t.string :currency_id
      t.string :currency_space
      t.datetime :date_posted

      t.timestamps
    end
  end
end
