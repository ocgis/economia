class CreateBooks < ActiveRecord::Migration[6.0]
  def change
    create_table :books, id: :uuid do |t|
      t.string :description
      t.string :filename
      
      t.timestamps
    end
  end
end
