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

ActiveRecord::Schema.define(version: 20170208205833) do

  create_table "accounts", force: :cascade do |t|
    t.string   "name"
    t.string   "description"
    t.string   "type_"
    t.string   "id_"
    t.string   "commodity"
    t.string   "commodity_scu"
    t.string   "code"
    t.string   "parent"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "commodities", force: :cascade do |t|
    t.string   "uuid",         limit: 36, null: false
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

  create_table "currencies", force: :cascade do |t|
    t.string   "id_"
    t.string   "space"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "date_entereds", force: :cascade do |t|
    t.datetime "date"
    t.integer  "ns"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "date_posteds", force: :cascade do |t|
    t.datetime "date"
    t.integer  "ns"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "etimes", force: :cascade do |t|
    t.datetime "date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "prices", force: :cascade do |t|
    t.string   "id_"
    t.string   "source"
    t.string   "value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "reconcile_dates", force: :cascade do |t|
    t.datetime "date"
    t.integer  "ns"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "slots", force: :cascade do |t|
    t.string   "key"
    t.string   "value"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "splits", force: :cascade do |t|
    t.string   "id_"
    t.string   "memo"
    t.string   "reconciled_state"
    t.string   "value"
    t.string   "quantity"
    t.string   "account"
    t.string   "action"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  create_table "transactions", force: :cascade do |t|
    t.string   "id_"
    t.string   "description"
    t.string   "num"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "values", force: :cascade do |t|
    t.date     "gdate"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
