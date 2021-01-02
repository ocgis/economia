class CreateRows < ActiveRecord::Migration[6.0]
  def change
    create_table :rows, id: :uuid do |t|
      t.string :kind
      t.string :title
      t.integer :index
      t.references :report, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
