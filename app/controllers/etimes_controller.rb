class EtimesController < ApplicationController
  before_action :set_etime, only: [:show, :edit, :update, :destroy]

  # GET /etimes
  # GET /etimes.json
  def index
    @etimes = Etime.all
  end

  # GET /etimes/1
  # GET /etimes/1.json
  def show
  end

  # GET /etimes/new
  def new
    @etime = Etime.new
  end

  # GET /etimes/1/edit
  def edit
  end

  # POST /etimes
  # POST /etimes.json
  def create
    @etime = Etime.new(etime_params)

    respond_to do |format|
      if @etime.save
        format.html { redirect_to @etime, notice: 'Etime was successfully created.' }
        format.json { render :show, status: :created, location: @etime }
      else
        format.html { render :new }
        format.json { render json: @etime.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /etimes/1
  # PATCH/PUT /etimes/1.json
  def update
    respond_to do |format|
      if @etime.update(etime_params)
        format.html { redirect_to @etime, notice: 'Etime was successfully updated.' }
        format.json { render :show, status: :ok, location: @etime }
      else
        format.html { render :edit }
        format.json { render json: @etime.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /etimes/1
  # DELETE /etimes/1.json
  def destroy
    @etime.destroy
    respond_to do |format|
      format.html { redirect_to etimes_url, notice: 'Etime was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_etime
      @etime = Etime.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def etime_params
      params.require(:etime).permit(:date)
    end
end
