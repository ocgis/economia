class AddTypeToPrices < ActiveRecord::Migration[6.0]
  def change
    add_column :prices, :type_, :string
  end
end
