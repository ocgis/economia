class ChangeCommodityIdName < ActiveRecord::Migration[6.0]
  def change
    rename_column :commodities, :id, :id_
  end
end
