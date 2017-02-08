class ReconcileDatesController < ApplicationController
  before_action :set_reconcile_date, only: [:show, :edit, :update, :destroy]

  # GET /reconcile_dates
  # GET /reconcile_dates.json
  def index
    @reconcile_dates = ReconcileDate.all
  end

  # GET /reconcile_dates/1
  # GET /reconcile_dates/1.json
  def show
  end

  # GET /reconcile_dates/new
  def new
    @reconcile_date = ReconcileDate.new
  end

  # GET /reconcile_dates/1/edit
  def edit
  end

  # POST /reconcile_dates
  # POST /reconcile_dates.json
  def create
    @reconcile_date = ReconcileDate.new(reconcile_date_params)

    respond_to do |format|
      if @reconcile_date.save
        format.html { redirect_to @reconcile_date, notice: 'Reconcile date was successfully created.' }
        format.json { render :show, status: :created, location: @reconcile_date }
      else
        format.html { render :new }
        format.json { render json: @reconcile_date.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /reconcile_dates/1
  # PATCH/PUT /reconcile_dates/1.json
  def update
    respond_to do |format|
      if @reconcile_date.update(reconcile_date_params)
        format.html { redirect_to @reconcile_date, notice: 'Reconcile date was successfully updated.' }
        format.json { render :show, status: :ok, location: @reconcile_date }
      else
        format.html { render :edit }
        format.json { render json: @reconcile_date.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /reconcile_dates/1
  # DELETE /reconcile_dates/1.json
  def destroy
    @reconcile_date.destroy
    respond_to do |format|
      format.html { redirect_to reconcile_dates_url, notice: 'Reconcile date was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_reconcile_date
      @reconcile_date = ReconcileDate.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def reconcile_date_params
      params.require(:reconcile_date).permit(:date)
    end
end
