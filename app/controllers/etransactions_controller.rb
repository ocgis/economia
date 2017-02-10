class EtransactionsController < ApplicationController
  before_action :set_etransaction, only: [:show, :edit, :update, :destroy]

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

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_etransaction
      @etransaction = Etransaction.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def etransaction_params
      params.require(:etransaction).permit(:id_, :description, :num, :currency_id_, :currency_space, :date_entered_date, :date_entered_ns, :date_posted_date, :date_posted_ns)
    end
end
