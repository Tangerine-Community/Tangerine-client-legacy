var Router,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Router = (function(superClass) {
  extend(Router, superClass);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.navigateAwayMessage = false;

  Router.prototype.execute = function(callback, args, name) {
    if (this.navigateAwayMessage !== false) {
      if (!confirm(this.navigateAwayMessage)) {
        return false;
      } else {
        this.navigateAwayMessage = false;
        Tangerine.router.landing(true);
      }
    }
    if (callback) {
      return callback.apply(this, args);
    }
  };

  Router.prototype.routes = {
    'login': 'login',
    'register': 'register',
    'logout': 'logout',
    'account': 'account',
    'transfer': 'transfer',
    'settings': 'settings',
    'update': 'update',
    '': 'landing',
    'logs': 'logs',
    'class': 'klass',
    'class/edit/:id': 'klassEdit',
    'class/student/:studentId': 'studentEdit',
    'class/student/report/:studentId': 'studentReport',
    'class/subtest/:id': 'editKlassSubtest',
    'class/question/:id': "editKlassQuestion",
    'class/:id/:part': 'klassPartly',
    'class/:id': 'klassPartly',
    'class/run/:studentId/:subtestId': 'runSubtest',
    'class/result/student/subtest/:studentId/:subtestId': 'studentSubtest',
    'curricula': 'curricula',
    'curriculum/:id': 'curriculum',
    'curriculumImport': 'curriculumImport',
    'report/klassGrouping/:klassId/:part': 'klassGrouping',
    'report/masteryCheck/:studentId': 'masteryCheck',
    'report/progress/:studentId/:klassId': 'progressReport',
    'teachers': 'teachers',
    'groups': 'groups',
    'assessments': 'assessments',
    'run/:id': 'run',
    'runMar/:id': 'runMar',
    'print/:id/:format': 'print',
    'dataEntry/:id': 'dataEntry',
    'resume/:assessmentId/:resultId': 'resume',
    'restart/:id': 'restart',
    'edit/:id': 'edit',
    'results/:id': 'results',
    'import': 'import',
    'subtest/:id': 'editSubtest',
    'question/:id': 'editQuestion',
    'dashboard': 'dashboard',
    'dashboard/*options': 'dashboard',
    'admin': 'admin',
    'sync/:id': 'sync'
  };

  Router.prototype.admin = function(options) {
    return Tangerine.user.verify({
      isAdmin: function() {
        return $.couch.allDbs({
          success: (function(_this) {
            return function(databases) {
              var groups, view;
              groups = databases.filter(function(database) {
                return database.indexOf("group-") === 0;
              });
              view = new AdminView({
                groups: groups
              });
              return vm.show(view);
            };
          })(this)
        });
      }
    });
  };

  Router.prototype.dashboard = function(options) {
    var reportViewOptions, view;
    options = options != null ? options.split(/\//) : void 0;
    reportViewOptions = {
      assessment: "All",
      groupBy: "enumerator"
    };
    _.each(options, function(option, index) {
      if (!(index % 2)) {
        return reportViewOptions[option] = options[index + 1];
      }
    });
    view = new DashboardView();
    view.options = reportViewOptions;
    return vm.show(view);
  };

  Router.prototype.landing = function(refresh) {
    var callFunction;
    if (refresh == null) {
      refresh = false;
    }
    callFunction = !refresh;
    Tangerine.router.navigate("assessments", callFunction);
    if (refresh) {
      return document.location.reload();
    }
  };

  Router.prototype.groups = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var view;
        view = new GroupsView;
        return vm.show(view);
      }
    });
  };

  Router.prototype.curricula = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var curricula;
        curricula = new Curricula;
        return curricula.fetch({
          success: function(collection) {
            var view;
            view = new CurriculaView({
              "curricula": collection
            });
            return vm.show(view);
          }
        });
      }
    });
  };

  Router.prototype.curriculum = function(curriculumId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var curriculum;
        curriculum = new Curriculum({
          "_id": curriculumId
        });
        return curriculum.fetch({
          success: function() {
            var allSubtests;
            allSubtests = new Subtests;
            return allSubtests.fetch({
              success: function() {
                var allQuestions, subtests;
                subtests = new Subtests(allSubtests.where({
                  "curriculumId": curriculumId
                }));
                allQuestions = new Questions;
                return allQuestions.fetch({
                  success: function() {
                    var questions, view;
                    questions = [];
                    subtests.each(function(subtest) {
                      return questions = questions.concat(allQuestions.where({
                        "subtestId": subtest.id
                      }));
                    });
                    questions = new Questions(questions);
                    view = new CurriculumView({
                      "curriculum": curriculum,
                      "subtests": subtests,
                      "questions": questions
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.curriculumEdit = function(curriculumId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var curriculum;
        curriculum = new Curriculum({
          "_id": curriculumId
        });
        return curriculum.fetch({
          success: function() {
            var allSubtests;
            allSubtests = new Subtests;
            return allSubtests.fetch({
              success: function() {
                var allParts, partCount, subtest, subtests, view;
                subtests = allSubtests.where({
                  "curriculumId": curriculumId
                });
                allParts = (function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = subtests.length; i < len; i++) {
                    subtest = subtests[i];
                    results1.push(subtest.get("part"));
                  }
                  return results1;
                })();
                partCount = Math.max.apply(Math, allParts);
                view = new CurriculumView({
                  "curriculum": curriculum,
                  "subtests": subtests,
                  "parts": partCount
                });
                return vm.show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.curriculumImport = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var view;
        view = new AssessmentImportView({
          noun: "curriculum"
        });
        return vm.show(view);
      }
    });
  };

  Router.prototype.klass = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var allKlasses;
        allKlasses = new Klasses;
        return allKlasses.fetch({
          success: function(klassCollection) {
            var teachers;
            teachers = new Teachers;
            return teachers.fetch({
              success: function() {
                var allCurricula;
                allCurricula = new Curricula;
                return allCurricula.fetch({
                  success: function(curriculaCollection) {
                    var view;
                    if (!Tangerine.user.isAdmin()) {
                      klassCollection = new Klasses(klassCollection.where({
                        "teacherId": Tangerine.user.get("teacherId")
                      }));
                    }
                    view = new KlassesView({
                      klasses: klassCollection,
                      curricula: curriculaCollection,
                      teachers: teachers
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.klassEdit = function(id) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var klass;
        klass = new Klass({
          _id: id
        });
        return klass.fetch({
          success: function(model) {
            var teachers;
            teachers = new Teachers;
            return teachers.fetch({
              success: function() {
                var allStudents;
                allStudents = new Students;
                return allStudents.fetch({
                  success: function(allStudents) {
                    var klassStudents, view;
                    klassStudents = new Students(allStudents.where({
                      klassId: id
                    }));
                    view = new KlassEditView({
                      klass: model,
                      students: klassStudents,
                      allStudents: allStudents,
                      teachers: teachers
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.klassPartly = function(klassId, part) {
    if (part == null) {
      part = null;
    }
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var klass;
        klass = new Klass({
          "_id": klassId
        });
        return klass.fetch({
          success: function() {
            var curriculum;
            curriculum = new Curriculum({
              "_id": klass.get("curriculumId")
            });
            return curriculum.fetch({
              success: function() {
                var allStudents;
                allStudents = new Students;
                return allStudents.fetch({
                  success: function(collection) {
                    var allResults, students;
                    students = new Students(collection.where({
                      "klassId": klassId
                    }));
                    allResults = new KlassResults;
                    return allResults.fetch({
                      success: function(collection) {
                        var allSubtests, results;
                        results = new KlassResults(collection.where({
                          "klassId": klassId
                        }));
                        allSubtests = new Subtests;
                        return allSubtests.fetch({
                          success: function(collection) {
                            var subtests, view;
                            subtests = new Subtests(collection.where({
                              "curriculumId": klass.get("curriculumId")
                            }));
                            view = new KlassPartlyView({
                              "part": part,
                              "subtests": subtests,
                              "results": results,
                              "students": students,
                              "curriculum": curriculum,
                              "klass": klass
                            });
                            return vm.show(view);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.studentSubtest = function(studentId, subtestId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var student;
        student = new Student({
          "_id": studentId
        });
        return student.fetch({
          success: function() {
            var subtest;
            subtest = new Subtest({
              "_id": subtestId
            });
            return subtest.fetch({
              success: function() {
                return Tangerine.$db.view(Tangerine.design_doc + "/resultsByStudentSubtest", {
                  key: [studentId, subtestId],
                  success: function(response) {
                    var allResults;
                    allResults = new KlassResults;
                    return allResults.fetch({
                      success: function(collection) {
                        var results, view;
                        results = collection.where({
                          "subtestId": subtestId,
                          "studentId": studentId,
                          "klassId": student.get("klassId")
                        });
                        view = new KlassSubtestResultView({
                          "allResults": allResults,
                          "results": results,
                          "subtest": subtest,
                          "student": student,
                          "previous": response.rows.length
                        });
                        return vm.show(view);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.runSubtest = function(studentId, subtestId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var subtest;
        subtest = new Subtest({
          "_id": subtestId
        });
        return subtest.fetch({
          success: function() {
            var onStudentReady, student;
            student = new Student({
              "_id": studentId
            });
            onStudentReady = function(student, subtest) {
              return student.fetch({
                success: function() {
                  var onSuccess, questions;
                  onSuccess = function(student, subtest, question, linkedResult) {
                    var view;
                    if (question == null) {
                      question = null;
                    }
                    if (linkedResult == null) {
                      linkedResult = {};
                    }
                    view = new KlassSubtestRunView({
                      "student": student,
                      "subtest": subtest,
                      "questions": questions,
                      "linkedResult": linkedResult
                    });
                    return vm.show(view);
                  };
                  questions = null;
                  if (subtest.get("prototype") === "survey") {
                    return Tangerine.$db.view(Tangerine.design_doc + "/resultsByStudentSubtest", {
                      key: [studentId, subtest.get("gridLinkId")],
                      success: (function(_this) {
                        return function(response) {
                          var linkedResult, ref;
                          if (response.rows !== 0) {
                            linkedResult = new KlassResult((ref = _.last(response.rows)) != null ? ref.value : void 0);
                          }
                          questions = new Questions;
                          return questions.fetch({
                            viewOptions: {
                              key: "question-" + (subtest.get("curriculumId"))
                            },
                            success: function() {
                              questions = new Questions(questions.where({
                                subtestId: subtestId
                              }));
                              return onSuccess(student, subtest, questions, linkedResult);
                            }
                          });
                        };
                      })(this)
                    });
                  } else {
                    return onSuccess(student, subtest);
                  }
                }
              });
            };
            if (studentId === "test") {
              return student.fetch({
                success: function() {
                  return onStudentReady(student, subtest);
                },
                error: function() {
                  return student.save(null, {
                    success: function() {
                      return onStudentReady(student, subtest);
                    }
                  });
                }
              });
            } else {
              return student.fetch({
                success: function() {
                  return onStudentReady(student, subtest);
                }
              });
            }
          }
        });
      }
    });
  };

  Router.prototype.register = function() {
    return Tangerine.user.verify({
      isUnregistered: function() {
        var view;
        view = new RegisterTeacherView({
          user: new User
        });
        return vm.show(view);
      },
      isAuthenticated: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.studentEdit = function(studentId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var student;
        student = new Student({
          _id: studentId
        });
        return student.fetch({
          success: function(model) {
            var allKlasses;
            allKlasses = new Klasses;
            return allKlasses.fetch({
              success: function(klassCollection) {
                var view;
                view = new StudentEditView({
                  student: model,
                  klasses: klassCollection
                });
                return vm.show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.dataEntry = function(assessmentId) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function() {
            var questions;
            questions = new Questions;
            return questions.fetch({
              viewOptions: {
                key: "question-" + assessmentId
              },
              success: function() {
                var questionsBySubtestId, subtestId;
                questionsBySubtestId = questions.indexBy("subtestId");
                for (subtestId in questionsBySubtestId) {
                  questions = questionsBySubtestId[subtestId];
                  assessment.subtests.get(subtestId).questions = new Questions(questions);
                }
                return vm.show(new AssessmentDataEntryView({
                  assessment: assessment
                }));
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.sync = function(assessmentId) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function() {
            return vm.show(new AssessmentSyncView({
              "assessment": assessment
            }));
          }
        });
      }
    });
  };

  Router.prototype.assessments = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessments;
        assessments = new Assessments;
        return assessments.fetch({
          success: function() {
            var assessmentsView;
            assessmentsView = new AssessmentsMenuView({
              assessments: assessments
            });
            return Tangerine.app.rm.get('mainRegion').show(assessmentsView);
          }
        });
      }
    });
  };

  Router.prototype.restart = function(name) {
    return Tangerine.router.navigate("run/" + name, true);
  };

  Router.prototype.run = function(id) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          success: function() {
            return vm.show(new AssessmentRunView({
              model: assessment
            }));
          }
        });
      }
    });
  };

  Router.prototype.runMar = function(id) {
    var router;
    router = this;
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
        router.navigateAwayMessage = t("Router.message.quit_assessment");
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          success: function() {
            var assessmentCompositeView, dashboardLayout;
            dashboardLayout = new DashboardLayout();
            Tangerine.app.rm.get('mainRegion').show(dashboardLayout);
            dashboardLayout.contentRegion.reset();
            assessmentCompositeView = new AssessmentCompositeView({
              assessment: assessment
            });
            return dashboardLayout.contentRegion.show(assessmentCompositeView);
          },
          error: function(model, err, cb) {
            return console.log(JSON.stringify(err));
          }
        });
      }
    });
  };

  Router.prototype.resume = function(assessmentId, resultId) {
    var router;
    router = this;
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
        router.navigateAwayMessage = t("Router.message.quit_assessment");
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.deepFetch({
          success: function() {
            var result;
            result = new Result({
              "_id": resultId
            });
            return result.fetch({
              success: function() {
                var assessmentCompositeView, i, len, ref, subtest;
                assessmentCompositeView = new AssessmentCompositeView({
                  assessment: assessment,
                  result: result
                });
                result.parent = assessmentCompositeView;
                ref = result.get("subtestData");
                for (i = 0, len = ref.length; i < len; i++) {
                  subtest = ref[i];
                  if ((subtest.data != null) && (subtest.data.participant_id != null)) {
                    Tangerine.nav.setStudent(subtest.data.participant_id);
                  }
                }
                return Tangerine.app.rm.get('mainRegion').show(assessmentCompositeView);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.results = function(assessmentId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function() {
            var allResults;
            allResults = new Results;
            return allResults.fetch({
              options: {
                key: "result-" + assessmentId
              },
              success: function() {
                var view;
                view = new ResultsView({
                  "assessment": assessment,
                  "results": allResults
                });
                return Tangerine.app.rm.get('mainRegion').show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.csv = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var view;
        view = new CSVView({
          assessmentId: id
        });
        return vm.show(view);
      }
    });
  };

  Router.prototype.csv_alpha = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          "_id": id
        });
        return assessment.fetch({
          success: function() {
            var filename;
            filename = assessment.get("name") + "-" + moment().format("YYYY-MMM-DD HH:mm");
            return document.location = "/" + Tangerine.dbName + "/_design/" + Tangerine.designDoc + ("/_list/csv/csvRowByResult?key=\"" + id + "\"&filename=" + filename);
          }
        });
      },
      isUser: function() {
        var errView;
        errView = new ErrorView({
          message: "You're not an admin user",
          details: "How did you get here?"
        });
        return vm.show(errView);
      }
    });
  };

  Router.prototype.klassGrouping = function(klassId, part) {
    part = parseInt(part);
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var allSubtests;
        allSubtests = new Subtests;
        return allSubtests.fetch({
          success: function(collection) {
            var allResults, subtests;
            subtests = new Subtests(collection.where({
              "part": part
            }));
            allResults = new KlassResults;
            return allResults.fetch({
              success: function(results) {
                var students;
                results = new KlassResults(results.where({
                  "klassId": klassId
                }));
                students = new Students;
                return students.fetch({
                  success: function() {
                    var filteredResults, i, len, ref, ref1, result, resultsFromCurrentStudents, studentIds, view;
                    students = new Students(students.where({
                      "klassId": klassId
                    }));
                    studentIds = students.pluck("_id");
                    resultsFromCurrentStudents = [];
                    ref = results.models;
                    for (i = 0, len = ref.length; i < len; i++) {
                      result = ref[i];
                      if (ref1 = result.get("studentId"), indexOf.call(studentIds, ref1) >= 0) {
                        resultsFromCurrentStudents.push(result);
                      }
                    }
                    filteredResults = new KlassResults(resultsFromCurrentStudents);
                    view = new KlassGroupingView({
                      "students": students,
                      "subtests": subtests,
                      "results": filteredResults
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.masteryCheck = function(studentId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var student;
        student = new Student({
          "_id": studentId
        });
        return student.fetch({
          success: function(student) {
            var klass, klassId;
            klassId = student.get("klassId");
            klass = new Klass({
              "_id": student.get("klassId")
            });
            return klass.fetch({
              success: function(klass) {
                var allResults;
                allResults = new KlassResults;
                return allResults.fetch({
                  success: function(collection) {
                    var i, j, len, len1, ref, result, results, subtestCollection, subtestId, subtestIdList;
                    results = new KlassResults(collection.where({
                      "studentId": studentId,
                      "reportType": "mastery",
                      "klassId": klassId
                    }));
                    subtestIdList = {};
                    ref = results.models;
                    for (i = 0, len = ref.length; i < len; i++) {
                      result = ref[i];
                      subtestIdList[result.get("subtestId")] = true;
                    }
                    subtestIdList = _.keys(subtestIdList);
                    subtestCollection = new Subtests;
                    for (j = 0, len1 = subtestIdList.length; j < len1; j++) {
                      subtestId = subtestIdList[j];
                      subtestCollection.add(new Subtest({
                        "_id": subtestId
                      }));
                    }
                    return subtestCollection.fetch({
                      success: function() {
                        var view;
                        view = new MasteryCheckView({
                          "student": student,
                          "results": results,
                          "klass": klass,
                          "subtests": subtestCollection
                        });
                        return vm.show(view);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.progressReport = function(studentId, klassId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var afterFetch, student, students;
        afterFetch = function(student, students) {
          var klass;
          klass = new Klass({
            "_id": klassId
          });
          return klass.fetch({
            success: function(klass) {
              var allSubtests;
              allSubtests = new Subtests;
              return allSubtests.fetch({
                success: function(allSubtests) {
                  var allResults, subtests;
                  subtests = new Subtests(allSubtests.where({
                    "curriculumId": klass.get("curriculumId"),
                    "reportType": "progress"
                  }));
                  allResults = new KlassResults;
                  return allResults.fetch({
                    success: function(collection) {
                      var i, len, ref, ref1, result, results, resultsFromCurrentStudents, studentIds, view;
                      results = new KlassResults(collection.where({
                        "klassId": klassId,
                        "reportType": "progress"
                      }));
                      console.log(students);
                      if (students != null) {
                        studentIds = students.pluck("_id");
                        resultsFromCurrentStudents = [];
                        ref = results.models;
                        for (i = 0, len = ref.length; i < len; i++) {
                          result = ref[i];
                          if (ref1 = result.get("studentId"), indexOf.call(studentIds, ref1) >= 0) {
                            resultsFromCurrentStudents.push(result);
                          }
                        }
                        results = new KlassResults(resultsFromCurrentStudents);
                      }
                      view = new ProgressView({
                        "subtests": subtests,
                        "student": student,
                        "results": results,
                        "klass": klass
                      });
                      return vm.show(view);
                    }
                  });
                }
              });
            }
          });
        };
        if (studentId !== "all") {
          student = new Student({
            "_id": studentId
          });
          return student.fetch({
            success: function() {
              return afterFetch(student);
            }
          });
        } else {
          students = new Students;
          return students.fetch({
            success: function() {
              return afterFetch(null, students);
            }
          });
        }
      }
    });
  };

  Router.prototype.editSubtest = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var subtest;
        id = Utils.cleanURL(id);
        subtest = new Subtest({
          _id: id
        });
        return subtest.fetch({
          success: function(model, response) {
            var assessment;
            assessment = new Assessment({
              "_id": subtest.get("assessmentId")
            });
            return assessment.fetch({
              success: function() {
                var view;
                view = new SubtestEditView({
                  model: model,
                  assessment: assessment
                });
                return vm.show(view);
              }
            });
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.editKlassSubtest = function(id) {
    var onSuccess;
    onSuccess = function(subtest, curriculum, questions) {
      var view;
      if (questions == null) {
        questions = null;
      }
      view = new KlassSubtestEditView({
        model: subtest,
        curriculum: curriculum,
        questions: questions
      });
      return vm.show(view);
    };
    return Tangerine.user.verify({
      isAdmin: function() {
        var subtest;
        id = Utils.cleanURL(id);
        subtest = new Subtest({
          _id: id
        });
        return subtest.fetch({
          success: function() {
            var curriculum;
            curriculum = new Curriculum({
              "_id": subtest.get("curriculumId")
            });
            return curriculum.fetch({
              success: function() {
                var questions;
                if (subtest.get("prototype") === "survey") {
                  questions = new Questions;
                  return questions.fetch({
                    viewOptions: {
                      key: "question-" + curriculum.id
                    },
                    success: function() {
                      questions = new Questions(questions.where({
                        "subtestId": subtest.id
                      }));
                      return onSuccess(subtest, curriculum, questions);
                    }
                  });
                } else {
                  return onSuccess(subtest, curriculum);
                }
              }
            });
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.editQuestion = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var question;
        id = Utils.cleanURL(id);
        question = new Question({
          _id: id
        });
        return question.fetch({
          success: function(question, response) {
            var assessment;
            assessment = new Assessment({
              "_id": question.get("assessmentId")
            });
            return assessment.fetch({
              success: function() {
                var subtest;
                subtest = new Subtest({
                  "_id": question.get("subtestId")
                });
                return subtest.fetch({
                  success: function() {
                    var view;
                    view = new QuestionEditView({
                      "question": question,
                      "subtest": subtest,
                      "assessment": assessment
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.editKlassQuestion = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var question;
        id = Utils.cleanURL(id);
        question = new Question({
          "_id": id
        });
        return question.fetch({
          success: function(question, response) {
            var curriculum;
            curriculum = new Curriculum({
              "_id": question.get("curriculumId")
            });
            return curriculum.fetch({
              success: function() {
                var subtest;
                subtest = new Subtest({
                  "_id": question.get("subtestId")
                });
                return subtest.fetch({
                  success: function() {
                    var view;
                    view = new QuestionEditView({
                      "question": question,
                      "subtest": subtest,
                      "assessment": curriculum
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.login = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        return Tangerine.router.landing();
      },
      isUnregistered: function() {
        var users;
        users = new TabletUsers;
        return users.fetch({
          success: function() {
            var loginView;
            loginView = new LoginView({
              users: users
            });
            Tangerine.app.rm.get('mainRegion').show(loginView);
            return loginView.afterRender();
          }
        });
      }
    });
  };

  Router.prototype.logout = function() {
    return Tangerine.user.logout();
  };

  Router.prototype.account = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var showView, teacher;
        showView = function(teacher) {
          var view;
          view = new AccountView({
            user: Tangerine.user,
            teacher: teacher
          });
          return vm.show(view);
        };
        if ("class" === Tangerine.settings.get("context")) {
          if (Tangerine.user.has("teacherId")) {
            teacher = new Teacher({
              "_id": Tangerine.user.get("teacherId")
            });
            return teacher.fetch({
              success: function() {
                return showView(teacher);
              }
            });
          } else {
            teacher = new Teacher({
              "_id": Utils.humanGUID()
            });
            return teacher.save(null, {
              success: function() {
                return showView(teacher);
              }
            });
          }
        } else {
          return showView();
        }
      }
    });
  };

  Router.prototype.settings = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var view;
        view = new SettingsView;
        return vm.show(view);
      }
    });
  };

  Router.prototype.logs = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var logs;
        logs = new Logs;
        return logs.fetch({
          success: (function(_this) {
            return function() {
              var view;
              view = new LogView({
                logs: logs
              });
              return vm.show(view);
            };
          })(this)
        });
      }
    });
  };

  Router.prototype.teachers = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var users;
        users = new TabletUsers;
        return users.fetch({
          success: function() {
            var teachers;
            teachers = new Teachers;
            return teachers.fetch({
              success: (function(_this) {
                return function() {
                  var view;
                  view = new TeachersView({
                    teachers: teachers,
                    users: users
                  });
                  return vm.show(view);
                };
              })(this)
            });
          }
        });
      }
    });
  };

  Router.prototype.transfer = function() {
    var getVars, name;
    getVars = Utils.$_GET();
    name = getVars.name;
    return $.couch.logout({
      success: (function(_this) {
        return function() {
          $.cookie("AuthSession", null);
          return $.couch.login({
            "name": name,
            "password": name,
            success: function() {
              Tangerine.router.landing();
              return window.location.reload();
            },
            error: function() {
              return $.couch.signup({
                "name": name,
                "roles": ["_admin"]
              }, name, {
                success: function() {
                  var user;
                  user = new User;
                  return user.save({
                    "name": name,
                    "id": "tangerine.user:" + name,
                    "roles": [],
                    "from": "tc"
                  }, {
                    wait: true,
                    success: function() {
                      return $.couch.login({
                        "name": name,
                        "password": name,
                        success: function() {
                          Tangerine.router.landing();
                          return window.location.reload();
                        },
                        error: function() {
                          return Utils.sticky("Error transfering user.");
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        };
      })(this)
    });
  };

  return Router;

})(Backbone.Router);

//# sourceMappingURL=data:application/json;base64,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LEVBQVUsSUFIVjttQkFERixFQU1FO29CQUFBLElBQUEsRUFBTSxJQUFOO29CQUNBLE9BQUEsRUFBUyxTQUFBOzZCQUNQLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBUixDQUNFO3dCQUFBLE1BQUEsRUFBYSxJQUFiO3dCQUNBLFVBQUEsRUFBYSxJQURiO3dCQUVBLE9BQUEsRUFBVSxTQUFBOzBCQUNSLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBakIsQ0FBQTtpQ0FDQSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLENBQUE7d0JBRlEsQ0FGVjt3QkFLQSxLQUFBLEVBQU8sU0FBQTtpQ0FDTCxLQUFLLENBQUMsTUFBTixDQUFhLHlCQUFiO3dCQURLLENBTFA7dUJBREY7b0JBRE8sQ0FEVDttQkFORjtnQkFGTyxDQUFUO2VBSkE7WUFESyxDQUxQO1dBREY7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtLQURGO0VBSFE7Ozs7R0FueUJTLFFBQVEsQ0FBQyIsImZpbGUiOiJyb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcblxuXG4gICMgU2V0IFJvdXRlci5uYXZpZ2F0ZUF3YXlNZXNzYWdlIHRvIGEgc3RyaW5nIHRvIGNvbmZpcm0gd2hlbiBhIHVzZXIgaXMgbmF2aWdhdGluZ1xuICAjIGF3YXkgZnJvbSB0aGVpciBjdXJyZW50IHJvdXRlLiBTZXQgaXQgdG8gZmFsc2UgdG8gdHVybiBvZmYgdGhlIGNvbmZpcm1hdGlvbi5cbiAgbmF2aWdhdGVBd2F5TWVzc2FnZTogZmFsc2VcblxuICAjIE92ZXJyaWRlIEJhY2tib25lLlJvdXRlci5leGVjdXRlXG4gIGV4ZWN1dGU6IChjYWxsYmFjaywgYXJncywgbmFtZSkgLT5cbiAgICAjIEltcGxlbWVudCBzdXBwb3J0IGZvciBSb3V0ZXIubmF2aWdhdGVBd2F5TWVzc2FnZVxuICAgIGlmIHRoaXMubmF2aWdhdGVBd2F5TWVzc2FnZSBpc250IGZhbHNlXG4gICAgICBpZiAhY29uZmlybSB0aGlzLm5hdmlnYXRlQXdheU1lc3NhZ2VcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMubmF2aWdhdGVBd2F5TWVzc2FnZSA9IGZhbHNlXG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZyh0cnVlKVxuICAgIGlmIChjYWxsYmFjaylcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXG4gIHJvdXRlczpcbiAgICAnbG9naW4nICAgIDogJ2xvZ2luJ1xuICAgICdyZWdpc3RlcicgOiAncmVnaXN0ZXInXG4gICAgJ2xvZ291dCcgICA6ICdsb2dvdXQnXG4gICAgJ2FjY291bnQnICA6ICdhY2NvdW50J1xuXG4gICAgJ3RyYW5zZmVyJyA6ICd0cmFuc2ZlcidcblxuICAgICdzZXR0aW5ncycgOiAnc2V0dGluZ3MnXG4gICAgJ3VwZGF0ZScgOiAndXBkYXRlJ1xuXG4gICAgJycgOiAnbGFuZGluZydcblxuICAgICdsb2dzJyA6ICdsb2dzJ1xuXG4gICAgIyBDbGFzc1xuICAgICdjbGFzcycgICAgICAgICAgOiAna2xhc3MnXG4gICAgJ2NsYXNzL2VkaXQvOmlkJyA6ICdrbGFzc0VkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvOnN0dWRlbnRJZCcgICAgICAgIDogJ3N0dWRlbnRFZGl0J1xuICAgICdjbGFzcy9zdHVkZW50L3JlcG9ydC86c3R1ZGVudElkJyA6ICdzdHVkZW50UmVwb3J0J1xuICAgICdjbGFzcy9zdWJ0ZXN0LzppZCcgOiAnZWRpdEtsYXNzU3VidGVzdCdcbiAgICAnY2xhc3MvcXVlc3Rpb24vOmlkJyA6IFwiZWRpdEtsYXNzUXVlc3Rpb25cIlxuXG4gICAgJ2NsYXNzLzppZC86cGFydCcgOiAna2xhc3NQYXJ0bHknXG4gICAgJ2NsYXNzLzppZCcgICAgICAgOiAna2xhc3NQYXJ0bHknXG5cbiAgICAnY2xhc3MvcnVuLzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAncnVuU3VidGVzdCdcblxuICAgICdjbGFzcy9yZXN1bHQvc3R1ZGVudC9zdWJ0ZXN0LzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAnc3R1ZGVudFN1YnRlc3QnXG5cbiAgICAnY3VycmljdWxhJyAgICAgICAgIDogJ2N1cnJpY3VsYSdcbiAgICAnY3VycmljdWx1bS86aWQnICAgIDogJ2N1cnJpY3VsdW0nXG4gICAgJ2N1cnJpY3VsdW1JbXBvcnQnICA6ICdjdXJyaWN1bHVtSW1wb3J0J1xuXG4gICAgJ3JlcG9ydC9rbGFzc0dyb3VwaW5nLzprbGFzc0lkLzpwYXJ0JyA6ICdrbGFzc0dyb3VwaW5nJ1xuICAgICdyZXBvcnQvbWFzdGVyeUNoZWNrLzpzdHVkZW50SWQnICAgICAgOiAnbWFzdGVyeUNoZWNrJ1xuICAgICdyZXBvcnQvcHJvZ3Jlc3MvOnN0dWRlbnRJZC86a2xhc3NJZCcgOiAncHJvZ3Jlc3NSZXBvcnQnXG5cbiAgICAndGVhY2hlcnMnIDogJ3RlYWNoZXJzJ1xuXG5cbiAgICAjIHNlcnZlciAvIG1vYmlsZVxuICAgICdncm91cHMnIDogJ2dyb3VwcydcblxuICAgICdhc3Nlc3NtZW50cycgICAgICAgIDogJ2Fzc2Vzc21lbnRzJ1xuXG4gICAgJ3J1bi86aWQnICAgICAgIDogJ3J1bidcbiAgICAncnVuTWFyLzppZCcgICAgICAgOiAncnVuTWFyJ1xuICAgICdwcmludC86aWQvOmZvcm1hdCcgICAgICAgOiAncHJpbnQnXG4gICAgJ2RhdGFFbnRyeS86aWQnIDogJ2RhdGFFbnRyeSdcblxuICAgICdyZXN1bWUvOmFzc2Vzc21lbnRJZC86cmVzdWx0SWQnICAgIDogJ3Jlc3VtZSdcblxuICAgICdyZXN0YXJ0LzppZCcgICA6ICdyZXN0YXJ0J1xuICAgICdlZGl0LzppZCcgICAgICA6ICdlZGl0J1xuICAgICdyZXN1bHRzLzppZCcgICA6ICdyZXN1bHRzJ1xuICAgICdpbXBvcnQnICAgICAgICA6ICdpbXBvcnQnXG5cbiAgICAnc3VidGVzdC86aWQnICAgICAgIDogJ2VkaXRTdWJ0ZXN0J1xuXG4gICAgJ3F1ZXN0aW9uLzppZCcgOiAnZWRpdFF1ZXN0aW9uJ1xuICAgICdkYXNoYm9hcmQnIDogJ2Rhc2hib2FyZCdcbiAgICAnZGFzaGJvYXJkLypvcHRpb25zJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2FkbWluJyA6ICdhZG1pbidcblxuICAgICdzeW5jLzppZCcgICAgICA6ICdzeW5jJ1xuXG5cbiAgYWRtaW46IChvcHRpb25zKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgJC5jb3VjaC5hbGxEYnNcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YWJhc2VzKSA9PlxuICAgICAgICAgICAgZ3JvdXBzID0gZGF0YWJhc2VzLmZpbHRlciAoZGF0YWJhc2UpIC0+IGRhdGFiYXNlLmluZGV4T2YoXCJncm91cC1cIikgPT0gMFxuICAgICAgICAgICAgdmlldyA9IG5ldyBBZG1pblZpZXdcbiAgICAgICAgICAgICAgZ3JvdXBzIDogZ3JvdXBzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBkYXNoYm9hcmQ6IChvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBvcHRpb25zPy5zcGxpdCgvXFwvLylcbiAgICAjZGVmYXVsdCB2aWV3IG9wdGlvbnNcbiAgICByZXBvcnRWaWV3T3B0aW9ucyA9XG4gICAgICBhc3Nlc3NtZW50OiBcIkFsbFwiXG4gICAgICBncm91cEJ5OiBcImVudW1lcmF0b3JcIlxuXG4gICAgIyBBbGxvd3MgdXMgdG8gZ2V0IG5hbWUvdmFsdWUgcGFpcnMgZnJvbSBVUkxcbiAgICBfLmVhY2ggb3B0aW9ucywgKG9wdGlvbixpbmRleCkgLT5cbiAgICAgIHVubGVzcyBpbmRleCAlIDJcbiAgICAgICAgcmVwb3J0Vmlld09wdGlvbnNbb3B0aW9uXSA9IG9wdGlvbnNbaW5kZXgrMV1cblxuICAgIHZpZXcgPSBuZXcgRGFzaGJvYXJkVmlldygpXG4gICAgdmlldy5vcHRpb25zID0gcmVwb3J0Vmlld09wdGlvbnNcbiAgICB2bS5zaG93IHZpZXdcblxuICBsYW5kaW5nOiAocmVmcmVzaCA9IGZhbHNlKSAtPlxuXG4gICAgY2FsbEZ1bmN0aW9uID0gbm90IHJlZnJlc2hcblxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCBjYWxsRnVuY3Rpb25cblxuICAgIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpIGlmIHJlZnJlc2ggIyB0aGlzIGlzIGZvciB0aGUgc3R1cGlkIGNsaWNrIGJ1Z1xuXG5cbiAgZ3JvdXBzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEdyb3Vwc1ZpZXdcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgI1xuICAjIENsYXNzXG4gICNcbiAgY3VycmljdWxhOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgIGN1cnJpY3VsYS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bGFWaWV3XG4gICAgICAgICAgICAgIFwiY3VycmljdWxhXCIgOiBjb2xsZWN0aW9uXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBjdXJyaWN1bHVtOiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlIFwiY3VycmljdWx1bUlkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgYWxsUXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBbXVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cy5lYWNoIChzdWJ0ZXN0KSAtPiBxdWVzdGlvbnMgPSBxdWVzdGlvbnMuY29uY2F0KGFsbFF1ZXN0aW9ucy53aGVyZSBcInN1YnRlc3RJZFwiIDogc3VidGVzdC5pZCApXG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgOiBxdWVzdGlvbnNcblxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGN1cnJpY3VsdW1FZGl0OiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFBhcnRzID0gKHN1YnRlc3QuZ2V0KFwicGFydFwiKSBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0cylcbiAgICAgICAgICAgICAgICBwYXJ0Q291bnQgPSBNYXRoLm1heC5hcHBseSBNYXRoLCBhbGxQYXJ0c1xuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgIFwicGFydHNcIiA6IHBhcnRDb3VudFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUltcG9ydDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50SW1wb3J0Vmlld1xuICAgICAgICAgIG5vdW4gOiBcImN1cnJpY3VsdW1cIlxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYWxsS2xhc3NlcyA9IG5ldyBLbGFzc2VzXG4gICAgICAgIGFsbEtsYXNzZXMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgICAgICAgICAgYWxsQ3VycmljdWxhLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGN1cnJpY3VsYUNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG4gICAgICAgICAgICAgICAgICAgICAga2xhc3NDb2xsZWN0aW9uID0gbmV3IEtsYXNzZXMga2xhc3NDb2xsZWN0aW9uLndoZXJlKFwidGVhY2hlcklkXCIgOiBUYW5nZXJpbmUudXNlci5nZXQoXCJ0ZWFjaGVySWRcIikpXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3Nlc1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc2VzICAgOiBrbGFzc0NvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBjdXJyaWN1bGEgOiBjdXJyaWN1bGFDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgdGVhY2hlcnMgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NFZGl0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIF9pZCA6IGlkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoYWxsU3R1ZGVudHMpIC0+XG4gICAgICAgICAgICAgICAgICAgIGtsYXNzU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgYWxsU3R1ZGVudHMud2hlcmUge2tsYXNzSWQgOiBpZH1cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc0VkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAga2xhc3MgICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzICAgIDoga2xhc3NTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzIDogYWxsU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgICA6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzUGFydGx5OiAoa2xhc3NJZCwgcGFydD1udWxsKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDoga2xhc3NJZFxuICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIikgKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1BhcnRseVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFydFwiICAgICAgIDogcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiICAgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgICA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIHN0dWRlbnRTdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAga2V5IDogW3N0dWRlbnRJZCxzdWJ0ZXN0SWRdXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBjb2xsZWN0aW9uLndoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzSWRcIiAgIDogc3R1ZGVudC5nZXQoXCJrbGFzc0lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJlc3VsdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGxSZXN1bHRzXCIgOiBhbGxSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJldmlvdXNcIiA6IHJlc3BvbnNlLnJvd3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBydW5TdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogc3VidGVzdElkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcblxuICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICBvblN0dWRlbnRSZWFkeSA9IChzdHVkZW50LCBzdWJ0ZXN0KSAtPlxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MgPSAoc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb249bnVsbCwgbGlua2VkUmVzdWx0PXt9KSAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJ1blZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgICAgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgICA6IHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgIFwibGlua2VkUmVzdWx0XCIgOiBsaW5rZWRSZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG51bGxcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3QuZ2V0KFwiZ3JpZExpbmtJZFwiKV1cbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZXNwb25zZS5yb3dzICE9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2VkUmVzdWx0ID0gbmV3IEtsYXNzUmVzdWx0IF8ubGFzdChyZXNwb25zZS5yb3dzKT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMocXVlc3Rpb25zLndoZXJlIHtzdWJ0ZXN0SWQgOiBzdWJ0ZXN0SWQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb25zLCBsaW5rZWRSZXN1bHQpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAjIGVuZCBvZiBvblN0dWRlbnRSZWFkeVxuXG4gICAgICAgICAgICBpZiBzdHVkZW50SWQgPT0gXCJ0ZXN0XCJcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgc3R1ZGVudC5zYXZlIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5KHN0dWRlbnQsIHN1YnRlc3QpXG5cbiAgcmVnaXN0ZXI6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBSZWdpc3RlclRlYWNoZXJWaWV3XG4gICAgICAgICAgdXNlciA6IG5ldyBVc2VyXG4gICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHN0dWRlbnRFZGl0OiAoIHN0dWRlbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBfaWQgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCkgLT5cbiAgICAgICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN0dWRlbnRFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudCA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBrbGFzc2VzIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgQXNzZXNzbWVudFxuICAjXG5cblxuICBkYXRhRW50cnk6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICAgICAgICAgIGtleTogXCJxdWVzdGlvbi0je2Fzc2Vzc21lbnRJZH1cIlxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc0J5U3VidGVzdElkID0gcXVlc3Rpb25zLmluZGV4QnkoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdElkLCBxdWVzdGlvbnMgb2YgcXVlc3Rpb25zQnlTdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQuc3VidGVzdHMuZ2V0KHN1YnRlc3RJZCkucXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50RGF0YUVudHJ5VmlldyBhc3Nlc3NtZW50OiBhc3Nlc3NtZW50XG5cblxuXG4gIHN5bmM6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudFN5bmNWaWV3IFwiYXNzZXNzbWVudFwiOiBhc3Nlc3NtZW50XG5cbiAgYXNzZXNzbWVudHM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnRzID0gbmV3IEFzc2Vzc21lbnRzXG4gICAgICAgIGFzc2Vzc21lbnRzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiMgICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50c01lbnVWaWV3XG4jICAgICAgICAgICAgICBhc3Nlc3NtZW50cyA6IGFzc2Vzc21lbnRzXG4gICAgICAgICAgICBhc3Nlc3NtZW50c1ZpZXcgPSBuZXcgQXNzZXNzbWVudHNNZW51Vmlld1xuICAgICAgICAgICAgICBhc3Nlc3NtZW50cyA6IGFzc2Vzc21lbnRzXG4gICAgICAgICAgICBUYW5nZXJpbmUuYXBwLnJtLmdldCgnbWFpblJlZ2lvbicpLnNob3cgYXNzZXNzbWVudHNWaWV3XG5cbiAgcmVzdGFydDogKG5hbWUpIC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJ1bi8je25hbWV9XCIsIHRydWVcblxuICBydW46IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LmRlZXBGZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudFJ1blZpZXcgbW9kZWw6IGFzc2Vzc21lbnRcblxuICBydW5NYXI6IChpZCkgLT5cbiAgICByb3V0ZXIgPSB0aGlzXG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHJvdXRlci5uYXZpZ2F0ZUF3YXlNZXNzYWdlID0gdChcIlJvdXRlci5tZXNzYWdlLnF1aXRfYXNzZXNzbWVudFwiKVxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZGVlcEZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICBkYXNoYm9hcmRMYXlvdXQgPSBuZXcgRGFzaGJvYXJkTGF5b3V0KCk7XG4gICAgICAgICAgICBUYW5nZXJpbmUuYXBwLnJtLmdldCgnbWFpblJlZ2lvbicpLnNob3cgZGFzaGJvYXJkTGF5b3V0XG4gICAgICAgICAgICBkYXNoYm9hcmRMYXlvdXQuY29udGVudFJlZ2lvbi5yZXNldCgpXG4gICAgICAgICAgICBhc3Nlc3NtZW50Q29tcG9zaXRlVmlldyA9IG5ldyBBc3Nlc3NtZW50Q29tcG9zaXRlVmlld1xuICAgICAgICAgICAgICBhc3Nlc3NtZW50OiBhc3Nlc3NtZW50XG4gICAgICAgICAgICBkYXNoYm9hcmRMYXlvdXQuY29udGVudFJlZ2lvbi5zaG93KGFzc2Vzc21lbnRDb21wb3NpdGVWaWV3KVxuICAgICAgICAgIGVycm9yOiAobW9kZWwsIGVyciwgY2IpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBKU09OLnN0cmluZ2lmeSBlcnJcblxuICByZXN1bWU6IChhc3Nlc3NtZW50SWQsIHJlc3VsdElkKSAtPlxuICAgIHJvdXRlciA9IHRoaXNcbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgcm91dGVyLm5hdmlnYXRlQXdheU1lc3NhZ2UgPSB0KFwiUm91dGVyLm1lc3NhZ2UucXVpdF9hc3Nlc3NtZW50XCIpXG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZGVlcEZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgUmVzdWx0IFwiX2lkXCIgOiByZXN1bHRJZFxuICAgICAgICAgICAgcmVzdWx0LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgICAgICAjIEJ1aWxkIGFuIEFzc2Vzc21lbnRDb21wb3NpdGVWaWV3LlxuICAgICAgICAgICAgICAgIGFzc2Vzc21lbnRDb21wb3NpdGVWaWV3ID0gbmV3IEFzc2Vzc21lbnRDb21wb3NpdGVWaWV3XG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50OiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICByZXN1bHQ6IHJlc3VsdFxuXG4gICAgICAgICAgICAgICAgIyBAdG9kbyBSSjogUmVtb3ZlLiBJJ3ZlIHNlZW4gdGhpcyByZXF1aXJlZCBieSBzb21ldGhpbmcuLi5cbiAgICAgICAgICAgICAgICByZXN1bHQucGFyZW50ID0gYXNzZXNzbWVudENvbXBvc2l0ZVZpZXdcblxuICAgICAgICAgICAgICAgICMgU2V0IHBhcnRpY2lwYW50IGluZm8gaW4gdGhlIFRhbmdlcmluZSBOYXYuXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3QgaW4gcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpXG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmRhdGE/ICYmIHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZD9cbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLm5hdi5zZXRTdHVkZW50IHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZFxuXG4gICAgICAgICAgICAgICAgIyBBZGQgYXNzZXNzbWVudENvbXBvc2l0ZVZpZXcgdG8gdGhlIG1haW5SZWdpb24uXG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLmFwcC5ybS5nZXQoJ21haW5SZWdpb24nKS5zaG93IGFzc2Vzc21lbnRDb21wb3NpdGVWaWV3XG5cblxuXG4gIHJlc3VsdHM6IChhc3Nlc3NtZW50SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAgLT5cbiAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICBvcHRpb25zOlxuICAgICAgICAgICAgICAgIGtleTogXCJyZXN1bHQtI3thc3Nlc3NtZW50SWR9XCJcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFJlc3VsdHNWaWV3XG4gICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICAgIDogYWxsUmVzdWx0c1xuIyAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuYXBwLnJtLmdldCgnbWFpblJlZ2lvbicpLnNob3cgdmlld1xuXG5cbiAgY3N2OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IENTVlZpZXdcbiAgICAgICAgICBhc3Nlc3NtZW50SWQgOiBpZFxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBjc3ZfYWxwaGE6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICAtPlxuICAgICAgICAgICAgZmlsZW5hbWUgPSBhc3Nlc3NtZW50LmdldChcIm5hbWVcIikgKyBcIi1cIiArIG1vbWVudCgpLmZvcm1hdChcIllZWVktTU1NLUREIEhIOm1tXCIpXG4gICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbiA9IFwiL1wiICsgVGFuZ2VyaW5lLmRiTmFtZSArIFwiL19kZXNpZ24vXCIgKyBUYW5nZXJpbmUuZGVzaWduRG9jICsgXCIvX2xpc3QvY3N2L2NzdlJvd0J5UmVzdWx0P2tleT1cXFwiI3tpZH1cXFwiJmZpbGVuYW1lPSN7ZmlsZW5hbWV9XCJcblxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBlcnJWaWV3ID0gbmV3IEVycm9yVmlld1xuICAgICAgICAgIG1lc3NhZ2UgOiBcIllvdSdyZSBub3QgYW4gYWRtaW4gdXNlclwiXG4gICAgICAgICAgZGV0YWlscyA6IFwiSG93IGRpZCB5b3UgZ2V0IGhlcmU/XCJcbiAgICAgICAgdm0uc2hvdyBlcnJWaWV3XG5cbiAgI1xuICAjIFJlcG9ydHNcbiAgI1xuICBrbGFzc0dyb3VwaW5nOiAoa2xhc3NJZCwgcGFydCkgLT5cbiAgICBwYXJ0ID0gcGFyc2VJbnQocGFydClcbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBjb2xsZWN0aW9uLndoZXJlIFwicGFydFwiIDogcGFydFxuICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKCByZXN1bHRzICkgLT5cbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgc3R1ZGVudHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzR3JvdXBpbmdWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgOiBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IGZpbHRlcmVkUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIG1hc3RlcnlDaGVjazogKHN0dWRlbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChzdHVkZW50KSAtPlxuICAgICAgICAgICAga2xhc3NJZCA9IHN0dWRlbnQuZ2V0IFwia2xhc3NJZFwiXG4gICAgICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDogc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZCwgXCJyZXBvcnRUeXBlXCIgOiBcIm1hc3RlcnlcIiwgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICMgZ2V0IGEgbGlzdCBvZiBzdWJ0ZXN0cyBpbnZvbHZlZFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdFtyZXN1bHQuZ2V0KFwic3VidGVzdElkXCIpXSA9IHRydWUgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0gXy5rZXlzKHN1YnRlc3RJZExpc3QpXG5cbiAgICAgICAgICAgICAgICAgICAgIyBtYWtlIGEgY29sbGVjdGlvbiBhbmQgZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24gPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24uYWRkIG5ldyBTdWJ0ZXN0KFwiX2lkXCIgOiBzdWJ0ZXN0SWQpIGZvciBzdWJ0ZXN0SWQgaW4gc3VidGVzdElkTGlzdFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IE1hc3RlcnlDaGVja1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBwcm9ncmVzc1JlcG9ydDogKHN0dWRlbnRJZCwga2xhc3NJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgIyBzYXZlIHRoaXMgY3JhenkgZnVuY3Rpb24gZm9yIGxhdGVyXG4gICAgICAgICMgc3R1ZGVudElkIGNhbiBoYXZlIHRoZSB2YWx1ZSBcImFsbFwiLCBpbiB3aGljaCBjYXNlIHN0dWRlbnQgc2hvdWxkID09IG51bGxcbiAgICAgICAgYWZ0ZXJGZXRjaCA9ICggc3R1ZGVudCwgc3R1ZGVudHMgKSAtPlxuICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGFsbFN1YnRlc3RzICkgLT5cbiAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlXG4gICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgICAgICAgICAgXCJyZXBvcnRUeXBlXCIgICA6IFwicHJvZ3Jlc3NcIlxuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyBjb2xsZWN0aW9uLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZCwgXCJyZXBvcnRUeXBlXCIgOiBcInByb2dyZXNzXCJcblxuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgaWYgc3R1ZGVudHM/XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGZpbHRlciBgUmVzdWx0c2AgYnkgYEtsYXNzYCdzIGN1cnJlbnQgYFN0dWRlbnRzYFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFByb2dyZXNzVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgaWYgc3R1ZGVudElkICE9IFwiYWxsXCJcbiAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IGFmdGVyRmV0Y2ggc3R1ZGVudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBudWxsLCBzdHVkZW50c1xuXG4gICNcbiAgIyBTdWJ0ZXN0c1xuICAjXG4gIGVkaXRTdWJ0ZXN0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBfaWQgOiBpZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogc3VidGVzdC5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN1YnRlc3RFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWwgICAgICA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50IDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIGVkaXRLbGFzc1N1YnRlc3Q6IChpZCkgLT5cblxuICAgIG9uU3VjY2VzcyA9IChzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnM9bnVsbCkgLT5cbiAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgbW9kZWwgICAgICA6IHN1YnRlc3RcbiAgICAgICAgY3VycmljdWx1bSA6IGN1cnJpY3VsdW1cbiAgICAgICAgcXVlc3Rpb25zICA6IHF1ZXN0aW9uc1xuICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tjdXJyaWN1bHVtLmlkfVwiXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnMud2hlcmUoXCJzdWJ0ZXN0SWRcIjpzdWJ0ZXN0LmlkKVxuICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Mgc3VidGVzdCwgY3VycmljdWx1bVxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgI1xuICAjIFF1ZXN0aW9uXG4gICNcbiAgZWRpdFF1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIF9pZCA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gIGVkaXRLbGFzc1F1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIFwiX2lkXCIgOiBpZFxuICAgICAgICBxdWVzdGlvbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChxdWVzdGlvbiwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdFxuICAgICAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUXVlc3Rpb25FZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25cIiAgIDogcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgVXNlclxuICAjXG4gIGxvZ2luOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG5cbiAgICAgICAgdXNlcnMgPSBuZXcgVGFibGV0VXNlcnNcbiAgICAgICAgdXNlcnMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuIyAgICAgICAgICAgIHZtLnNob3cgbmV3IExvZ2luVmlld1xuIyAgICAgICAgICAgICAgdXNlcnM6IHVzZXJzXG4gICAgICAgICAgICBsb2dpblZpZXcgPSBuZXcgTG9naW5WaWV3XG4gICAgICAgICAgICAgIHVzZXJzOiB1c2Vyc1xuIyAgICAgICAgICAgIGRhc2hib2FyZExheW91dCA9IG5ldyBEYXNoYm9hcmRMYXlvdXQoKTtcbiAgICAgICAgICAgIFRhbmdlcmluZS5hcHAucm0uZ2V0KCdtYWluUmVnaW9uJykuc2hvdyBsb2dpblZpZXdcbiAgICAgICAgICAgIGxvZ2luVmlldy5hZnRlclJlbmRlcigpXG4jICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0LmNvbnRlbnRSZWdpb24uc2hvdyhsb2dpblZpZXcpXG5cbiAgbG9nb3V0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLmxvZ291dCgpXG5cbiAgYWNjb3VudDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc2hvd1ZpZXcgPSAodGVhY2hlcikgLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IEFjY291bnRWaWV3XG4gICAgICAgICAgICB1c2VyIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgICAgICAgIHRlYWNoZXI6IHRlYWNoZXJcbiAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBpZiBcImNsYXNzXCIgaXMgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIilcbiAgICAgICAgICBpZiBUYW5nZXJpbmUudXNlci5oYXMoXCJ0ZWFjaGVySWRcIilcbiAgICAgICAgICAgIHRlYWNoZXIgPSBuZXcgVGVhY2hlciBcIl9pZFwiOiBUYW5nZXJpbmUudXNlci5nZXQoXCJ0ZWFjaGVySWRcIilcbiAgICAgICAgICAgIHRlYWNoZXIuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzaG93Vmlldyh0ZWFjaGVyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRlYWNoZXIgPSBuZXcgVGVhY2hlciBcIl9pZFwiOiBVdGlscy5odW1hbkdVSUQoKVxuICAgICAgICAgICAgdGVhY2hlci5zYXZlIG51bGwsXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc2hvd1ZpZXcodGVhY2hlcilcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2hvd1ZpZXcoKVxuXG4gIHNldHRpbmdzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IFNldHRpbmdzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGxvZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGxvZ3MgPSBuZXcgTG9nc1xuICAgICAgICBsb2dzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTG9nVmlld1xuICAgICAgICAgICAgICBsb2dzOiBsb2dzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIHRlYWNoZXJzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB1c2VycyA9IG5ldyBUYWJsZXRVc2Vyc1xuICAgICAgICB1c2Vycy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFRlYWNoZXJzVmlld1xuICAgICAgICAgICAgICAgICAgdGVhY2hlcnM6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICB1c2VyczogdXNlcnNcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICMgVHJhbnNmZXIgYSBuZXcgdXNlciBmcm9tIHRhbmdlcmluZS1jZW50cmFsIGludG8gdGFuZ2VyaW5lXG4gIHRyYW5zZmVyOiAtPlxuICAgIGdldFZhcnMgPSBVdGlscy4kX0dFVCgpXG4gICAgbmFtZSA9IGdldFZhcnMubmFtZVxuICAgICQuY291Y2gubG9nb3V0XG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAkLmNvb2tpZSBcIkF1dGhTZXNzaW9uXCIsIG51bGxcbiAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgIFwibmFtZVwiICAgICA6IG5hbWVcbiAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICQuY291Y2guc2lnbnVwXG4gICAgICAgICAgICAgIFwibmFtZVwiIDogIG5hbWVcbiAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW1wiX2FkbWluXCJdXG4gICAgICAgICAgICAsIG5hbWUsXG4gICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICB1c2VyID0gbmV3IFVzZXJcbiAgICAgICAgICAgICAgdXNlci5zYXZlXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgIDogbmFtZVxuICAgICAgICAgICAgICAgIFwiaWRcIiAgICA6IFwidGFuZ2VyaW5lLnVzZXI6XCIrbmFtZVxuICAgICAgICAgICAgICAgIFwicm9sZXNcIiA6IFtdXG4gICAgICAgICAgICAgICAgXCJmcm9tXCIgIDogXCJ0Y1wiXG4gICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICB3YWl0OiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICQuY291Y2gubG9naW5cbiAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgICAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIkVycm9yIHRyYW5zZmVyaW5nIHVzZXIuXCJcbiJdfQ==
