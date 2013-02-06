#! /usr/bin/ruby

require 'uglifier'

$options = {
  :make_lib  => ARGV.delete("lib") != nil,
  :make_app  => ARGV.delete("app") != nil
}

jsFiles = [ 
  'helpers.js',

  'modules/assessment/Assessment.js',
  'modules/assessment/Assessments.js',
  'modules/assessment/AssessmentsView.js',
  'modules/assessment/AssessmentListElementView.js',
  'modules/assessment/AssessmentsMenuView.js',
  'modules/assessment/AssessmentEditView.js',
  'modules/assessment/AssessmentRunView.js',
  'modules/assessment/AssessmentImportView.js',

  'modules/subtest/Subtest.js',
  'modules/subtest/Subtests.js',
  'modules/subtest/SubtestListEditView.js',
  'modules/subtest/SubtestListElementView.js',
  'modules/subtest/SubtestEditView.js',
  'modules/subtest/SubtestRunView.js',

  'modules/subtest/prototypes/ConsentRunView.js',
  'modules/subtest/prototypes/ConsentEditView.js',

  'modules/subtest/prototypes/DatetimeRunView.js',
  'modules/subtest/prototypes/DatetimeEditView.js',

  'modules/subtest/prototypes/LocationRunView.js',
  'modules/subtest/prototypes/LocationEditView.js',

  'modules/subtest/prototypes/SurveyRunView.js',
  'modules/subtest/prototypes/SurveyEditView.js',

  'modules/subtest/prototypes/IdRunView.js',
  'modules/subtest/prototypes/IdEditView.js',

  'modules/subtest/prototypes/GridRunView.js',
  'modules/subtest/prototypes/GridEditView.js',

  'modules/subtest/prototypes/ObservationRunView.js',
  'modules/subtest/prototypes/ObservationEditView.js',

  'modules/result/Result.js',
  'modules/result/Results.js',
  'modules/result/ResultView.js',
  'modules/result/ResultsView.js',
  'modules/result/ResultSumView.js',
  'modules/result/CSVView.js',
  'modules/result/DashboardView.js',

  'modules/question/Question.js',
  'modules/question/Questions.js',
  'modules/question/QuestionRunView.js',
  'modules/question/QuestionEditView.js',
  'modules/question/QuestionsEditView.js',
  'modules/question/QuestionsEditListElementView.js',

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
  'modules/klass/RegisterTeacherView.js',

  'modules/subtest/KlassSubtestEditView.js',

  'modules/report/KlassGroupingView.js',
  'modules/report/KlassGroupingMenuView.js',
  'modules/report/MasteryCheckView.js',
  'modules/report/MasteryCheckMenuView.js',
  'modules/report/ProgressView.js',
  'modules/report/ProgressMenuView.js',

  'modules/klass/Curriculum.js',
  'modules/klass/CurriculumView.js',
  'modules/klass/Curricula.js',
  'modules/klass/CurriculaView.js',
  'modules/klass/CurriculaListView.js',
  'modules/klass/CurriculumListElementView.js',
  'modules/klass/CurriculaView.js',

  'modules/klass/Teacher.js',

  'modules/student/Student.js',
  'modules/student/Students.js',
  'modules/student/StudentListElementView.js',
  'modules/student/StudentEditView.js',

  'modules/user/User.js',
  'modules/user/LoginView.js',
  'modules/user/AccountView.js',
  'modules/user/GroupsView.js',
  'modules/user/UsersMenuView.js',

  'modules/error/ErrorView.js',

  'modules/breadcrumb/breadcrumb.js',

  'modules/assessment/AssessmentPrintView.js',
  'modules/question/QuestionPrintView.js',
  'modules/subtest/prototypes/GridPrintView.js',
  'modules/subtest/prototypes/ConsentPrintView.js',
  'modules/subtest/prototypes/DatetimePrintView.js',
  'modules/subtest/prototypes/IdPrintView.js',
  'modules/subtest/prototypes/LocationPrintView.js',
  'modules/subtest/prototypes/SurveyPrintView.js',
  'modules/subtest/prototypes/ObservationPrintView.js',
  'modules/subtest/SubtestPrintView.js',

  'modules/log/Log.js',

  'modules/template/Template.js',
  'modules/config/Config.js',
  'modules/settings/Settings.js',
  'modules/settings/SettingsView.js',

  'modules/viewManager/ViewManager.js',

  'modules/navigation/NavigationView.js',

  'router.js',

  'boot.js',

  'version.js'
]

libFiles = [
  'lib/phonegap.js',
  'lib/jquery.js',
  'lib/underscore.js',
  'lib/sha1.js',
  'lib/jquery.couch.js',
  'lib/jquery.cookie.js',
  'lib/jquery.sparkline.js',
  'lib/jquery.tablesorter.js',
  'lib/jquery.flot.js',
  'lib/jquery.cleditor.js',
  'lib/jquery.i18next.js',
  'lib/excanvas.js',
  'lib/jquery-ui.js',
  'lib/mobile_boilerplate.js',
  'lib/inflection.js',
  'lib/backbone.js',
  'lib/moment.min.js',
  'lib/backbone-couchdb.js',
  'lib/transcriptionCheckdigit.js',
  'lib/table2CSV.js',
  'lib/base64.js',
  'lib/coffee-script.js'
  'lib/jstz.min.js'
]

if $options[:make_app]
  app = ''
  for path in jsFiles
    puts "reading #{path}"
    app += File.read(path)
  end

  File.open( "app.js", 'w' ) { |f| 
    puts "writing app.js"
    f.write( Uglifier.new.compile(app)) 
  }
end

if $options[:make_lib]
  lib = ''
  for path in libFiles
    puts "reading #{path}"
    lib += File.read(path)
  end

  File.open( "lib.js", 'w' ) { |f| 
    puts "writing lib.js"
    f.write lib 
  }
end
