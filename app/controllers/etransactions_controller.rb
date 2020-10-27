require 'pp'

class EtransactionsController < ApplicationController

  load_and_authorize_resource

  before_action :set_etransaction, only: [:show, :edit, :update, :destroy, :add_split, :destroy_split, :update_data]

  # GET /etransactions
  # GET /etransactions.json
  def index
    @etransactions = Etransaction.order("date_posted_date DESC").limit(100).sort_by{|e| e.date_posted_date_sort}
  end

  # GET /etransactions/1
  # GET /etransactions/1.json
  def show
  end

  # GET /etransactions/new
  def new
    @etransaction = Etransaction.new
    @etransaction.save
    redirect_to action: :show, id: @etransaction.id
  end

  # GET /etransactions/1/edit
  def edit
  end

  # POST /etransactions
  # POST /etransactions.json
  def create
    @etransaction = Etransaction.new(etransaction_params)

    respond_to do |format|
      if @etransaction.save
        format.html { redirect_to @etransaction, notice: 'Etransaction was successfully created.' }
        format.json { render :show, status: :created, location: @etransaction }
      else
        format.html { render :new }
        format.json { render json: @etransaction.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /etransactions/1
  # PATCH/PUT /etransactions/1.json
  def update
    respond_to do |format|
      if @etransaction.update(etransaction_params)
        format.html { redirect_to @etransaction, notice: 'Etransaction was successfully updated.' }
        format.json { render :show, status: :ok, location: @etransaction }
      else
        format.html { render :edit }
        format.json { render json: @etransaction.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /etransactions/1
  # DELETE /etransactions/1.json
  def destroy
    @etransaction.destroy
    respond_to do |format|
      format.html { redirect_to etransactions_url, notice: 'Etransaction was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  # PATCH/PUT /etransactions/1/add_split
  # PATCH/PUT /etransactions/1/add_split.json
  def add_split
    respond_to do |format|
      split = Split.new
      @etransaction.splits << split

      format.html { redirect_to @etransaction, notice: 'Split was added.' }
      format.json { render :show, status: :ok, location: @etransaction }
    end
  end

  # DELETE /etransactions/1/destroy_split
  # DELETE /etransactions/1/destroy_split.json
  def destroy_split
    respond_to do |format|
      split = Split.find(params[:split_id])
      split.destroy

      format.html { redirect_to @etransaction, notice: 'Split was destroyed.' }
      format.json { render :show, status: :ok, location: @etransaction }
    end
  end

  def update_data
    data = JSON.parse params[:data]

    add_ids = []
    splits_ids = []
    splits_data = []
    data.each do |row|
      # FIXME: Only update if something was changed
      if not row.include? 'split_id' then
        split = Split.new()
        @etransaction.splits << split
        row["split_id"] = split.id.to_s
        add_ids.append(split.id)
      elsif row['id'] == 0
        @etransaction.description = row["description"]
        @etransaction.num = row["number"]
        @etransaction.date_posted_date = DateTime.parse(row["date"])
        @etransaction.save
      else
        increase = row['increase'].nil? ? 0 : row['increase']
        decrease = row['decrease'].nil? ? 0 : row['decrease']
        v_q = BigDecimal(increase) - BigDecimal(decrease)
        row['increase'] = Split.posdec2(v_q)
        row['decrease'] = Split.posdec2(-v_q)
        account = Account.find_by_full_name(row['account'])
        if not account.nil? then
          account_id = account.id
        else
          account_id = nil
        end
        splits_ids.append(row['split_id'].to_i)
        splits_data.append({memo: row['description'],
                            reconciled_state: row['reconciled'],
                            value: v_q,
                            quantity: v_q,
                            action: '',
                            account_id: account_id,
                           })
      end
    end
    delete_ids = []
    @etransaction.splits.each do |split|
      if not (add_ids + splits_ids).include? split.id then
        delete_ids.append(split.id)
      end
    end
    Split.destroy(delete_ids)
    Split.update(splits_ids, splits_data)

    # FIXME: Handle deleted rows

    render :json => data
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_etransaction
      @etransaction = Etransaction.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def etransaction_params
      params.require(:etransaction).permit(:id_, :description, :num, :currency_id_, :currency_space, :date_entered_date, :date_entered_ns, :date_posted_date, :date_posted_ns, :split_id, splits_attributes: [:id, :id_, :memo, :reconciled_state, :value, :quantity, :action, :reconcile_date_date, :reconcile_date_ns, :account_id, :_destroy])
    end
end
