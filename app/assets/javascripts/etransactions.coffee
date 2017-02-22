# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
jQuery ->
  $('.best_in_place').best_in_place()
jQuery ->
  $('.datePicker').datepicker()
jQuery ->
  $('.datePicker').datepicker("option", "dateFormat", "yy-mm-dd")
jQuery ->
  $('.datePicker').each(->
                        value = $(@).attr('value')
                        $(@).datepicker('setDate', value))
