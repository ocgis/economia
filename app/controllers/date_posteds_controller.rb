class DatePostedsController < ApplicationController
  before_action :set_date_posted, only: [:show, :edit, :update, :destroy]

  # GET /date_posteds
  # GET /date_posteds.json
  def index
    @date_posteds = DatePosted.all
  end

  # GET /date_posteds/1
  # GET /date_posteds/1.json
  def show
  end

  # GET /date_posteds/new
  def new
    @date_posted = DatePosted.new
  end

  # GET /date_posteds/1/edit
  def edit
  end

  # POST /date_posteds
  # POST /date_posteds.json
  def create
    @date_posted = DatePosted.new(date_posted_params)

    respond_to do |format|
      if @date_posted.save
        format.html { redirect_to @date_posted, notice: 'Date posted was successfully created.' }
        format.json { render :show, status: :created, location: @date_posted }
      else
        format.html { render :new }
        format.json { render json: @date_posted.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /date_posteds/1
  # PATCH/PUT /date_posteds/1.json
  def update
    respond_to do |format|
      if @date_posted.update(date_posted_params)
        format.html { redirect_to @date_posted, notice: 'Date posted was successfully updated.' }
        format.json { render :show, status: :ok, location: @date_posted }
      else
        format.html { render :edit }
        format.json { render json: @date_posted.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /date_posteds/1
  # DELETE /date_posteds/1.json
  def destroy
    @date_posted.destroy
    respond_to do |format|
      format.html { redirect_to date_posteds_url, notice: 'Date posted was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_date_posted
      @date_posted = DatePosted.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def date_posted_params
      params.require(:date_posted).permit(:date)
    end
end
