class CreateValues < ActiveRecord::Migration
  def change
    create_table :values do |t|
      t.date :gdate

      t.timestamps
    end
  end
end
