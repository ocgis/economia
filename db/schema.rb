# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2022_08_03_154205) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "accounts", id: :uuid, default: -> { "public.gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.string "type_"
    t.string "commodity_scu"
    t.string "code"
    t.uuid "parent_id"
    t.string "commodity_id"
    t.string "commodity_space"
    t.uuid "book_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["book_id"], name: "index_accounts_on_book_id"
  end

  create_table "books", id: :uuid, default: -> { "public.gen_random_uuid()" }, force: :cascade do |t|
    t.string "description"
    t.string "filename"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "commodities", id: false, force: :cascade do |t|
    t.string "id_"
    t.string "space"
    t.string "name"
    t.string "xcode"
    t.integer "fraction"
    t.string "get_quotes"
    t.string "quote_source"
    t.string "quote_tz"
    t.uuid "book_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["id_", "space", "book_id"], name: "index_commodities_on_id__and_space_and_book_id", unique: true
  end

  create_table "etransactions", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.string "description"
    t.string "num"
    t.string "currency_id"
    t.string "currency_space"
    t.datetime "date_posted", precision: nil
    t.uuid "book_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["book_id"], name: "index_etransactions_on_book_id"
  end

  create_table "prices", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.string "source"
    t.decimal "value"
    t.string "type_"
    t.string "commodity_id"
    t.string "commodity_space"
    t.string "currency_id"
    t.string "currency_space"
    t.uuid "book_id"
    t.datetime "time", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["book_id"], name: "index_prices_on_book_id"
  end

  create_table "reports", id: :uuid, default: -> { "public.gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.uuid "book_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_id"], name: "index_reports_on_book_id"
  end

  create_table "row_items", id: :uuid, default: -> { "public.gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "row_id"
    t.string "item_type"
    t.uuid "item_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["item_type", "item_id"], name: "index_row_items_on_item_type_and_item_id"
    t.index ["row_id"], name: "index_row_items_on_row_id"
  end

  create_table "rows", id: :uuid, default: -> { "public.gen_random_uuid()" }, force: :cascade do |t|
    t.string "kind"
    t.string "title"
    t.integer "index"
    t.uuid "report_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["report_id"], name: "index_rows_on_report_id"
  end

  create_table "slots", id: :serial, force: :cascade do |t|
    t.string "key"
    t.integer "value_integer"
    t.string "value_string"
    t.date "value_gdate"
    t.uuid "book_id"
    t.uuid "account_id"
    t.uuid "etransaction_id"
    t.integer "slot_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["account_id"], name: "index_slots_on_account_id"
    t.index ["book_id"], name: "index_slots_on_book_id"
    t.index ["etransaction_id"], name: "index_slots_on_etransaction_id"
    t.index ["slot_id"], name: "index_slots_on_slot_id"
  end

  create_table "splits", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.string "memo"
    t.string "reconciled_state"
    t.decimal "value"
    t.decimal "quantity"
    t.string "action"
    t.datetime "reconcile_date", precision: nil
    t.uuid "account_id"
    t.uuid "etransaction_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["account_id"], name: "index_splits_on_account_id"
    t.index ["etransaction_id"], name: "index_splits_on_etransaction_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at", precision: nil
    t.datetime "remember_created_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "provider"
    t.string "uid"
    t.integer "roles_mask"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "accounts", "books"
  add_foreign_key "commodities", "books"
  add_foreign_key "etransactions", "books"
  add_foreign_key "prices", "books"
  add_foreign_key "reports", "books"
  add_foreign_key "row_items", "rows"
  add_foreign_key "rows", "reports"
  add_foreign_key "slots", "accounts"
  add_foreign_key "slots", "books"
  add_foreign_key "slots", "etransactions"
  add_foreign_key "slots", "slots"
  add_foreign_key "splits", "accounts"
  add_foreign_key "splits", "etransactions"
end
