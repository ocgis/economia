# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170210172507) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accounts", force: :cascade do |t|
    t.string   "name"
    t.string   "description"
    t.string   "type_"
    t.string   "id_"
    t.string   "commodity_scu"
    t.string   "code"
    t.string   "parent"
    t.integer  "account_parent_id"
    t.string   "commodity_id_"
    t.string   "commodity_space"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "commodities", force: :cascade do |t|
    t.string   "space"
    t.string   "name"
    t.string   "id_"
    t.integer  "xcode"
    t.integer  "fraction"
    t.string   "get_quotes"
    t.string   "quote_source"
    t.string   "quote_tz"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "etransactions", force: :cascade do |t|
    t.string   "id_"
    t.string   "description"
    t.string   "num"
    t.string   "currency_id_"
    t.string   "currency_space"
    t.datetime "date_entered_date"
    t.integer  "date_entered_ns"
    t.datetime "date_posted_date"
    t.integer  "date_posted_ns"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
  end

  create_table "prices", force: :cascade do |t|
    t.string   "id_"
    t.string   "source"
    t.string   "value"
    t.string   "commodity_id_"
    t.string   "commodity_space"
    t.string   "currency_id_"
    t.string   "currency_space"
    t.datetime "time_date"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "slots", force: :cascade do |t|
    t.string   "key"
    t.string   "value"
    t.date     "value_gdate"
    t.string   "value_slot_key"
    t.string   "value_slot_value"
    t.string   "value_slot_value_slot_key"
    t.string   "value_slot_value_slot_value"
    t.integer  "etransaction_id"
    t.integer  "account_id"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.index ["account_id"], name: "index_slots_on_account_id", using: :btree
    t.index ["etransaction_id"], name: "index_slots_on_etransaction_id", using: :btree
  end

  create_table "splits", force: :cascade do |t|
    t.string   "id_"
    t.string   "memo"
    t.string   "reconciled_state"
    t.decimal  "value"
    t.decimal  "quantity"
    t.string   "action"
    t.datetime "reconcile_date_date"
    t.integer  "reconcile_date_ns"
    t.integer  "account_id"
    t.integer  "etransaction_id"
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
    t.index ["account_id"], name: "index_splits_on_account_id", using: :btree
    t.index ["etransaction_id"], name: "index_splits_on_etransaction_id", using: :btree
  end

  add_foreign_key "slots", "accounts"
  add_foreign_key "slots", "etransactions"
  add_foreign_key "splits", "accounts"
  add_foreign_key "splits", "etransactions"
end
