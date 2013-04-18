webdriver = require("wd")
assert = require("assert")

#browser = webdriver.remote(
#  "ondemand.saucelabs.com"
#  , 80
#  , "mikeymckay"
#  , "77c2e8cf-91e9-47fa-8258-4667f032e9d0"
#)

browser = webdriver.remote(
  "127.0.0.1"
  , 4443
)

#Makes nice colors
browser.on 'status', (info) ->
  console.log('\x1b[36m%s\x1b[0m', info)

browser.on 'command', (meth, path) ->
  console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path)

browserOptions =
  browserName: 'Android'
  platform: 'Android'
  version: '4'
  deviceType: 'tablet'

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
  browser.get "http://databases.tangerinecentral.org/tangerine/_design/ojai/index.html", ->
    #dumpSource browser, ->
    browser.waitForElementByCssSelector "#name", "1000", ->
      fillElementByCss "#name","tangerine", browser, ->
        fillElementByCss "#pass",passwords["admin"], browser, ->
          clickElementByCss "button.login", browser, ->
            browser.waitForElementByCssSelector "div.GroupsView", "1000", ->
              callback()

passwords = require('./passwords.json')

browser.init browserName: "chrome", ->
  loginAsAdmin browser, ->
    browser.get "http://tangerine:tangytangerine@databases.tangerinecentral.org/group-sweetgroup/_design/ojai/index.html#assessments", ->
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
