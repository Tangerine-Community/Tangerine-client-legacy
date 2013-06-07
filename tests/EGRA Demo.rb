# to install:  install ruby from rubyinstaller.org
# select global path option, (tick options 2 & 3)
# open cmd;  gem install --no-rdoc --no-ri selenium-webdriver capybara
# install chromedriver (NOT chromedriver2!!) from:
# https://code.google.com/p/chromedriver/downloads/detail?name=chromedriver_win_26.0.1383.0.zip&can=2&q=
# copy chromedriver.exe into C:\Ruby193\bin directory

# Capybara is a language for controlling your web browser
# The documentation for Capybara is here: https://github.com/jnicklas/capybara#the-dsl


require 'rubygems'
require 'selenium-webdriver'
require 'capybara'
require 'capybara/dsl'

Capybara.register_driver :selenium do |app|
  Capybara::Selenium::Driver.new(app, :browser => :chrome)
end

Capybara.run_server = false
Capybara.current_driver = :selenium

include Capybara::DSL

#
# This section is for common actions that can be reused
#
#
def login
  visit("http://databases.tangerinecentral.org/tangerine/_design/ojai/index.html")
  fill_in('User name', :with => 'tangerine')
  fill_in('Password', :with => 'tangytangerine')
  click_button('Login')
  # Checking for content causes the browser to wait until it's there
  has_content?("Groups")
end

def local_login
  visit("http://localhost:5984/tangerine/_design/ojai/index.html")
  fill_in('User name', :with => 'admin')
  fill_in('Password', :with => 'password')
  click_button('Login')
end

def visit_group(group_name)
  # Note that #{} is how you insert a variable into a string
  visit("http://databases.tangerinecentral.org/group-sweetgroup/_design/ojai/index.html#assessments")
  has_content?("Assessments")
end

def loca_visit_group(group_name)
visit("http://databases.tangerinecentral.org/group-sweetgroup/_design/ojai/index.html#assessments")
  has_content?("Assessments")
end

def run_assessment(assessment_name)
  # Executes javascript on the page
  # I could've done this with capybara functions but it was really slow
  # find a span element that contains the text [assessment_name] and click on it
  page.execute_script("$('span:contains(#{assessment_name})').click()")

  # find an image element with the class run that is visible and click on it
  page.execute_script("$('img.run:visible').click()")
end

def click_with_javascript(css_selector)
 page.execute_script("$('#{css_selector}').click()")
end


def home_location
#Completes the Home Location instrument
has_content? ("Home Location")
fill_in('Region', :with => 'Practice')
  fill_in('District', :with => 'District')
	fill_in('Village', :with => 'Village')
  click_button('Next')
end

def child_information
has_content? "How old are you?"
click_with_javascript("#question-age div[data-value=15]")
has_content? "What grade are you in"
click_with_javascript("#question-grade div[data-value=5]")
has_content? "Is the participant a girl?"
click_with_javascript("#question-female div[data-value=1]")
click_button "Next"
end

def grid_question
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=4]")
sleep 1
click_button "Stop"
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=4]")
click_button "Next"
end

def grid_autostop
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=1]")
click_with_javascript ("#prototype_wrapper div[data-index=2]")
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=3]")
end


def reading_comprehension
click_with_javascript ("#question-read_comp1 div[data-value=0]")
click_with_javascript ("#question-read_comp2 div[data-value=0]")
click_with_javascript ("#question-read_comp3 div[data-value=0]")
click_with_javascript ("#question-read_comp4 div[data-value=0]")
click_with_javascript ("#question-read_comp5 div[data-value=0]")
click_button "Next"
end

# 
#
# This section is where the actual steps happen
#


local_login
sleep 1
#login
#visit_group "sweetgroup"


#This is supposed to be to test custom validation but it is not working so far. Not sure how to fix this.  
#run_assessment("Button test")
#has_content? "All button stuff"
#fill_in('view1303', :with => '50')
#sleep 3
#has_no_content? "words"
#has_content? "Enter a number between 1 and 49"
#fill_in('view1383_age', :with => '4')
#click_button "Next"



#testing if a subtest can be copied to another instrument
page.execute_script("$('span:contains(Button test)').click()")
page.execute_script("$('img.edit:visible').click()")
has_content? "Assessment Builder"
page.execute_script("$('img.icon_copy').click()")
click_button "Copy"
has_content? "Assessment Builder"
sleep 1
page.execute_script("$('img.icon_delete').click()")
click_button "Delete"


#duplicating an assessment
page.execute_script("$('span:contains(simple test ( server ))').click()")
page.execute_script("$('img.duplicate:visible').click()")
has_content? "Copy of simple test ( server )"
page.execute_script("$('span:contains(Copy of simple test ( server ))').click()")
page.execute_script("$('img.assessment_delete:visible').click()")
page.execute_script('$("button.assessment_delete_yes:visible").click()')
sleep 2


#testing if questions can be copied to other assessments 
page.execute_script("$('span:contains(Button test)').click()")
page.execute_script("$('img.edit:visible').click()")
has_content? "Assessment Builder"
page.execute_script("$('img.icon_edit').click()")
has_content? "Subtest Editor"
page.execute_script("$('img.show_copy').click()")
#the last part doesn't work on the local server but it should not be too complicated


#abort and resume w/o randomization
#run_assessment(abortresumetest)
#answer first couple of questions, then hit logout
#page.execute_script("$('span:contains(simple test ( server ))').click()")
#page.execute_script("$('img.results:visible').click()")
#click_button "details"
#click_button "Resume" 
#now finish the rest of the assessment (can't be done on the local server)

#abort and resume w/randomization (need to think about this some) 
#run_assessment(abortresumetest)
#answer first couple of questions, then hit logout
#page.execute_script("$('span:contains(simple test ( server ))').click()")
#page.execute_script("$('img.results:visible').click()")
#click_button "details"
#click_button "Resume" 
#now finish the rest of the assessment




run_assessment "simple test ( server )"

#this checks if you can skip subtest without entering data (both if the skip button is there when it's not supposed to be and if you are able to click next without entering data)
click_button "Next"
has_no_button? "Skip"
home_location


#this checks autostop, returns error if not working
has_content? "words"
grid_autostop
grid_question
click_button "Next"


#test skip logic, this test moves through perfectly if skip logic works, if it doesn't it will return an error
has_content?("survey")
sleep 1
page.execute_script('$("#question-testcase div[data-value=0]").click()')
click_button "Next"

#if AOD - skipping entire subtests isn't working, the program will stop here on Student Information. If fine, it will simply skip over the subtest


#Testing that reading comprehension questions are properly linked to how far the student has read
has_content? "EGRA 3a: Oral Passage Reading"
grid_question
sleep 1
has_no_content? "EGRA 3b: Reading Comprehension"

#testing survey early stop logic, will show error message if not working for has_content? "Assessment complete"
visit_group "sweetgroup"
run_assessment "earlyabort_test"
has_content? "Student_Information"
click_with_javascript("#question-Gender div[data-value=1]")
click_button "Next Question"
has_content? "Assessment complete"




#run through an EGRA assessment


#login (don't include if it's already been done earlier)
visit_group "sweetgroup"
run_assessment "EGRA_demo" 
has_content? "Date and Time"
click_button "Next"
home_location
has_content? "Child ID"
click_button "Generate" 
click_button "Next" 
has_content? "Does the child consent?"
click_with_javascript("#consent_yes")
click_button "Next" 
child_information
has_content? "EGRA 1: Letter Sound Identification"
grid_question
has_content? "EGRA 2: Non-word Reading"
grid_question
has_content? "EGRA 3a: Oral Passage Reading"
grid_question
has_content? "EGRA 3b: Reading Comprehension"
sleep 1
reading_comprehension

sleep 2 
