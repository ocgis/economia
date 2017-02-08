class CreateEtimes < ActiveRecord::Migration[5.0]
  def change
    create_table :etimes do |t|
      t.datetime :date

      t.timestamps
    end
  end
end
