class CreateReports < ActiveRecord::Migration[6.0]
  def change
    create_table :reports, id: :uuid do |t|
      t.string :name
      t.references :book, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
