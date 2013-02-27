#webdriver = require("wd-zombie")
webdriver = require("wd")
assert = require("assert")

#browser = webdriver.remote()
browser = webdriver.remote(
  "127.0.0.1"
  , 4443
)

isTextShown = (textToLookFor, browser, callback) ->
  browser.elementByTagName "body", (err,element) ->
    if err?
      console.log err
      return
    element.textPresent textToLookFor, (error, textPresent) ->
      assert.ok textPresent, "'#{textToLookFor}' was not found"
      callback()

fillElementByCss = (css,text,browser,callback) ->
  browser.elementByCss css, (err,element) ->
    if err?
      console.log err
      return
    browser.type element,text, ->
      callback()

clickElementByCss = (css,browser,callback) ->
  browser.elementByCssSelector css, (err,element) ->
    if err?
      console.log "Error clicking on #{css} + #{err}"
      console.log err
      return
    browser.clickElement element, ->
      callback()

dumpSource = (browser, callback) ->
  browser.eval "document.getElementsByTagName('html')[0].innerHTML", (err,result) ->
    console.log result
    callback()

loginAsAdmin = (browser, callback) ->
  isTextShown "name", browser, ->
    fillElementByCss "#name","admin", browser, ->
      fillElementByCss "#pass",passwords["admin"], browser, ->
        clickElementByCss "button.login", browser, ->
          browser.waitForElementByCssSelector "h1", "1000", ->
            isTextShown "Assessments", browser, ->
              callback()

passwords = require('./passwords.json')

#browser.init browserName: "zombie", ->
browser.init browserName: "chrome", ->
  browser.get "http://localhost:5984/tangerine/_design/tangerine/index.html", ->
    loginAsAdmin browser, ->
      clickElementByCss "img[data-doc-id='Example_English_EGRA_May_2011.Assessment']", browser, ->
        browser.waitForElementByCssSelector "h2:contains('Date and Time')", "1000", ->
          clickElementByCss "button.next", browser, ->
            browser.waitForElementByCssSelector "h2:contains('Student ID')", "1000", ->
              clickElementByCss "button#generate", browser, ->
                clickElementByCss "button.next", browser, ->
                  fillElementByCss "#level_0","a", browser, ->
                    browser.waitForElementByCssSelector "ul#school_list_0 li", "1000", ->
                      clickElementByCss "ul#school_list_0 li", browser, ->
                        clickElementByCss "button.next", browser, ->
                          browser.waitForElementByCssSelector "span:contains('Yes, continue')", browser, ->
                            browser.eval "$(\"span:contains('Yes, continue')\").click()", (err,result) ->
                              clickElementByCss "button.next", browser, ->
                                browser.waitForElementByCssSelector "h2:contains('Student Information')", browser, ->
                                  #Clicks every radio button - but ends with last of each
                                  browser.eval "$(\"div.question input\").click()", ->
                                    clickElementByCss "button.next", browser, ->



#                            browser.close ->
#                              browser.quit()
# dumpSource browser, ->
