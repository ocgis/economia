class Api::V1::BooksController < ApplicationController

  load_and_authorize_resource

  before_action :set_book, only: [:show]

  def index
    books = Book.all.map do |book|
      book.attributes
    end

    render json: { books: books }
  end

  def show
    book = @book.attributes
    render json: { book: book }
  end

  private

  def set_book
    @book = Book.find(params[:id])
  end

end
