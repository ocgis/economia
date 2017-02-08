class CreateAccounts < ActiveRecord::Migration
  def change
    create_table :accounts do |t|
      t.string :name
      t.string :description
      t.string :type_
      t.string :id_
      t.string :commodity
      t.string :commodity_scu
      t.string :code
      t.string :parent

      t.timestamps
    end
  end
end
