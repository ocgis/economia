require 'pp'

class EtransactionsController < ApplicationController
  before_action :set_etransaction, only: [:show, :edit, :update, :destroy, :add_split, :destroy_split, :update_data]

  # GET /etransactions
  # GET /etransactions.json
  def index
    @etransactions = Etransaction.all
  end

  # GET /etransactions/1
  # GET /etransactions/1.json
  def show
  end

  # GET /etransactions/new
  def new
    @etransaction = Etransaction.new
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

    splits_ids = []
    splits_data = []
    data.each do |row|
      # FIXME: Only update if something was changed
      if row['id'] == 0
        @etransaction.description = row["description"]
        @etransaction.num = row["number"]
        @etransaction.date_posted_date = DateTime.parse(row["date"])
        @etransaction.save
      else # FIXME: Handle new splits
        v_q = BigDecimal(row['increase']) - BigDecimal(row['decrease'])
        account_id = Account.find_by_full_name(row['account']).id
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
    Split.update(splits_ids, splits_data)

    # FIXME: Handle deleted rows
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
