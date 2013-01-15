class RegisterTeacherView extends Backbone.View

  events :
    'click .register' : 'register'

  initialize: ( options ) ->
    @name = options.name
    @pass = options.pass
    @fields = ["first", "last", "gender", "school", "contact"]

  register: ->

    @validate => @saveUser()

  validate: (callback) ->

    errors = false
    for element in @fields
      if _.isEmpty(@[element].val())
        @$el.find("##{element}_message").html "Please fill out this field."
        errors = true
      else
        @$el.find("##{element}_message").html ""
    if errors 
      Utils.midAlert "Please correct the errors on this page."
    else
      callback()

  saveUser: ->

    userDoc = "name" : @name
    (userDoc[element] = @[element].val()) for element in @fields

    Tangerine.$db.saveDoc $.extend(userDoc, "collection" : "teacher")

    $.couch.signup userDoc, @pass,
      success: =>
        Utils.midAlert "New teacher registered"
        Tangerine.user.login @name, @pass
      error: (error) ->
        Utils.midAlert "Registration error<br>#{error}", 5000


  render: ->
    @$el.html "
      <h1>Register new teacher</h1>
      <table>
        <tr>
          <td class='small_grey'><b>Username</b></td>
          <td class='small_grey'>#{@name}</td>
          <td class='small_grey'><b>Password</b></td>
          <td class='small_grey'>#{("*" for x in @pass).join('')}</td>
        </tr>
      </table>
      <div class='label_value'>
        <label for='first'>First name</label>
        <div id='first_message' class='messages'></div>
        <input id='first'>
      </div>
      <div class='label_value'>
        <label for='last'>Last Name</label>
        <div id='last_message' class='messages'></div>
        <input id='last'>
      </div>
      <div class='label_value'>
        <label for='gender'>Gender</label>
        <div id='gender_message' class='messages'></div>
        <input id='gender'>
      </div>
      <div class='label_value'>
        <label for='school'>School name</label>
        <div id='school_message' class='messages'></div>
        <input id='school'>
      </div>
      <div class='label_value'>
        <label for='contact'>Email address or mobile phone number</label>
        <div id='contact_message' class='messages'></div>
        <input id='contact'>
      </div>
      <button class='register command'>Register</button>
    "
    for element in @fields
      @[element] = @$el.find("#"+element)
    @trigger "rendered"

