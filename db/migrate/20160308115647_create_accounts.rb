class CreateAccounts < ActiveRecord::Migration[4.2]
  def change
    create_table :accounts do |t|
      t.string :name
      t.string :description
      t.string :type_
      t.string :id_
      t.string :commodity_scu
      t.string :code
      t.string :parent
      t.integer :account_parent_id

      t.string :commodity_id_
      t.string :commodity_space

      t.timestamps
    end
  end
end
