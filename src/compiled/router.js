var Router,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Router = (function(superClass) {
  extend(Router, superClass);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

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
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
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
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
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

//# sourceMappingURL=data:application/json;base64,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b3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUm91dGVyIGV4dGVuZHMgQmFja2JvbmUuUm91dGVyXG4gIHJvdXRlczpcbiAgICAnbG9naW4nICAgIDogJ2xvZ2luJ1xuICAgICdyZWdpc3RlcicgOiAncmVnaXN0ZXInXG4gICAgJ2xvZ291dCcgICA6ICdsb2dvdXQnXG4gICAgJ2FjY291bnQnICA6ICdhY2NvdW50J1xuXG4gICAgJ3RyYW5zZmVyJyA6ICd0cmFuc2ZlcidcblxuICAgICdzZXR0aW5ncycgOiAnc2V0dGluZ3MnXG4gICAgJ3VwZGF0ZScgOiAndXBkYXRlJ1xuXG4gICAgJycgOiAnbGFuZGluZydcblxuICAgICdsb2dzJyA6ICdsb2dzJ1xuXG4gICAgIyBDbGFzc1xuICAgICdjbGFzcycgICAgICAgICAgOiAna2xhc3MnXG4gICAgJ2NsYXNzL2VkaXQvOmlkJyA6ICdrbGFzc0VkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvOnN0dWRlbnRJZCcgICAgICAgIDogJ3N0dWRlbnRFZGl0J1xuICAgICdjbGFzcy9zdHVkZW50L3JlcG9ydC86c3R1ZGVudElkJyA6ICdzdHVkZW50UmVwb3J0J1xuICAgICdjbGFzcy9zdWJ0ZXN0LzppZCcgOiAnZWRpdEtsYXNzU3VidGVzdCdcbiAgICAnY2xhc3MvcXVlc3Rpb24vOmlkJyA6IFwiZWRpdEtsYXNzUXVlc3Rpb25cIlxuXG4gICAgJ2NsYXNzLzppZC86cGFydCcgOiAna2xhc3NQYXJ0bHknXG4gICAgJ2NsYXNzLzppZCcgICAgICAgOiAna2xhc3NQYXJ0bHknXG5cbiAgICAnY2xhc3MvcnVuLzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAncnVuU3VidGVzdCdcblxuICAgICdjbGFzcy9yZXN1bHQvc3R1ZGVudC9zdWJ0ZXN0LzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAnc3R1ZGVudFN1YnRlc3QnXG5cbiAgICAnY3VycmljdWxhJyAgICAgICAgIDogJ2N1cnJpY3VsYSdcbiAgICAnY3VycmljdWx1bS86aWQnICAgIDogJ2N1cnJpY3VsdW0nXG4gICAgJ2N1cnJpY3VsdW1JbXBvcnQnICA6ICdjdXJyaWN1bHVtSW1wb3J0J1xuXG4gICAgJ3JlcG9ydC9rbGFzc0dyb3VwaW5nLzprbGFzc0lkLzpwYXJ0JyA6ICdrbGFzc0dyb3VwaW5nJ1xuICAgICdyZXBvcnQvbWFzdGVyeUNoZWNrLzpzdHVkZW50SWQnICAgICAgOiAnbWFzdGVyeUNoZWNrJ1xuICAgICdyZXBvcnQvcHJvZ3Jlc3MvOnN0dWRlbnRJZC86a2xhc3NJZCcgOiAncHJvZ3Jlc3NSZXBvcnQnXG5cbiAgICAndGVhY2hlcnMnIDogJ3RlYWNoZXJzJ1xuXG5cbiAgICAjIHNlcnZlciAvIG1vYmlsZVxuICAgICdncm91cHMnIDogJ2dyb3VwcydcblxuICAgICdhc3Nlc3NtZW50cycgICAgICAgIDogJ2Fzc2Vzc21lbnRzJ1xuXG4gICAgJ3J1bi86aWQnICAgICAgIDogJ3J1bidcbiAgICAncnVuTWFyLzppZCcgICAgICAgOiAncnVuTWFyJ1xuICAgICdwcmludC86aWQvOmZvcm1hdCcgICAgICAgOiAncHJpbnQnXG4gICAgJ2RhdGFFbnRyeS86aWQnIDogJ2RhdGFFbnRyeSdcblxuICAgICdyZXN1bWUvOmFzc2Vzc21lbnRJZC86cmVzdWx0SWQnICAgIDogJ3Jlc3VtZSdcblxuICAgICdyZXN0YXJ0LzppZCcgICA6ICdyZXN0YXJ0J1xuICAgICdlZGl0LzppZCcgICAgICA6ICdlZGl0J1xuICAgICdyZXN1bHRzLzppZCcgICA6ICdyZXN1bHRzJ1xuICAgICdpbXBvcnQnICAgICAgICA6ICdpbXBvcnQnXG5cbiAgICAnc3VidGVzdC86aWQnICAgICAgIDogJ2VkaXRTdWJ0ZXN0J1xuXG4gICAgJ3F1ZXN0aW9uLzppZCcgOiAnZWRpdFF1ZXN0aW9uJ1xuICAgICdkYXNoYm9hcmQnIDogJ2Rhc2hib2FyZCdcbiAgICAnZGFzaGJvYXJkLypvcHRpb25zJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2FkbWluJyA6ICdhZG1pbidcblxuICAgICdzeW5jLzppZCcgICAgICA6ICdzeW5jJ1xuXG5cbiAgYWRtaW46IChvcHRpb25zKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgJC5jb3VjaC5hbGxEYnNcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YWJhc2VzKSA9PlxuICAgICAgICAgICAgZ3JvdXBzID0gZGF0YWJhc2VzLmZpbHRlciAoZGF0YWJhc2UpIC0+IGRhdGFiYXNlLmluZGV4T2YoXCJncm91cC1cIikgPT0gMFxuICAgICAgICAgICAgdmlldyA9IG5ldyBBZG1pblZpZXdcbiAgICAgICAgICAgICAgZ3JvdXBzIDogZ3JvdXBzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBkYXNoYm9hcmQ6IChvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBvcHRpb25zPy5zcGxpdCgvXFwvLylcbiAgICAjZGVmYXVsdCB2aWV3IG9wdGlvbnNcbiAgICByZXBvcnRWaWV3T3B0aW9ucyA9XG4gICAgICBhc3Nlc3NtZW50OiBcIkFsbFwiXG4gICAgICBncm91cEJ5OiBcImVudW1lcmF0b3JcIlxuXG4gICAgIyBBbGxvd3MgdXMgdG8gZ2V0IG5hbWUvdmFsdWUgcGFpcnMgZnJvbSBVUkxcbiAgICBfLmVhY2ggb3B0aW9ucywgKG9wdGlvbixpbmRleCkgLT5cbiAgICAgIHVubGVzcyBpbmRleCAlIDJcbiAgICAgICAgcmVwb3J0Vmlld09wdGlvbnNbb3B0aW9uXSA9IG9wdGlvbnNbaW5kZXgrMV1cblxuICAgIHZpZXcgPSBuZXcgRGFzaGJvYXJkVmlldygpXG4gICAgdmlldy5vcHRpb25zID0gcmVwb3J0Vmlld09wdGlvbnNcbiAgICB2bS5zaG93IHZpZXdcblxuICBsYW5kaW5nOiAocmVmcmVzaCA9IGZhbHNlKSAtPlxuXG4gICAgY2FsbEZ1bmN0aW9uID0gbm90IHJlZnJlc2hcblxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCBjYWxsRnVuY3Rpb25cblxuICAgIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpIGlmIHJlZnJlc2ggIyB0aGlzIGlzIGZvciB0aGUgc3R1cGlkIGNsaWNrIGJ1Z1xuXG5cbiAgZ3JvdXBzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEdyb3Vwc1ZpZXdcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgI1xuICAjIENsYXNzXG4gICNcbiAgY3VycmljdWxhOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgIGN1cnJpY3VsYS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bGFWaWV3XG4gICAgICAgICAgICAgIFwiY3VycmljdWxhXCIgOiBjb2xsZWN0aW9uXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBjdXJyaWN1bHVtOiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlIFwiY3VycmljdWx1bUlkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgYWxsUXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBbXVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cy5lYWNoIChzdWJ0ZXN0KSAtPiBxdWVzdGlvbnMgPSBxdWVzdGlvbnMuY29uY2F0KGFsbFF1ZXN0aW9ucy53aGVyZSBcInN1YnRlc3RJZFwiIDogc3VidGVzdC5pZCApXG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgOiBxdWVzdGlvbnNcblxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGN1cnJpY3VsdW1FZGl0OiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFBhcnRzID0gKHN1YnRlc3QuZ2V0KFwicGFydFwiKSBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0cylcbiAgICAgICAgICAgICAgICBwYXJ0Q291bnQgPSBNYXRoLm1heC5hcHBseSBNYXRoLCBhbGxQYXJ0c1xuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgIFwicGFydHNcIiA6IHBhcnRDb3VudFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUltcG9ydDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50SW1wb3J0Vmlld1xuICAgICAgICAgIG5vdW4gOiBcImN1cnJpY3VsdW1cIlxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYWxsS2xhc3NlcyA9IG5ldyBLbGFzc2VzXG4gICAgICAgIGFsbEtsYXNzZXMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgICAgICAgICAgYWxsQ3VycmljdWxhLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGN1cnJpY3VsYUNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG4gICAgICAgICAgICAgICAgICAgICAga2xhc3NDb2xsZWN0aW9uID0gbmV3IEtsYXNzZXMga2xhc3NDb2xsZWN0aW9uLndoZXJlKFwidGVhY2hlcklkXCIgOiBUYW5nZXJpbmUudXNlci5nZXQoXCJ0ZWFjaGVySWRcIikpXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3Nlc1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc2VzICAgOiBrbGFzc0NvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBjdXJyaWN1bGEgOiBjdXJyaWN1bGFDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgdGVhY2hlcnMgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NFZGl0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIF9pZCA6IGlkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoYWxsU3R1ZGVudHMpIC0+XG4gICAgICAgICAgICAgICAgICAgIGtsYXNzU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgYWxsU3R1ZGVudHMud2hlcmUge2tsYXNzSWQgOiBpZH1cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc0VkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAga2xhc3MgICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzICAgIDoga2xhc3NTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzIDogYWxsU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgICA6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzUGFydGx5OiAoa2xhc3NJZCwgcGFydD1udWxsKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDoga2xhc3NJZFxuICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIikgKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1BhcnRseVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFydFwiICAgICAgIDogcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiICAgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgICA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIHN0dWRlbnRTdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAga2V5IDogW3N0dWRlbnRJZCxzdWJ0ZXN0SWRdXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBjb2xsZWN0aW9uLndoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzSWRcIiAgIDogc3R1ZGVudC5nZXQoXCJrbGFzc0lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJlc3VsdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGxSZXN1bHRzXCIgOiBhbGxSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJldmlvdXNcIiA6IHJlc3BvbnNlLnJvd3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBydW5TdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogc3VidGVzdElkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcblxuICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICBvblN0dWRlbnRSZWFkeSA9IChzdHVkZW50LCBzdWJ0ZXN0KSAtPlxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MgPSAoc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb249bnVsbCwgbGlua2VkUmVzdWx0PXt9KSAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJ1blZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgICAgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgICA6IHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgIFwibGlua2VkUmVzdWx0XCIgOiBsaW5rZWRSZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG51bGxcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3QuZ2V0KFwiZ3JpZExpbmtJZFwiKV1cbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZXNwb25zZS5yb3dzICE9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2VkUmVzdWx0ID0gbmV3IEtsYXNzUmVzdWx0IF8ubGFzdChyZXNwb25zZS5yb3dzKT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMocXVlc3Rpb25zLndoZXJlIHtzdWJ0ZXN0SWQgOiBzdWJ0ZXN0SWQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb25zLCBsaW5rZWRSZXN1bHQpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAjIGVuZCBvZiBvblN0dWRlbnRSZWFkeVxuXG4gICAgICAgICAgICBpZiBzdHVkZW50SWQgPT0gXCJ0ZXN0XCJcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgc3R1ZGVudC5zYXZlIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5KHN0dWRlbnQsIHN1YnRlc3QpXG5cbiAgcmVnaXN0ZXI6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBSZWdpc3RlclRlYWNoZXJWaWV3XG4gICAgICAgICAgdXNlciA6IG5ldyBVc2VyXG4gICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHN0dWRlbnRFZGl0OiAoIHN0dWRlbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBfaWQgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCkgLT5cbiAgICAgICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN0dWRlbnRFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudCA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBrbGFzc2VzIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgQXNzZXNzbWVudFxuICAjXG5cblxuICBkYXRhRW50cnk6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICAgICAgICAgIGtleTogXCJxdWVzdGlvbi0je2Fzc2Vzc21lbnRJZH1cIlxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc0J5U3VidGVzdElkID0gcXVlc3Rpb25zLmluZGV4QnkoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdElkLCBxdWVzdGlvbnMgb2YgcXVlc3Rpb25zQnlTdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQuc3VidGVzdHMuZ2V0KHN1YnRlc3RJZCkucXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50RGF0YUVudHJ5VmlldyBhc3Nlc3NtZW50OiBhc3Nlc3NtZW50XG5cblxuXG4gIHN5bmM6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudFN5bmNWaWV3IFwiYXNzZXNzbWVudFwiOiBhc3Nlc3NtZW50XG5cbiAgYXNzZXNzbWVudHM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnRzID0gbmV3IEFzc2Vzc21lbnRzXG4gICAgICAgIGFzc2Vzc21lbnRzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiMgICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50c01lbnVWaWV3XG4jICAgICAgICAgICAgICBhc3Nlc3NtZW50cyA6IGFzc2Vzc21lbnRzXG4gICAgICAgICAgICBhc3Nlc3NtZW50c1ZpZXcgPSBuZXcgQXNzZXNzbWVudHNNZW51Vmlld1xuICAgICAgICAgICAgICBhc3Nlc3NtZW50cyA6IGFzc2Vzc21lbnRzXG4gICAgICAgICAgICBUYW5nZXJpbmUuYXBwLnJtLmdldCgnbWFpblJlZ2lvbicpLnNob3cgYXNzZXNzbWVudHNWaWV3XG5cbiAgcmVzdGFydDogKG5hbWUpIC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJ1bi8je25hbWV9XCIsIHRydWVcblxuICBydW46IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LmRlZXBGZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudFJ1blZpZXcgbW9kZWw6IGFzc2Vzc21lbnRcblxuICBydW5NYXI6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LmRlZXBGZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0ID0gbmV3IERhc2hib2FyZExheW91dCgpO1xuICAgICAgICAgICAgVGFuZ2VyaW5lLmFwcC5ybS5nZXQoJ21haW5SZWdpb24nKS5zaG93IGRhc2hib2FyZExheW91dFxuICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0LmNvbnRlbnRSZWdpb24ucmVzZXQoKVxuICAgICAgICAgICAgYXNzZXNzbWVudENvbXBvc2l0ZVZpZXcgPSBuZXcgQXNzZXNzbWVudENvbXBvc2l0ZVZpZXdcbiAgICAgICAgICAgICAgYXNzZXNzbWVudDogYXNzZXNzbWVudFxuICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0LmNvbnRlbnRSZWdpb24uc2hvdyhhc3Nlc3NtZW50Q29tcG9zaXRlVmlldylcbiAgICAgICAgICBlcnJvcjogKG1vZGVsLCBlcnIsIGNiKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgSlNPTi5zdHJpbmdpZnkgZXJyXG5cbiAgcmVzdW1lOiAoYXNzZXNzbWVudElkLCByZXN1bHRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5kZWVwRmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogLT5cbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN1bHQgXCJfaWRcIiA6IHJlc3VsdElkXG4gICAgICAgICAgICByZXN1bHQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICMgQnVpbGQgYW4gQXNzZXNzbWVudENvbXBvc2l0ZVZpZXcuXG4gICAgICAgICAgICAgICAgYXNzZXNzbWVudENvbXBvc2l0ZVZpZXcgPSBuZXcgQXNzZXNzbWVudENvbXBvc2l0ZVZpZXdcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQ6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0XG5cbiAgICAgICAgICAgICAgICAjIEB0b2RvIFJKOiBSZW1vdmUuIEkndmUgc2VlbiB0aGlzIHJlcXVpcmVkIGJ5IHNvbWV0aGluZy4uLlxuICAgICAgICAgICAgICAgIHJlc3VsdC5wYXJlbnQgPSBhc3Nlc3NtZW50Q29tcG9zaXRlVmlld1xuXG4gICAgICAgICAgICAgICAgIyBTZXQgcGFydGljaXBhbnQgaW5mbyBpbiB0aGUgVGFuZ2VyaW5lIE5hdi5cbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdCBpbiByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZGF0YT8gJiYgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkP1xuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkXG5cbiAgICAgICAgICAgICAgICAjIEFkZCBhc3Nlc3NtZW50Q29tcG9zaXRlVmlldyB0byB0aGUgbWFpblJlZ2lvbi5cbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuYXBwLnJtLmdldCgnbWFpblJlZ2lvbicpLnNob3cgYXNzZXNzbWVudENvbXBvc2l0ZVZpZXdcblxuXG5cbiAgcmVzdWx0czogKGFzc2Vzc21lbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICAtPlxuICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgIG9wdGlvbnM6XG4gICAgICAgICAgICAgICAga2V5OiBcInJlc3VsdC0je2Fzc2Vzc21lbnRJZH1cIlxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUmVzdWx0c1ZpZXdcbiAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiBhbGxSZXN1bHRzXG4jICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgICAgICAgICAgIFRhbmdlcmluZS5hcHAucm0uZ2V0KCdtYWluUmVnaW9uJykuc2hvdyB2aWV3XG5cblxuICBjc3Y6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgQ1NWVmlld1xuICAgICAgICAgIGFzc2Vzc21lbnRJZCA6IGlkXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGNzdl9hbHBoYTogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogIC0+XG4gICAgICAgICAgICBmaWxlbmFtZSA9IGFzc2Vzc21lbnQuZ2V0KFwibmFtZVwiKSArIFwiLVwiICsgbW9tZW50KCkuZm9ybWF0KFwiWVlZWS1NTU0tREQgSEg6bW1cIilcbiAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gXCIvXCIgKyBUYW5nZXJpbmUuZGJOYW1lICsgXCIvX2Rlc2lnbi9cIiArIFRhbmdlcmluZS5kZXNpZ25Eb2MgKyBcIi9fbGlzdC9jc3YvY3N2Um93QnlSZXN1bHQ/a2V5PVxcXCIje2lkfVxcXCImZmlsZW5hbWU9I3tmaWxlbmFtZX1cIlxuXG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIGVyclZpZXcgPSBuZXcgRXJyb3JWaWV3XG4gICAgICAgICAgbWVzc2FnZSA6IFwiWW91J3JlIG5vdCBhbiBhZG1pbiB1c2VyXCJcbiAgICAgICAgICBkZXRhaWxzIDogXCJIb3cgZGlkIHlvdSBnZXQgaGVyZT9cIlxuICAgICAgICB2bS5zaG93IGVyclZpZXdcblxuICAjXG4gICMgUmVwb3J0c1xuICAjXG4gIGtsYXNzR3JvdXBpbmc6IChrbGFzc0lkLCBwYXJ0KSAtPlxuICAgIHBhcnQgPSBwYXJzZUludChwYXJ0KVxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGNvbGxlY3Rpb24ud2hlcmUgXCJwYXJ0XCIgOiBwYXJ0XG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIHJlc3VsdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAgICAgIyBmaWx0ZXIgYFJlc3VsdHNgIGJ5IGBLbGFzc2AncyBjdXJyZW50IGBTdHVkZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyBzdHVkZW50cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NHcm91cGluZ1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogZmlsdGVyZWRSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgbWFzdGVyeUNoZWNrOiAoc3R1ZGVudElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHN0dWRlbnQpIC0+XG4gICAgICAgICAgICBrbGFzc0lkID0gc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBzdHVkZW50LmdldCBcImtsYXNzSWRcIlxuICAgICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgY29sbGVjdGlvbi53aGVyZSBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkLCBcInJlcG9ydFR5cGVcIiA6IFwibWFzdGVyeVwiLCBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgIyBnZXQgYSBsaXN0IG9mIHN1YnRlc3RzIGludm9sdmVkXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0W3Jlc3VsdC5nZXQoXCJzdWJ0ZXN0SWRcIildID0gdHJ1ZSBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSBfLmtleXMoc3VidGVzdElkTGlzdClcblxuICAgICAgICAgICAgICAgICAgICAjIG1ha2UgYSBjb2xsZWN0aW9uIGFuZCBmZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbiA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5hZGQgbmV3IFN1YnRlc3QoXCJfaWRcIiA6IHN1YnRlc3RJZCkgZm9yIHN1YnRlc3RJZCBpbiBzdWJ0ZXN0SWRMaXN0XG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgTWFzdGVyeUNoZWNrVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdENvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHByb2dyZXNzUmVwb3J0OiAoc3R1ZGVudElkLCBrbGFzc0lkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAjIHNhdmUgdGhpcyBjcmF6eSBmdW5jdGlvbiBmb3IgbGF0ZXJcbiAgICAgICAgIyBzdHVkZW50SWQgY2FuIGhhdmUgdGhlIHZhbHVlIFwiYWxsXCIsIGluIHdoaWNoIGNhc2Ugc3R1ZGVudCBzaG91bGQgPT0gbnVsbFxuICAgICAgICBhZnRlckZldGNoID0gKCBzdHVkZW50LCBzdHVkZW50cyApIC0+XG4gICAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggYWxsU3VidGVzdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICBcInJlcG9ydFR5cGVcIiAgIDogXCJwcm9ncmVzc1wiXG4gICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkLCBcInJlcG9ydFR5cGVcIiA6IFwicHJvZ3Jlc3NcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBpZiBzdHVkZW50cz9cbiAgICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUHJvZ3Jlc3NWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBpZiBzdHVkZW50SWQgIT0gXCJhbGxcIlxuICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBzdHVkZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgIHN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAtPiBhZnRlckZldGNoIG51bGwsIHN0dWRlbnRzXG5cbiAgI1xuICAjIFN1YnRlc3RzXG4gICNcbiAgZWRpdFN1YnRlc3Q6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgU3VidGVzdEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbCAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgZWRpdEtsYXNzU3VidGVzdDogKGlkKSAtPlxuXG4gICAgb25TdWNjZXNzID0gKHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9ucz1udWxsKSAtPlxuICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RFZGl0Vmlld1xuICAgICAgICBtb2RlbCAgICAgIDogc3VidGVzdFxuICAgICAgICBjdXJyaWN1bHVtIDogY3VycmljdWx1bVxuICAgICAgICBxdWVzdGlvbnMgIDogcXVlc3Rpb25zXG4gICAgICB2bS5zaG93IHZpZXdcblxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgX2lkIDogaWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHN1YnRlc3QuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICAgICAgICAgICAgICAgIGtleTogXCJxdWVzdGlvbi0je2N1cnJpY3VsdW0uaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9ucy53aGVyZShcInN1YnRlc3RJZFwiOnN1YnRlc3QuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzIHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtXG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICAjXG4gICMgUXVlc3Rpb25cbiAgI1xuICBlZGl0UXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gX2lkIDogaWRcbiAgICAgICAgcXVlc3Rpb24uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAocXVlc3Rpb24sIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3RcbiAgICAgICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFF1ZXN0aW9uRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uXCIgICA6IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgZWRpdEtsYXNzUXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gXCJfaWRcIiA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICNcbiAgIyBVc2VyXG4gICNcbiAgbG9naW46IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cblxuICAgICAgICB1c2VycyA9IG5ldyBUYWJsZXRVc2Vyc1xuICAgICAgICB1c2Vycy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4jICAgICAgICAgICAgdm0uc2hvdyBuZXcgTG9naW5WaWV3XG4jICAgICAgICAgICAgICB1c2VyczogdXNlcnNcbiAgICAgICAgICAgIGxvZ2luVmlldyA9IG5ldyBMb2dpblZpZXdcbiAgICAgICAgICAgICAgdXNlcnM6IHVzZXJzXG4jICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0ID0gbmV3IERhc2hib2FyZExheW91dCgpO1xuICAgICAgICAgICAgVGFuZ2VyaW5lLmFwcC5ybS5nZXQoJ21haW5SZWdpb24nKS5zaG93IGxvZ2luVmlld1xuICAgICAgICAgICAgbG9naW5WaWV3LmFmdGVyUmVuZGVyKClcbiMgICAgICAgICAgICBkYXNoYm9hcmRMYXlvdXQuY29udGVudFJlZ2lvbi5zaG93KGxvZ2luVmlldylcblxuICBsb2dvdXQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcblxuICBhY2NvdW50OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzaG93VmlldyA9ICh0ZWFjaGVyKSAtPlxuICAgICAgICAgIHZpZXcgPSBuZXcgQWNjb3VudFZpZXdcbiAgICAgICAgICAgIHVzZXIgOiBUYW5nZXJpbmUudXNlclxuICAgICAgICAgICAgdGVhY2hlcjogdGVhY2hlclxuICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIGlmIFwiY2xhc3NcIiBpcyBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKVxuICAgICAgICAgIGlmIFRhbmdlcmluZS51c2VyLmhhcyhcInRlYWNoZXJJZFwiKVxuICAgICAgICAgICAgdGVhY2hlciA9IG5ldyBUZWFjaGVyIFwiX2lkXCI6IFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKVxuICAgICAgICAgICAgdGVhY2hlci5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHNob3dWaWV3KHRlYWNoZXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGVhY2hlciA9IG5ldyBUZWFjaGVyIFwiX2lkXCI6IFV0aWxzLmh1bWFuR1VJRCgpXG4gICAgICAgICAgICB0ZWFjaGVyLnNhdmUgbnVsbCxcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzaG93Vmlldyh0ZWFjaGVyKVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzaG93VmlldygpXG5cbiAgc2V0dGluZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgU2V0dGluZ3NWaWV3XG4gICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgbG9nczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgbG9ncyA9IG5ldyBMb2dzXG4gICAgICAgIGxvZ3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgdmlldyA9IG5ldyBMb2dWaWV3XG4gICAgICAgICAgICAgIGxvZ3M6IGxvZ3NcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgdGVhY2hlcnM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHVzZXJzID0gbmV3IFRhYmxldFVzZXJzXG4gICAgICAgIHVzZXJzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgVGVhY2hlcnNWaWV3XG4gICAgICAgICAgICAgICAgICB0ZWFjaGVyczogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgIHVzZXJzOiB1c2Vyc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgIyBUcmFuc2ZlciBhIG5ldyB1c2VyIGZyb20gdGFuZ2VyaW5lLWNlbnRyYWwgaW50byB0YW5nZXJpbmVcbiAgdHJhbnNmZXI6IC0+XG4gICAgZ2V0VmFycyA9IFV0aWxzLiRfR0VUKClcbiAgICBuYW1lID0gZ2V0VmFycy5uYW1lXG4gICAgJC5jb3VjaC5sb2dvdXRcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICQuY29va2llIFwiQXV0aFNlc3Npb25cIiwgbnVsbFxuICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgJC5jb3VjaC5zaWdudXBcbiAgICAgICAgICAgICAgXCJuYW1lXCIgOiAgbmFtZVxuICAgICAgICAgICAgICBcInJvbGVzXCIgOiBbXCJfYWRtaW5cIl1cbiAgICAgICAgICAgICwgbmFtZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgIHVzZXIgPSBuZXcgVXNlclxuICAgICAgICAgICAgICB1c2VyLnNhdmVcbiAgICAgICAgICAgICAgICBcIm5hbWVcIiAgOiBuYW1lXG4gICAgICAgICAgICAgICAgXCJpZFwiICAgIDogXCJ0YW5nZXJpbmUudXNlcjpcIituYW1lXG4gICAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW11cbiAgICAgICAgICAgICAgICBcImZyb21cIiAgOiBcInRjXCJcbiAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIHdhaXQ6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIiAgICAgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiRXJyb3IgdHJhbnNmZXJpbmcgdXNlci5cIlxuIl19
