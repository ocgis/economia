class CreateAccounts < ActiveRecord::Migration[5.2]
  def change
    create_table :accounts, id: :uuid do |t|
      t.string :name
      t.string :description
      t.string :type_
      t.string :commodity_scu
      t.string :code
      t.uuid   :parent_id

      t.string :commodity_id
      t.string :commodity_space

      t.references :book, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
