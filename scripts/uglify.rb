#!/usr/bin/env ruby

require 'uglifier'
require 'pathname'

$options = {
  :make_lib       => ARGV.delete("lib") != nil,
  :make_app       => ARGV.delete("app") != nil,
  :make_index_dev => ARGV.delete("dev") != nil
}


ARGV.each { |arg|
  if /\.js/.match(arg) then
    $options[:compile] = [] if not $options[:compile]
    $options[:compile] << arg
  end
}

thisDir = File.expand_path File.dirname(__FILE__)
srcDir = File.join thisDir.split("/")[0..-2], "src"
jsDir = File.join srcDir, "js"


jsFiles = [

  "version.js",

  "helpers.js",

  "modules/button/ButtonView.js",

  "modules/assessment/Assessment.js",
  "modules/assessment/Assessments.js",
  "modules/assessment/AssessmentsView.js",
  "modules/assessment/AssessmentListElementView.js",
  "modules/assessment/AssessmentsMenuView.js",
  "modules/assessment/AssessmentRunView.js",
  "modules/assessment/AssessmentSyncView.js",
  "modules/assessment/AssessmentDataEntryView.js",



  'modules/subtest/Subtest.js',
  'modules/subtest/Subtests.js',
  'modules/subtest/SubtestRunView.js',
  'modules/subtest/SubtestRunItemView.js',

  'modules/question/Question.js',
  'modules/question/Questions.js',
  'modules/question/QuestionRunView.js',
  'modules/question/QuestionRunItemView.js',


  'modules/subtest/prototypes/SurveyRunItemView.js',

  'modules/subtest/prototypes/ConsentRunView.js',

  'modules/subtest/prototypes/DatetimeRunView.js',

  'modules/subtest/prototypes/LocationRunView.js',

  'modules/subtest/prototypes/SurveyRunView.js',

  'modules/subtest/prototypes/IdRunView.js',

  'modules/subtest/prototypes/GridRunView.js',
  'modules/subtest/prototypes/GridRunItemView.js',

  'modules/subtest/prototypes/ObservationRunView.js',

  'modules/subtest/prototypes/GpsRunView.js',

  'modules/result/Result.js',
  'modules/result/Results.js',
  'modules/result/ResultView.js',
  'modules/result/ResultItemView.js',
  'modules/result/ResultsView.js',
  'modules/result/TabletManagerView.js',
  'modules/result/ResultSumView.js',
  'modules/result/DashboardView.js',

  'modules/admin/AdminView.js',

  'modules/klass/Klass.js',
  'modules/klass/KlassView.js',
  'modules/klass/KlassEditView.js',
  'modules/klass/Klasses.js',
  'modules/klass/KlassesView.js',
  'modules/klass/KlassListElementView.js',
  'modules/klass/KlassSubtestRunView.js',
  'modules/klass/KlassSubtestResultView.js',
  'modules/klass/KlassMenuView.js',
  'modules/klass/KlassPartlyView.js',
  'modules/klass/KlassResult.js',
  'modules/klass/KlassResults.js',

  'modules/report/KlassGroupingView.js',
  'modules/report/KlassGroupingMenuView.js',
  'modules/report/MasteryCheckView.js',
  'modules/report/MasteryCheckMenuView.js',
  'modules/report/ProgressView.js',
  'modules/report/ProgressMenuView.js',
  'modules/report/CsvMenuView.js',

  'modules/curriculum/Curriculum.js',
  'modules/curriculum/CurriculumView.js',
  'modules/curriculum/Curricula.js',
  'modules/curriculum/CurriculaView.js',
  'modules/curriculum/CurriculaListView.js',
  'modules/curriculum/CurriculumListElementView.js',
  'modules/curriculum/CurriculaView.js',

  'modules/teacher/Teacher.js',
  'modules/teacher/Teachers.js',
  'modules/teacher/TeachersView.js',
  'modules/teacher/RegisterTeacherView.js',

  'modules/student/Student.js',
  'modules/student/Students.js',
  'modules/student/StudentListElementView.js',
  'modules/student/StudentEditView.js',

  'modules/user/User.js',
  'modules/user/Users.js',
  'modules/user/TabletUser.js',
  'modules/user/TabletUsers.js',

  'modules/user/LoginView.js',
  'modules/user/AccountView.js',
  'modules/user/GroupsView.js',
  'modules/user/UsersMenuView.js',


  "modules/assessment/AssessmentDashboardView.js",
  "modules/assessment/HomeRecordItemView.js",
  "modules/assessment/AssessmentCompositeView.js",
  'modules/assessment/AssessmentControlsView.js',
  "modules/layouts/DashboardLayout.js",

  'modules/config/Config.js',

  'modules/log/Log.js',

  'modules/settings/Settings.js',
  'modules/settings/SettingsView.js',

  'modules/viewManager/ViewManager.js',

  'modules/navigation/NavigationView.js',

  'router.js',

  'configuration.js',

  'boot.js',

]

libFiles = [
  'lib/phonegap.js',
  'lib/modernizr.js',
  'lib/jquery.js',
  'lib/underscore.js',
  'lib/sha1.js',
  'lib/jquery.couch.js',
  'lib/js-cookie.js',
  'lib/jquery.tablesorter.js',
  'lib/jquery.flot.js',
  'lib/jquery.i18next.js',
  'lib/excanvas.js',
  'lib/jquery.ui.core.js',
  'lib/jquery.ui.widget.js',
  'lib/jquery.ui.position.js',
  'lib/jquery.ui.menu.js',
  'lib/jquery.ui.autocomplete.js',
  'lib/jquery.ui.mouse.js',
  'lib/jquery.ui.sortable.js',
  'lib/jquery.ui.accordion.js',
  'lib/jquery.ui.button.js',
  'lib/jquery.ui.progressbar.js',
  'lib/inflection.js',
  #'lib/backbone.js',
  'lib-coco/backbone.js',
  'lib-coco/backbone.wreqr.js',
  'lib-coco/backbone.babysitter.js',
  'lib-coco/backbone.marionette.js',
  'lib-coco/handlebars.js',
  'lib-coco/precompiled.handlebars.js',
  'lib/moment.js',
  #'lib/backbone-couchdb.js',
  'lib/pouchdb.js',
  'lib/backbone-pouchdb.js',
  'lib/transcriptionCheckdigit.js',
  'lib/table2CSV.js',
  'lib/base64.js',
  'lib/jstz.js',
  'lib/ckeditor.js',
  'lib/coffee-script.js' # This file tends to like to be last
]

def replace(file_path, contents)
  startString = "<!-- START -->"
  endString = "<!-- END -->"
  regExp = Regexp.new("#{startString}(.*)#{endString}", Regexp::MULTILINE)
  replacedResult = IO.read(file_path).gsub(regExp, "#{startString}\n#{contents}\n#{endString}")
  File.open(file_path, 'w') { |f| f.write(replacedResult) }
end

if $options[:make_index_dev]
  replace("#{srcDir}/index-dev.html", (libFiles + jsFiles).map{|file|
    "<script src='js/#{file}'></script>"
  }.join("\n"))
end

if $options[:make_app]
  app = ''
  for path in jsFiles
    puts "reading #{path}"
    path = path.gsub(/ /, "\ ")
    path = File.join(jsDir, "min", Pathname.new(path).basename.to_s.gsub(".js",".min.js"))
    app += File.read path

  end

  File.open( File.join(jsDir, "app.js"), 'w' ) { |f|
    puts "writing app.js"
    f.write( app )
  }
end

if $options[:compile]
  for file in $options[:compile]
    file = file.gsub(/ /, "\ ")
    oldFile = File.read file
    File.open( File.join(jsDir, "min", Pathname.new(file).basename.to_s.gsub(".js",".min.js")), "w" ) { |f|
      puts "\nUglifying\t\t#{file}"
      f.write Uglifier.new.compile(oldFile)
    }
  end
end

if $options[:make_lib]
  lib = ''
  for path in libFiles
    puts "reading #{path}"
    path = File.join(jsDir, path.gsub(/ /, "\ "))
    lib += File.read(path)
  end

  File.open( File.join(jsDir, "lib.js"), 'w' ) { |f|
    puts "writing lib.js"
    f.write lib
  }
end
