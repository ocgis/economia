class CreateCommodities < ActiveRecord::Migration[4.2]
  def change
    create_table :commodities, primary_key: [:id, :space], id: false do |t|
      t.string :id
      t.string :space
      t.string :name
      t.string :xcode
      t.integer :fraction
      t.string :get_quotes
      t.string :quote_source
      t.string :quote_tz

      t.references :book, foreign_key: true, type: :uuid

      t.timestamps
    end
    add_index :commodities, ["id", "space", "book_id"], :unique => true
  end
end
