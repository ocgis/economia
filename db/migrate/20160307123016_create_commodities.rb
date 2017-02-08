class CreateCommodities < ActiveRecord::Migration
  def change
    create_table :commodities do |t|
      t.string :uuid, limit: 36, primary: true, null: false
      t.string :space
      t.string :name
      t.string :id_
      t.integer :xcode
      t.integer :fraction
      t.string :get_quotes
      t.string :quote_source
      t.string :quote_tz

      t.timestamps
    end
  end
end
