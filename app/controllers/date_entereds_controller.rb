class DateEnteredsController < ApplicationController
  before_action :set_date_entered, only: [:show, :edit, :update, :destroy]

  # GET /date_entereds
  # GET /date_entereds.json
  def index
    @date_entereds = DateEntered.all
  end

  # GET /date_entereds/1
  # GET /date_entereds/1.json
  def show
  end

  # GET /date_entereds/new
  def new
    @date_entered = DateEntered.new
  end

  # GET /date_entereds/1/edit
  def edit
  end

  # POST /date_entereds
  # POST /date_entereds.json
  def create
    @date_entered = DateEntered.new(date_entered_params)

    respond_to do |format|
      if @date_entered.save
        format.html { redirect_to @date_entered, notice: 'Date entered was successfully created.' }
        format.json { render :show, status: :created, location: @date_entered }
      else
        format.html { render :new }
        format.json { render json: @date_entered.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /date_entereds/1
  # PATCH/PUT /date_entereds/1.json
  def update
    respond_to do |format|
      if @date_entered.update(date_entered_params)
        format.html { redirect_to @date_entered, notice: 'Date entered was successfully updated.' }
        format.json { render :show, status: :ok, location: @date_entered }
      else
        format.html { render :edit }
        format.json { render json: @date_entered.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /date_entereds/1
  # DELETE /date_entereds/1.json
  def destroy
    @date_entered.destroy
    respond_to do |format|
      format.html { redirect_to date_entereds_url, notice: 'Date entered was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_date_entered
      @date_entered = DateEntered.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def date_entered_params
      params.require(:date_entered).permit(:date)
    end
end
