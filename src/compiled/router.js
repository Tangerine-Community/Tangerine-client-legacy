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
            var dashboardLayout, view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: Tangerine.assessment
            };
            dashboardLayout = new DashboardLayout();
            Tangerine.app.rm.get('mainRegion').show(dashboardLayout);
            dashboardLayout.contentRegion.reset();
            view = new AssessmentCompositeView(viewOptions);
            view.on("collection:rendered", function() {
              return console.log("the collection view was rendered!");
            });
            return dashboardLayout.contentRegion.show(view);
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
                var i, len, orderMap, ref, subtest, view;
                view = new AssessmentCompositeView({
                  model: assessment,
                  result: result,
                  index: result.get("subtestData").length
                });
                result.parent = view;
                if (result.has("order_map")) {
                  orderMap = result.get("order_map").slice();
                  view.orderMap = orderMap;
                }
                ref = result.get("subtestData");
                for (i = 0, len = ref.length; i < len; i++) {
                  subtest = ref[i];
                  if ((subtest.data != null) && (subtest.data.participant_id != null)) {
                    Tangerine.nav.setStudent(subtest.data.participant_id);
                  }
                }
                view.result = result;
                view.subtestViews.pop();
                view.subtestViews.push(new ResultItemView({
                  model: result,
                  assessment: assessment,
                  assessmentView: view
                }));
                view.index = result.get("subtestData").length;
                return Tangerine.app.rm.get('mainRegion').show(view);
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

//# sourceMappingURL=data:application/json;base64,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LEdBQU8sSUFBSTt5QkFDWCxJQUFJLENBQUMsSUFBTCxDQUNFO29CQUFBLE1BQUEsRUFBVSxJQUFWO29CQUNBLElBQUEsRUFBVSxpQkFBQSxHQUFrQixJQUQ1QjtvQkFFQSxPQUFBLEVBQVUsRUFGVjtvQkFHQSxNQUFBLEVBQVUsSUFIVjttQkFERixFQU1FO29CQUFBLElBQUEsRUFBTSxJQUFOO29CQUNBLE9BQUEsRUFBUyxTQUFBOzZCQUNQLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBUixDQUNFO3dCQUFBLE1BQUEsRUFBYSxJQUFiO3dCQUNBLFVBQUEsRUFBYSxJQURiO3dCQUVBLE9BQUEsRUFBVSxTQUFBOzBCQUNSLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBakIsQ0FBQTtpQ0FDQSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLENBQUE7d0JBRlEsQ0FGVjt3QkFLQSxLQUFBLEVBQU8sU0FBQTtpQ0FDTCxLQUFLLENBQUMsTUFBTixDQUFhLHlCQUFiO3dCQURLLENBTFA7dUJBREY7b0JBRE8sQ0FEVDttQkFORjtnQkFGTyxDQUFUO2VBSkE7WUFESyxDQUxQO1dBREY7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtLQURGO0VBSFE7Ozs7R0EveEJTLFFBQVEsQ0FBQyIsImZpbGUiOiJyb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcbiAgcm91dGVzOlxuICAgICdsb2dpbicgICAgOiAnbG9naW4nXG4gICAgJ3JlZ2lzdGVyJyA6ICdyZWdpc3RlcidcbiAgICAnbG9nb3V0JyAgIDogJ2xvZ291dCdcbiAgICAnYWNjb3VudCcgIDogJ2FjY291bnQnXG5cbiAgICAndHJhbnNmZXInIDogJ3RyYW5zZmVyJ1xuXG4gICAgJ3NldHRpbmdzJyA6ICdzZXR0aW5ncydcbiAgICAndXBkYXRlJyA6ICd1cGRhdGUnXG5cbiAgICAnJyA6ICdsYW5kaW5nJ1xuXG4gICAgJ2xvZ3MnIDogJ2xvZ3MnXG5cbiAgICAjIENsYXNzXG4gICAgJ2NsYXNzJyAgICAgICAgICA6ICdrbGFzcydcbiAgICAnY2xhc3MvZWRpdC86aWQnIDogJ2tsYXNzRWRpdCdcbiAgICAnY2xhc3Mvc3R1ZGVudC86c3R1ZGVudElkJyAgICAgICAgOiAnc3R1ZGVudEVkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvcmVwb3J0LzpzdHVkZW50SWQnIDogJ3N0dWRlbnRSZXBvcnQnXG4gICAgJ2NsYXNzL3N1YnRlc3QvOmlkJyA6ICdlZGl0S2xhc3NTdWJ0ZXN0J1xuICAgICdjbGFzcy9xdWVzdGlvbi86aWQnIDogXCJlZGl0S2xhc3NRdWVzdGlvblwiXG5cbiAgICAnY2xhc3MvOmlkLzpwYXJ0JyA6ICdrbGFzc1BhcnRseSdcbiAgICAnY2xhc3MvOmlkJyAgICAgICA6ICdrbGFzc1BhcnRseSdcblxuICAgICdjbGFzcy9ydW4vOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdydW5TdWJ0ZXN0J1xuXG4gICAgJ2NsYXNzL3Jlc3VsdC9zdHVkZW50L3N1YnRlc3QvOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdzdHVkZW50U3VidGVzdCdcblxuICAgICdjdXJyaWN1bGEnICAgICAgICAgOiAnY3VycmljdWxhJ1xuICAgICdjdXJyaWN1bHVtLzppZCcgICAgOiAnY3VycmljdWx1bSdcbiAgICAnY3VycmljdWx1bUltcG9ydCcgIDogJ2N1cnJpY3VsdW1JbXBvcnQnXG5cbiAgICAncmVwb3J0L2tsYXNzR3JvdXBpbmcvOmtsYXNzSWQvOnBhcnQnIDogJ2tsYXNzR3JvdXBpbmcnXG4gICAgJ3JlcG9ydC9tYXN0ZXJ5Q2hlY2svOnN0dWRlbnRJZCcgICAgICA6ICdtYXN0ZXJ5Q2hlY2snXG4gICAgJ3JlcG9ydC9wcm9ncmVzcy86c3R1ZGVudElkLzprbGFzc0lkJyA6ICdwcm9ncmVzc1JlcG9ydCdcblxuICAgICd0ZWFjaGVycycgOiAndGVhY2hlcnMnXG5cblxuICAgICMgc2VydmVyIC8gbW9iaWxlXG4gICAgJ2dyb3VwcycgOiAnZ3JvdXBzJ1xuXG4gICAgJ2Fzc2Vzc21lbnRzJyAgICAgICAgOiAnYXNzZXNzbWVudHMnXG5cbiAgICAncnVuLzppZCcgICAgICAgOiAncnVuJ1xuICAgICdydW5NYXIvOmlkJyAgICAgICA6ICdydW5NYXInXG4gICAgJ3ByaW50LzppZC86Zm9ybWF0JyAgICAgICA6ICdwcmludCdcbiAgICAnZGF0YUVudHJ5LzppZCcgOiAnZGF0YUVudHJ5J1xuXG4gICAgJ3Jlc3VtZS86YXNzZXNzbWVudElkLzpyZXN1bHRJZCcgICAgOiAncmVzdW1lJ1xuXG4gICAgJ3Jlc3RhcnQvOmlkJyAgIDogJ3Jlc3RhcnQnXG4gICAgJ2VkaXQvOmlkJyAgICAgIDogJ2VkaXQnXG4gICAgJ3Jlc3VsdHMvOmlkJyAgIDogJ3Jlc3VsdHMnXG4gICAgJ2ltcG9ydCcgICAgICAgIDogJ2ltcG9ydCdcblxuICAgICdzdWJ0ZXN0LzppZCcgICAgICAgOiAnZWRpdFN1YnRlc3QnXG5cbiAgICAncXVlc3Rpb24vOmlkJyA6ICdlZGl0UXVlc3Rpb24nXG4gICAgJ2Rhc2hib2FyZCcgOiAnZGFzaGJvYXJkJ1xuICAgICdkYXNoYm9hcmQvKm9wdGlvbnMnIDogJ2Rhc2hib2FyZCdcbiAgICAnYWRtaW4nIDogJ2FkbWluJ1xuXG4gICAgJ3N5bmMvOmlkJyAgICAgIDogJ3N5bmMnXG5cblxuICBhZG1pbjogKG9wdGlvbnMpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICAkLmNvdWNoLmFsbERic1xuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhYmFzZXMpID0+XG4gICAgICAgICAgICBncm91cHMgPSBkYXRhYmFzZXMuZmlsdGVyIChkYXRhYmFzZSkgLT4gZGF0YWJhc2UuaW5kZXhPZihcImdyb3VwLVwiKSA9PSAwXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFkbWluVmlld1xuICAgICAgICAgICAgICBncm91cHMgOiBncm91cHNcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGRhc2hib2FyZDogKG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IG9wdGlvbnM/LnNwbGl0KC9cXC8vKVxuICAgICNkZWZhdWx0IHZpZXcgb3B0aW9uc1xuICAgIHJlcG9ydFZpZXdPcHRpb25zID1cbiAgICAgIGFzc2Vzc21lbnQ6IFwiQWxsXCJcbiAgICAgIGdyb3VwQnk6IFwiZW51bWVyYXRvclwiXG5cbiAgICAjIEFsbG93cyB1cyB0byBnZXQgbmFtZS92YWx1ZSBwYWlycyBmcm9tIFVSTFxuICAgIF8uZWFjaCBvcHRpb25zLCAob3B0aW9uLGluZGV4KSAtPlxuICAgICAgdW5sZXNzIGluZGV4ICUgMlxuICAgICAgICByZXBvcnRWaWV3T3B0aW9uc1tvcHRpb25dID0gb3B0aW9uc1tpbmRleCsxXVxuXG4gICAgdmlldyA9IG5ldyBEYXNoYm9hcmRWaWV3KClcbiAgICB2aWV3Lm9wdGlvbnMgPSByZXBvcnRWaWV3T3B0aW9uc1xuICAgIHZtLnNob3cgdmlld1xuXG4gIGxhbmRpbmc6IChyZWZyZXNoID0gZmFsc2UpIC0+XG5cbiAgICBjYWxsRnVuY3Rpb24gPSBub3QgcmVmcmVzaFxuXG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIGNhbGxGdW5jdGlvblxuXG4gICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKCkgaWYgcmVmcmVzaCAjIHRoaXMgaXMgZm9yIHRoZSBzdHVwaWQgY2xpY2sgYnVnXG5cblxuICBncm91cHM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgR3JvdXBzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuICAjXG4gICMgQ2xhc3NcbiAgI1xuICBjdXJyaWN1bGE6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgY3VycmljdWxhLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsYVZpZXdcbiAgICAgICAgICAgICAgXCJjdXJyaWN1bGFcIiA6IGNvbGxlY3Rpb25cbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGN1cnJpY3VsdW06IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IFtdXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzLmVhY2ggKHN1YnRlc3QpIC0+IHF1ZXN0aW9ucyA9IHF1ZXN0aW9ucy5jb25jYXQoYWxsUXVlc3Rpb25zLndoZXJlIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0LmlkIClcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiAgIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICA6IHF1ZXN0aW9uc1xuXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUVkaXQ6IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBhbGxTdWJ0ZXN0cy53aGVyZSBcImN1cnJpY3VsdW1JZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgYWxsUGFydHMgPSAoc3VidGVzdC5nZXQoXCJwYXJ0XCIpIGZvciBzdWJ0ZXN0IGluIHN1YnRlc3RzKVxuICAgICAgICAgICAgICAgIHBhcnRDb3VudCA9IE1hdGgubWF4LmFwcGx5IE1hdGgsIGFsbFBhcnRzXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgXCJwYXJ0c1wiIDogcGFydENvdW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBjdXJyaWN1bHVtSW1wb3J0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRJbXBvcnRWaWV3XG4gICAgICAgICAgbm91biA6IFwiY3VycmljdWx1bVwiXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhbGxLbGFzc2VzID0gbmV3IEtsYXNzZXNcbiAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ICgga2xhc3NDb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbEN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY3VycmljdWxhQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc0NvbGxlY3Rpb24gPSBuZXcgS2xhc3NlcyBrbGFzc0NvbGxlY3Rpb24ud2hlcmUoXCJ0ZWFjaGVySWRcIiA6IFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKSlcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc2VzVmlld1xuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzZXMgICA6IGtsYXNzQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgIGN1cnJpY3VsYSA6IGN1cnJpY3VsYUNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgOiB0ZWFjaGVyc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzc0VkaXQ6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgX2lkIDogaWRcbiAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChhbGxTdHVkZW50cykgLT5cbiAgICAgICAgICAgICAgICAgICAga2xhc3NTdHVkZW50cyA9IG5ldyBTdHVkZW50cyBhbGxTdHVkZW50cy53aGVyZSB7a2xhc3NJZCA6IGlkfVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzcyAgICAgICA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgICAgOiBrbGFzc1N0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgOiBhbGxTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJzICAgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NQYXJ0bHk6IChrbGFzc0lkLCBwYXJ0PW51bGwpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzICggY29sbGVjdGlvbi53aGVyZSggXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKSApIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzUGFydGx5Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJ0XCIgICAgICAgOiBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiAgIDogc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgc3R1ZGVudFN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgXCJfaWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L3Jlc3VsdHNCeVN0dWRlbnRTdWJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3RJZF1cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IGNvbGxlY3Rpb24ud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NJZFwiICAgOiBzdHVkZW50LmdldChcImtsYXNzSWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UmVzdWx0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsbFJlc3VsdHNcIiA6IGFsbFJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmV2aW91c1wiIDogcmVzcG9uc2Uucm93cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHJ1blN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuXG4gICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5ID0gKHN0dWRlbnQsIHN1YnRlc3QpIC0+XG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyA9IChzdHVkZW50LCBzdWJ0ZXN0LCBxdWVzdGlvbj1udWxsLCBsaW5rZWRSZXN1bHQ9e30pIC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UnVuVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICAgICAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICAgIDogcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgXCJsaW5rZWRSZXN1bHRcIiA6IGxpbmtlZFJlc3VsdFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbnVsbFxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgIGtleSA6IFtzdHVkZW50SWQsc3VidGVzdC5nZXQoXCJncmlkTGlua0lkXCIpXVxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlc3BvbnNlLnJvd3MgIT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rZWRSZXN1bHQgPSBuZXcgS2xhc3NSZXN1bHQgXy5sYXN0KHJlc3BvbnNlLnJvd3MpPy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogXCJxdWVzdGlvbi0je3N1YnRlc3QuZ2V0KFwiY3VycmljdWx1bUlkXCIpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyhxdWVzdGlvbnMud2hlcmUge3N1YnRlc3RJZCA6IHN1YnRlc3RJZCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0LCBxdWVzdGlvbnMsIGxpbmtlZFJlc3VsdClcbiAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICAgICMgZW5kIG9mIG9uU3R1ZGVudFJlYWR5XG5cbiAgICAgICAgICAgIGlmIHN0dWRlbnRJZCA9PSBcInRlc3RcIlxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT4gb25TdHVkZW50UmVhZHkoIHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICBzdHVkZW50LnNhdmUgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT4gb25TdHVkZW50UmVhZHkoIHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgb25TdHVkZW50UmVhZHkoc3R1ZGVudCwgc3VidGVzdClcblxuICByZWdpc3RlcjogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzVW5yZWdpc3RlcmVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IFJlZ2lzdGVyVGVhY2hlclZpZXdcbiAgICAgICAgICB1c2VyIDogbmV3IFVzZXJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgc3R1ZGVudEVkaXQ6ICggc3R1ZGVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IF9pZCA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKG1vZGVsKSAtPlxuICAgICAgICAgICAgYWxsS2xhc3NlcyA9IG5ldyBLbGFzc2VzXG4gICAgICAgICAgICBhbGxLbGFzc2VzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ICgga2xhc3NDb2xsZWN0aW9uICktPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgU3R1ZGVudEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBzdHVkZW50IDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGtsYXNzZXMgOiBrbGFzc0NvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICNcbiAgIyBBc3Nlc3NtZW50XG4gICNcblxuXG4gIGRhdGFFbnRyeTogKCBhc3Nlc3NtZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgdmlld09wdGlvbnM6XG4gICAgICAgICAgICAgICAga2V5OiBcInF1ZXN0aW9uLSN7YXNzZXNzbWVudElkfVwiXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zQnlTdWJ0ZXN0SWQgPSBxdWVzdGlvbnMuaW5kZXhCeShcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIGZvciBzdWJ0ZXN0SWQsIHF1ZXN0aW9ucyBvZiBxdWVzdGlvbnNCeVN1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudC5zdWJ0ZXN0cy5nZXQoc3VidGVzdElkKS5xdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnREYXRhRW50cnlWaWV3IGFzc2Vzc21lbnQ6IGFzc2Vzc21lbnRcblxuXG5cbiAgc3luYzogKCBhc3Nlc3NtZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50U3luY1ZpZXcgXCJhc3Nlc3NtZW50XCI6IGFzc2Vzc21lbnRcblxuICBhc3Nlc3NtZW50czogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudHMgPSBuZXcgQXNzZXNzbWVudHNcbiAgICAgICAgYXNzZXNzbWVudHMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuIyAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRzTWVudVZpZXdcbiMgICAgICAgICAgICAgIGFzc2Vzc21lbnRzIDogYXNzZXNzbWVudHNcbiAgICAgICAgICAgIGFzc2Vzc21lbnRzVmlldyA9IG5ldyBBc3Nlc3NtZW50c01lbnVWaWV3XG4gICAgICAgICAgICAgIGFzc2Vzc21lbnRzIDogYXNzZXNzbWVudHNcbiAgICAgICAgICAgIFRhbmdlcmluZS5hcHAucm0uZ2V0KCdtYWluUmVnaW9uJykuc2hvdyBhc3Nlc3NtZW50c1ZpZXdcblxuICByZXN0YXJ0OiAobmFtZSkgLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicnVuLyN7bmFtZX1cIiwgdHJ1ZVxuXG4gIHJ1bjogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZGVlcEZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50UnVuVmlldyBtb2RlbDogYXNzZXNzbWVudFxuXG4gIHJ1bk1hcjogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZGVlcEZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICBUYW5nZXJpbmUuYXNzZXNzbWVudCA9IGFzc2Vzc21lbnRcbiAgICAgICAgICAgIHZpZXdPcHRpb25zID1cbiAgICAgICAgICAgICAgbW9kZWw6IFRhbmdlcmluZS5hc3Nlc3NtZW50XG4gICAgICAgICAgICBkYXNoYm9hcmRMYXlvdXQgPSBuZXcgRGFzaGJvYXJkTGF5b3V0KCk7XG4gICAgICAgICAgICBUYW5nZXJpbmUuYXBwLnJtLmdldCgnbWFpblJlZ2lvbicpLnNob3cgZGFzaGJvYXJkTGF5b3V0XG4gICAgICAgICAgICBkYXNoYm9hcmRMYXlvdXQuY29udGVudFJlZ2lvbi5yZXNldCgpXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRDb21wb3NpdGVWaWV3IHZpZXdPcHRpb25zXG4gICAgICAgICAgICB2aWV3Lm9uKFwiY29sbGVjdGlvbjpyZW5kZXJlZFwiLCAoKSAtPlxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRoZSBjb2xsZWN0aW9uIHZpZXcgd2FzIHJlbmRlcmVkIVwiKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0LmNvbnRlbnRSZWdpb24uc2hvdyh2aWV3KVxuICAgICAgICAgIGVycm9yOiAobW9kZWwsIGVyciwgY2IpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBKU09OLnN0cmluZ2lmeSBlcnJcblxuICByZXN1bWU6IChhc3Nlc3NtZW50SWQsIHJlc3VsdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmRlZXBGZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3VsdCBcIl9pZFwiIDogcmVzdWx0SWRcbiAgICAgICAgICAgIHJlc3VsdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudENvbXBvc2l0ZVZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICByZXN1bHQ6IHJlc3VsdFxuICAgICAgICAgICAgICAgICAgaW5kZXg6IHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKS5sZW5ndGhcblxuICAgICAgICAgICAgICAgIHJlc3VsdC5wYXJlbnQgPSB2aWV3XG5cbiAgICAgICAgICAgICAgICBpZiByZXN1bHQuaGFzKFwib3JkZXJfbWFwXCIpXG4gICAgICAgICAgICAgICAgICAjIHNhdmUgdGhlIG9yZGVyIG1hcCBvZiBwcmV2aW91cyByYW5kb21pemF0aW9uXG4gICAgICAgICAgICAgICAgICBvcmRlck1hcCA9IHJlc3VsdC5nZXQoXCJvcmRlcl9tYXBcIikuc2xpY2UoKSAjIGNsb25lIGFycmF5XG4gICAgICAgICAgICAgICAgICAjIHJlc3RvcmUgdGhlIHByZXZpb3VzIG9yZGVybWFwXG4gICAgICAgICAgICAgICAgICB2aWV3Lm9yZGVyTWFwID0gb3JkZXJNYXBcblxuICAgICAgICAgICAgICAgIGZvciBzdWJ0ZXN0IGluIHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKVxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5kYXRhPyAmJiBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWQ/XG4gICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS5uYXYuc2V0U3R1ZGVudCBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWRcblxuICAgICAgICAgICAgICAgICMgcmVwbGFjZSB0aGUgdmlldydzIHJlc3VsdCB3aXRoIG91ciBvbGQgb25lXG4gICAgICAgICAgICAgICAgdmlldy5yZXN1bHQgPSByZXN1bHRcblxuICAgICAgICAgICAgICAgICMgSGlqYWNrIHRoZSBub3JtYWwgUmVzdWx0IGFuZCBSZXN1bHRWaWV3LCB1c2Ugb25lIGZyb20gdGhlIGRiXG4gICAgICAgICAgICAgICAgdmlldy5zdWJ0ZXN0Vmlld3MucG9wKClcbiAgICAgICAgICAgICAgICB2aWV3LnN1YnRlc3RWaWV3cy5wdXNoIG5ldyBSZXN1bHRJdGVtVmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWwgICAgICAgICAgOiByZXN1bHRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgICAgIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudFZpZXcgOiB2aWV3XG4gICAgICAgICAgICAgICAgdmlldy5pbmRleCA9IHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKS5sZW5ndGhcbiMgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLmFwcC5ybS5nZXQoJ21haW5SZWdpb24nKS5zaG93IHZpZXdcblxuXG5cbiAgcmVzdWx0czogKGFzc2Vzc21lbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICAtPlxuICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgIG9wdGlvbnM6XG4gICAgICAgICAgICAgICAga2V5OiBcInJlc3VsdC0je2Fzc2Vzc21lbnRJZH1cIlxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUmVzdWx0c1ZpZXdcbiAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiBhbGxSZXN1bHRzXG4jICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgICAgICAgICAgIFRhbmdlcmluZS5hcHAucm0uZ2V0KCdtYWluUmVnaW9uJykuc2hvdyB2aWV3XG5cblxuICBjc3Y6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgQ1NWVmlld1xuICAgICAgICAgIGFzc2Vzc21lbnRJZCA6IGlkXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGNzdl9hbHBoYTogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogIC0+XG4gICAgICAgICAgICBmaWxlbmFtZSA9IGFzc2Vzc21lbnQuZ2V0KFwibmFtZVwiKSArIFwiLVwiICsgbW9tZW50KCkuZm9ybWF0KFwiWVlZWS1NTU0tREQgSEg6bW1cIilcbiAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gXCIvXCIgKyBUYW5nZXJpbmUuZGJOYW1lICsgXCIvX2Rlc2lnbi9cIiArIFRhbmdlcmluZS5kZXNpZ25Eb2MgKyBcIi9fbGlzdC9jc3YvY3N2Um93QnlSZXN1bHQ/a2V5PVxcXCIje2lkfVxcXCImZmlsZW5hbWU9I3tmaWxlbmFtZX1cIlxuXG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIGVyclZpZXcgPSBuZXcgRXJyb3JWaWV3XG4gICAgICAgICAgbWVzc2FnZSA6IFwiWW91J3JlIG5vdCBhbiBhZG1pbiB1c2VyXCJcbiAgICAgICAgICBkZXRhaWxzIDogXCJIb3cgZGlkIHlvdSBnZXQgaGVyZT9cIlxuICAgICAgICB2bS5zaG93IGVyclZpZXdcblxuICAjXG4gICMgUmVwb3J0c1xuICAjXG4gIGtsYXNzR3JvdXBpbmc6IChrbGFzc0lkLCBwYXJ0KSAtPlxuICAgIHBhcnQgPSBwYXJzZUludChwYXJ0KVxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGNvbGxlY3Rpb24ud2hlcmUgXCJwYXJ0XCIgOiBwYXJ0XG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIHJlc3VsdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAgICAgIyBmaWx0ZXIgYFJlc3VsdHNgIGJ5IGBLbGFzc2AncyBjdXJyZW50IGBTdHVkZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyBzdHVkZW50cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NHcm91cGluZ1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogZmlsdGVyZWRSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgbWFzdGVyeUNoZWNrOiAoc3R1ZGVudElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHN0dWRlbnQpIC0+XG4gICAgICAgICAgICBrbGFzc0lkID0gc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBzdHVkZW50LmdldCBcImtsYXNzSWRcIlxuICAgICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgY29sbGVjdGlvbi53aGVyZSBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkLCBcInJlcG9ydFR5cGVcIiA6IFwibWFzdGVyeVwiLCBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgIyBnZXQgYSBsaXN0IG9mIHN1YnRlc3RzIGludm9sdmVkXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0W3Jlc3VsdC5nZXQoXCJzdWJ0ZXN0SWRcIildID0gdHJ1ZSBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSBfLmtleXMoc3VidGVzdElkTGlzdClcblxuICAgICAgICAgICAgICAgICAgICAjIG1ha2UgYSBjb2xsZWN0aW9uIGFuZCBmZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbiA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5hZGQgbmV3IFN1YnRlc3QoXCJfaWRcIiA6IHN1YnRlc3RJZCkgZm9yIHN1YnRlc3RJZCBpbiBzdWJ0ZXN0SWRMaXN0XG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgTWFzdGVyeUNoZWNrVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdENvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHByb2dyZXNzUmVwb3J0OiAoc3R1ZGVudElkLCBrbGFzc0lkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAjIHNhdmUgdGhpcyBjcmF6eSBmdW5jdGlvbiBmb3IgbGF0ZXJcbiAgICAgICAgIyBzdHVkZW50SWQgY2FuIGhhdmUgdGhlIHZhbHVlIFwiYWxsXCIsIGluIHdoaWNoIGNhc2Ugc3R1ZGVudCBzaG91bGQgPT0gbnVsbFxuICAgICAgICBhZnRlckZldGNoID0gKCBzdHVkZW50LCBzdHVkZW50cyApIC0+XG4gICAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggYWxsU3VidGVzdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICBcInJlcG9ydFR5cGVcIiAgIDogXCJwcm9ncmVzc1wiXG4gICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkLCBcInJlcG9ydFR5cGVcIiA6IFwicHJvZ3Jlc3NcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBpZiBzdHVkZW50cz9cbiAgICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUHJvZ3Jlc3NWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBpZiBzdHVkZW50SWQgIT0gXCJhbGxcIlxuICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBzdHVkZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgIHN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAtPiBhZnRlckZldGNoIG51bGwsIHN0dWRlbnRzXG5cbiAgI1xuICAjIFN1YnRlc3RzXG4gICNcbiAgZWRpdFN1YnRlc3Q6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgU3VidGVzdEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbCAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgZWRpdEtsYXNzU3VidGVzdDogKGlkKSAtPlxuXG4gICAgb25TdWNjZXNzID0gKHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9ucz1udWxsKSAtPlxuICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RFZGl0Vmlld1xuICAgICAgICBtb2RlbCAgICAgIDogc3VidGVzdFxuICAgICAgICBjdXJyaWN1bHVtIDogY3VycmljdWx1bVxuICAgICAgICBxdWVzdGlvbnMgIDogcXVlc3Rpb25zXG4gICAgICB2bS5zaG93IHZpZXdcblxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgX2lkIDogaWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHN1YnRlc3QuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICAgICAgICAgICAgICAgIGtleTogXCJxdWVzdGlvbi0je2N1cnJpY3VsdW0uaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9ucy53aGVyZShcInN1YnRlc3RJZFwiOnN1YnRlc3QuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzIHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtXG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICAjXG4gICMgUXVlc3Rpb25cbiAgI1xuICBlZGl0UXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gX2lkIDogaWRcbiAgICAgICAgcXVlc3Rpb24uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAocXVlc3Rpb24sIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3RcbiAgICAgICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFF1ZXN0aW9uRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uXCIgICA6IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgZWRpdEtsYXNzUXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gXCJfaWRcIiA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICNcbiAgIyBVc2VyXG4gICNcbiAgbG9naW46IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cblxuICAgICAgICB1c2VycyA9IG5ldyBUYWJsZXRVc2Vyc1xuICAgICAgICB1c2Vycy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4jICAgICAgICAgICAgdm0uc2hvdyBuZXcgTG9naW5WaWV3XG4jICAgICAgICAgICAgICB1c2VyczogdXNlcnNcbiAgICAgICAgICAgIGxvZ2luVmlldyA9IG5ldyBMb2dpblZpZXdcbiAgICAgICAgICAgICAgdXNlcnM6IHVzZXJzXG4jICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0ID0gbmV3IERhc2hib2FyZExheW91dCgpO1xuICAgICAgICAgICAgVGFuZ2VyaW5lLmFwcC5ybS5nZXQoJ21haW5SZWdpb24nKS5zaG93IGxvZ2luVmlld1xuICAgICAgICAgICAgbG9naW5WaWV3LmFmdGVyUmVuZGVyKClcbiMgICAgICAgICAgICBkYXNoYm9hcmRMYXlvdXQuY29udGVudFJlZ2lvbi5zaG93KGxvZ2luVmlldylcblxuICBsb2dvdXQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcblxuICBhY2NvdW50OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzaG93VmlldyA9ICh0ZWFjaGVyKSAtPlxuICAgICAgICAgIHZpZXcgPSBuZXcgQWNjb3VudFZpZXdcbiAgICAgICAgICAgIHVzZXIgOiBUYW5nZXJpbmUudXNlclxuICAgICAgICAgICAgdGVhY2hlcjogdGVhY2hlclxuICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIGlmIFwiY2xhc3NcIiBpcyBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKVxuICAgICAgICAgIGlmIFRhbmdlcmluZS51c2VyLmhhcyhcInRlYWNoZXJJZFwiKVxuICAgICAgICAgICAgdGVhY2hlciA9IG5ldyBUZWFjaGVyIFwiX2lkXCI6IFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKVxuICAgICAgICAgICAgdGVhY2hlci5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHNob3dWaWV3KHRlYWNoZXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGVhY2hlciA9IG5ldyBUZWFjaGVyIFwiX2lkXCI6IFV0aWxzLmh1bWFuR1VJRCgpXG4gICAgICAgICAgICB0ZWFjaGVyLnNhdmUgbnVsbCxcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzaG93Vmlldyh0ZWFjaGVyKVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzaG93VmlldygpXG5cbiAgc2V0dGluZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgU2V0dGluZ3NWaWV3XG4gICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgbG9nczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgbG9ncyA9IG5ldyBMb2dzXG4gICAgICAgIGxvZ3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgdmlldyA9IG5ldyBMb2dWaWV3XG4gICAgICAgICAgICAgIGxvZ3M6IGxvZ3NcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgdGVhY2hlcnM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHVzZXJzID0gbmV3IFRhYmxldFVzZXJzXG4gICAgICAgIHVzZXJzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgVGVhY2hlcnNWaWV3XG4gICAgICAgICAgICAgICAgICB0ZWFjaGVyczogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgIHVzZXJzOiB1c2Vyc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgIyBUcmFuc2ZlciBhIG5ldyB1c2VyIGZyb20gdGFuZ2VyaW5lLWNlbnRyYWwgaW50byB0YW5nZXJpbmVcbiAgdHJhbnNmZXI6IC0+XG4gICAgZ2V0VmFycyA9IFV0aWxzLiRfR0VUKClcbiAgICBuYW1lID0gZ2V0VmFycy5uYW1lXG4gICAgJC5jb3VjaC5sb2dvdXRcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICQuY29va2llIFwiQXV0aFNlc3Npb25cIiwgbnVsbFxuICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgJC5jb3VjaC5zaWdudXBcbiAgICAgICAgICAgICAgXCJuYW1lXCIgOiAgbmFtZVxuICAgICAgICAgICAgICBcInJvbGVzXCIgOiBbXCJfYWRtaW5cIl1cbiAgICAgICAgICAgICwgbmFtZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgIHVzZXIgPSBuZXcgVXNlclxuICAgICAgICAgICAgICB1c2VyLnNhdmVcbiAgICAgICAgICAgICAgICBcIm5hbWVcIiAgOiBuYW1lXG4gICAgICAgICAgICAgICAgXCJpZFwiICAgIDogXCJ0YW5nZXJpbmUudXNlcjpcIituYW1lXG4gICAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW11cbiAgICAgICAgICAgICAgICBcImZyb21cIiAgOiBcInRjXCJcbiAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIHdhaXQ6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIiAgICAgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiRXJyb3IgdHJhbnNmZXJpbmcgdXNlci5cIlxuIl19
