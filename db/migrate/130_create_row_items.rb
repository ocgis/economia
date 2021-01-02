class CreateRowItems < ActiveRecord::Migration[6.0]
  def change
    create_table :row_items, id: :uuid do |t|
      t.references :row, foreign_key: true, type: :uuid
      t.references :item, type: :uuid, polymorphic: true
      
      t.timestamps
    end
  end
end
