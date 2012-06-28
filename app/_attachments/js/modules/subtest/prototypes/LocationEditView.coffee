class LocationEditView extends Backbone.View

  initialize: ( options ) ->
    @model = options.model

  save: ->
    @model.set
      "provinceText" : @$el.find("#subtest_province_text").val()
      "districtText" : @$el.find("#subtest_district_text").val()
      "nameText"     : @$el.find("#subtest_name_text").val()
      "schoolIdText" : @$el.find("#subtest_school_id_text").val()

  render: ->
    provinceText = @model.get("provinceText") || ""
    districtText = @model.get("districtText") || ""
    nameText     = @model.get("nameText")     || ""
    schoolIdText = @model.get("schoolIdText") || ""

    @$el.html "
      <div class='label_value'>
        <label for='subtest_province_text'>&quot;Province&quot; label</label>
        <input id='subtest_province_text' value='#{provinceText}'>
      </div>
      <div class='label_value'>
        <label for='subtest_district_text'>&quot;District&quot; label</label>
        <input id='subtest_district_text' value='#{districtText}'>
      </div>
      <div class='label_value'>
        <label for='subtest_name_text'>&quot;School Name&quot; label</label>
        <input id='subtest_name_text' value='#{nameText}'>
      </div>
      <div class='label_value'>
        <label for='subtest_school_id_text'>&quot;School ID&quot; label</label>
        <input id='subtest_school_id_text' value='#{schoolIdText}'>
      </div>
    " 

