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
              assessment: Tangerine.assessment
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
                  assessment: assessment,
                  result: result
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

//# sourceMappingURL=data:application/json;base64,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b0JBQ0EsSUFBQSxFQUFVLGlCQUFBLEdBQWtCLElBRDVCO29CQUVBLE9BQUEsRUFBVSxFQUZWO29CQUdBLE1BQUEsRUFBVSxJQUhWO21CQURGLEVBTUU7b0JBQUEsSUFBQSxFQUFNLElBQU47b0JBQ0EsT0FBQSxFQUFTLFNBQUE7NkJBQ1AsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQ0U7d0JBQUEsTUFBQSxFQUFhLElBQWI7d0JBQ0EsVUFBQSxFQUFhLElBRGI7d0JBRUEsT0FBQSxFQUFVLFNBQUE7MEJBQ1IsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFqQixDQUFBO2lDQUNBLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBaEIsQ0FBQTt3QkFGUSxDQUZWO3dCQUtBLEtBQUEsRUFBTyxTQUFBO2lDQUNMLEtBQUssQ0FBQyxNQUFOLENBQWEseUJBQWI7d0JBREssQ0FMUDt1QkFERjtvQkFETyxDQURUO21CQU5GO2dCQUZPLENBQVQ7ZUFKQTtZQURLLENBTFA7V0FERjtRQUZPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBREY7RUFIUTs7OztHQS94QlMsUUFBUSxDQUFDIiwiZmlsZSI6InJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuICByb3V0ZXM6XG4gICAgJ2xvZ2luJyAgICA6ICdsb2dpbidcbiAgICAncmVnaXN0ZXInIDogJ3JlZ2lzdGVyJ1xuICAgICdsb2dvdXQnICAgOiAnbG9nb3V0J1xuICAgICdhY2NvdW50JyAgOiAnYWNjb3VudCdcblxuICAgICd0cmFuc2ZlcicgOiAndHJhbnNmZXInXG5cbiAgICAnc2V0dGluZ3MnIDogJ3NldHRpbmdzJ1xuICAgICd1cGRhdGUnIDogJ3VwZGF0ZSdcblxuICAgICcnIDogJ2xhbmRpbmcnXG5cbiAgICAnbG9ncycgOiAnbG9ncydcblxuICAgICMgQ2xhc3NcbiAgICAnY2xhc3MnICAgICAgICAgIDogJ2tsYXNzJ1xuICAgICdjbGFzcy9lZGl0LzppZCcgOiAna2xhc3NFZGl0J1xuICAgICdjbGFzcy9zdHVkZW50LzpzdHVkZW50SWQnICAgICAgICA6ICdzdHVkZW50RWRpdCdcbiAgICAnY2xhc3Mvc3R1ZGVudC9yZXBvcnQvOnN0dWRlbnRJZCcgOiAnc3R1ZGVudFJlcG9ydCdcbiAgICAnY2xhc3Mvc3VidGVzdC86aWQnIDogJ2VkaXRLbGFzc1N1YnRlc3QnXG4gICAgJ2NsYXNzL3F1ZXN0aW9uLzppZCcgOiBcImVkaXRLbGFzc1F1ZXN0aW9uXCJcblxuICAgICdjbGFzcy86aWQvOnBhcnQnIDogJ2tsYXNzUGFydGx5J1xuICAgICdjbGFzcy86aWQnICAgICAgIDogJ2tsYXNzUGFydGx5J1xuXG4gICAgJ2NsYXNzL3J1bi86c3R1ZGVudElkLzpzdWJ0ZXN0SWQnIDogJ3J1blN1YnRlc3QnXG5cbiAgICAnY2xhc3MvcmVzdWx0L3N0dWRlbnQvc3VidGVzdC86c3R1ZGVudElkLzpzdWJ0ZXN0SWQnIDogJ3N0dWRlbnRTdWJ0ZXN0J1xuXG4gICAgJ2N1cnJpY3VsYScgICAgICAgICA6ICdjdXJyaWN1bGEnXG4gICAgJ2N1cnJpY3VsdW0vOmlkJyAgICA6ICdjdXJyaWN1bHVtJ1xuICAgICdjdXJyaWN1bHVtSW1wb3J0JyAgOiAnY3VycmljdWx1bUltcG9ydCdcblxuICAgICdyZXBvcnQva2xhc3NHcm91cGluZy86a2xhc3NJZC86cGFydCcgOiAna2xhc3NHcm91cGluZydcbiAgICAncmVwb3J0L21hc3RlcnlDaGVjay86c3R1ZGVudElkJyAgICAgIDogJ21hc3RlcnlDaGVjaydcbiAgICAncmVwb3J0L3Byb2dyZXNzLzpzdHVkZW50SWQvOmtsYXNzSWQnIDogJ3Byb2dyZXNzUmVwb3J0J1xuXG4gICAgJ3RlYWNoZXJzJyA6ICd0ZWFjaGVycydcblxuXG4gICAgIyBzZXJ2ZXIgLyBtb2JpbGVcbiAgICAnZ3JvdXBzJyA6ICdncm91cHMnXG5cbiAgICAnYXNzZXNzbWVudHMnICAgICAgICA6ICdhc3Nlc3NtZW50cydcblxuICAgICdydW4vOmlkJyAgICAgICA6ICdydW4nXG4gICAgJ3J1bk1hci86aWQnICAgICAgIDogJ3J1bk1hcidcbiAgICAncHJpbnQvOmlkLzpmb3JtYXQnICAgICAgIDogJ3ByaW50J1xuICAgICdkYXRhRW50cnkvOmlkJyA6ICdkYXRhRW50cnknXG5cbiAgICAncmVzdW1lLzphc3Nlc3NtZW50SWQvOnJlc3VsdElkJyAgICA6ICdyZXN1bWUnXG5cbiAgICAncmVzdGFydC86aWQnICAgOiAncmVzdGFydCdcbiAgICAnZWRpdC86aWQnICAgICAgOiAnZWRpdCdcbiAgICAncmVzdWx0cy86aWQnICAgOiAncmVzdWx0cydcbiAgICAnaW1wb3J0JyAgICAgICAgOiAnaW1wb3J0J1xuXG4gICAgJ3N1YnRlc3QvOmlkJyAgICAgICA6ICdlZGl0U3VidGVzdCdcblxuICAgICdxdWVzdGlvbi86aWQnIDogJ2VkaXRRdWVzdGlvbidcbiAgICAnZGFzaGJvYXJkJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2Rhc2hib2FyZC8qb3B0aW9ucycgOiAnZGFzaGJvYXJkJ1xuICAgICdhZG1pbicgOiAnYWRtaW4nXG5cbiAgICAnc3luYy86aWQnICAgICAgOiAnc3luYydcblxuXG4gIGFkbWluOiAob3B0aW9ucykgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgICQuY291Y2guYWxsRGJzXG4gICAgICAgICAgc3VjY2VzczogKGRhdGFiYXNlcykgPT5cbiAgICAgICAgICAgIGdyb3VwcyA9IGRhdGFiYXNlcy5maWx0ZXIgKGRhdGFiYXNlKSAtPiBkYXRhYmFzZS5pbmRleE9mKFwiZ3JvdXAtXCIpID09IDBcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWRtaW5WaWV3XG4gICAgICAgICAgICAgIGdyb3VwcyA6IGdyb3Vwc1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgZGFzaGJvYXJkOiAob3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gb3B0aW9ucz8uc3BsaXQoL1xcLy8pXG4gICAgI2RlZmF1bHQgdmlldyBvcHRpb25zXG4gICAgcmVwb3J0Vmlld09wdGlvbnMgPVxuICAgICAgYXNzZXNzbWVudDogXCJBbGxcIlxuICAgICAgZ3JvdXBCeTogXCJlbnVtZXJhdG9yXCJcblxuICAgICMgQWxsb3dzIHVzIHRvIGdldCBuYW1lL3ZhbHVlIHBhaXJzIGZyb20gVVJMXG4gICAgXy5lYWNoIG9wdGlvbnMsIChvcHRpb24saW5kZXgpIC0+XG4gICAgICB1bmxlc3MgaW5kZXggJSAyXG4gICAgICAgIHJlcG9ydFZpZXdPcHRpb25zW29wdGlvbl0gPSBvcHRpb25zW2luZGV4KzFdXG5cbiAgICB2aWV3ID0gbmV3IERhc2hib2FyZFZpZXcoKVxuICAgIHZpZXcub3B0aW9ucyA9IHJlcG9ydFZpZXdPcHRpb25zXG4gICAgdm0uc2hvdyB2aWV3XG5cbiAgbGFuZGluZzogKHJlZnJlc2ggPSBmYWxzZSkgLT5cblxuICAgIGNhbGxGdW5jdGlvbiA9IG5vdCByZWZyZXNoXG5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgY2FsbEZ1bmN0aW9uXG5cbiAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKSBpZiByZWZyZXNoICMgdGhpcyBpcyBmb3IgdGhlIHN0dXBpZCBjbGljayBidWdcblxuXG4gIGdyb3VwczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBHcm91cHNWaWV3XG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gICNcbiAgIyBDbGFzc1xuICAjXG4gIGN1cnJpY3VsYTogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWxhID0gbmV3IEN1cnJpY3VsYVxuICAgICAgICBjdXJyaWN1bGEuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWxhVmlld1xuICAgICAgICAgICAgICBcImN1cnJpY3VsYVwiIDogY29sbGVjdGlvblxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgY3VycmljdWx1bTogKGN1cnJpY3VsdW1JZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBhbGxTdWJ0ZXN0cy53aGVyZSBcImN1cnJpY3VsdW1JZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgYWxsUXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIGFsbFF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gW11cbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdHMuZWFjaCAoc3VidGVzdCkgLT4gcXVlc3Rpb25zID0gcXVlc3Rpb25zLmNvbmNhdChhbGxRdWVzdGlvbnMud2hlcmUgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3QuaWQgKVxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsdW1WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiICAgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25zXCIgIDogcXVlc3Rpb25zXG5cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBjdXJyaWN1bHVtRWRpdDogKGN1cnJpY3VsdW1JZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IGFsbFN1YnRlc3RzLndoZXJlIFwiY3VycmljdWx1bUlkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgICAgICAgICBhbGxQYXJ0cyA9IChzdWJ0ZXN0LmdldChcInBhcnRcIikgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHMpXG4gICAgICAgICAgICAgICAgcGFydENvdW50ID0gTWF0aC5tYXguYXBwbHkgTWF0aCwgYWxsUGFydHNcbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsdW1WaWV3XG4gICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICBcInBhcnRzXCIgOiBwYXJ0Q291bnRcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGN1cnJpY3VsdW1JbXBvcnQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEltcG9ydFZpZXdcbiAgICAgICAgICBub3VuIDogXCJjdXJyaWN1bHVtXCJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICBhbGxLbGFzc2VzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKCBrbGFzc0NvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgVGVhY2hlcnNcbiAgICAgICAgICAgIHRlYWNoZXJzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsQ3VycmljdWxhID0gbmV3IEN1cnJpY3VsYVxuICAgICAgICAgICAgICAgIGFsbEN1cnJpY3VsYS5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjdXJyaWN1bGFDb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzQ29sbGVjdGlvbiA9IG5ldyBLbGFzc2VzIGtsYXNzQ29sbGVjdGlvbi53aGVyZShcInRlYWNoZXJJZFwiIDogVGFuZ2VyaW5lLnVzZXIuZ2V0KFwidGVhY2hlcklkXCIpKVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzZXNWaWV3XG4gICAgICAgICAgICAgICAgICAgICAga2xhc3NlcyAgIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgY3VycmljdWxhIDogY3VycmljdWxhQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJzICA6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzRWRpdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBfaWQgOiBpZFxuICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgVGVhY2hlcnNcbiAgICAgICAgICAgIHRlYWNoZXJzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGFsbFN0dWRlbnRzKSAtPlxuICAgICAgICAgICAgICAgICAgICBrbGFzc1N0dWRlbnRzID0gbmV3IFN0dWRlbnRzIGFsbFN0dWRlbnRzLndoZXJlIHtrbGFzc0lkIDogaWR9XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzICAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyAgICA6IGtsYXNzU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA6IGFsbFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgdGVhY2hlcnMgICAgOiB0ZWFjaGVyc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzc1BhcnRseTogKGtsYXNzSWQsIHBhcnQ9bnVsbCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImtsYXNzSWRcIiA6IGtsYXNzSWQgKSApXG5cbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImtsYXNzSWRcIiA6IGtsYXNzSWQgKSApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImN1cnJpY3VsdW1JZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpICkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NQYXJ0bHlWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcnRcIiAgICAgICA6IHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiAgIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICAgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50c1wiICAgOiBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzXCIgICAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBzdHVkZW50U3VidGVzdDogKHN0dWRlbnRJZCwgc3VidGVzdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogc3VidGVzdElkXG4gICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAgICAgICAgICAgIGtleSA6IFtzdHVkZW50SWQsc3VidGVzdElkXVxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gY29sbGVjdGlvbi53aGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RJZFwiIDogc3VidGVzdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudElkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc0lkXCIgICA6IHN0dWRlbnQuZ2V0KFwia2xhc3NJZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RSZXN1bHRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxsUmVzdWx0c1wiIDogYWxsUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInByZXZpb3VzXCIgOiByZXNwb25zZS5yb3dzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcnVuU3VidGVzdDogKHN0dWRlbnRJZCwgc3VidGVzdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgXCJfaWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG5cbiAgICAgICAgICAgICMgdGhpcyBmdW5jdGlvbiBmb3IgbGF0ZXIsIHJlYWwgY29kZSBiZWxvd1xuICAgICAgICAgICAgb25TdHVkZW50UmVhZHkgPSAoc3R1ZGVudCwgc3VidGVzdCkgLT5cbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgICAgICAgICMgdGhpcyBmdW5jdGlvbiBmb3IgbGF0ZXIsIHJlYWwgY29kZSBiZWxvd1xuICAgICAgICAgICAgICAgICAgb25TdWNjZXNzID0gKHN0dWRlbnQsIHN1YnRlc3QsIHF1ZXN0aW9uPW51bGwsIGxpbmtlZFJlc3VsdD17fSkgLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RSdW5WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgICAgICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25zXCIgICAgOiBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICBcImxpbmtlZFJlc3VsdFwiIDogbGlua2VkUmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBudWxsXG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKSA9PSBcInN1cnZleVwiXG4gICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L3Jlc3VsdHNCeVN0dWRlbnRTdWJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAga2V5IDogW3N0dWRlbnRJZCxzdWJ0ZXN0LmdldChcImdyaWRMaW5rSWRcIildXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVzcG9uc2Uucm93cyAhPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtlZFJlc3VsdCA9IG5ldyBLbGFzc1Jlc3VsdCBfLmxhc3QocmVzcG9uc2Uucm93cyk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld09wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBcInF1ZXN0aW9uLSN7c3VidGVzdC5nZXQoXCJjdXJyaWN1bHVtSWRcIil9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zKHF1ZXN0aW9ucy53aGVyZSB7c3VidGVzdElkIDogc3VidGVzdElkIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHN0dWRlbnQsIHN1YnRlc3QsIHF1ZXN0aW9ucywgbGlua2VkUmVzdWx0KVxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgICAgIyBlbmQgb2Ygb25TdHVkZW50UmVhZHlcblxuICAgICAgICAgICAgaWYgc3R1ZGVudElkID09IFwidGVzdFwiXG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPiBvblN0dWRlbnRSZWFkeSggc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICAgICAgIHN0dWRlbnQuc2F2ZSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPiBvblN0dWRlbnRSZWFkeSggc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICBvblN0dWRlbnRSZWFkeShzdHVkZW50LCBzdWJ0ZXN0KVxuXG4gIHJlZ2lzdGVyOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgUmVnaXN0ZXJUZWFjaGVyVmlld1xuICAgICAgICAgIHVzZXIgOiBuZXcgVXNlclxuICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICBzdHVkZW50RWRpdDogKCBzdHVkZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgX2lkIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwpIC0+XG4gICAgICAgICAgICBhbGxLbGFzc2VzID0gbmV3IEtsYXNzZXNcbiAgICAgICAgICAgIGFsbEtsYXNzZXMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKCBrbGFzc0NvbGxlY3Rpb24gKS0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBTdHVkZW50RWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnQgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAga2xhc3NlcyA6IGtsYXNzQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgI1xuICAjIEFzc2Vzc21lbnRcbiAgI1xuXG5cbiAgZGF0YUVudHJ5OiAoIGFzc2Vzc21lbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3thc3Nlc3NtZW50SWR9XCJcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNCeVN1YnRlc3RJZCA9IHF1ZXN0aW9ucy5pbmRleEJ5KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3RJZCwgcXVlc3Rpb25zIG9mIHF1ZXN0aW9uc0J5U3VidGVzdElkXG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50LnN1YnRlc3RzLmdldChzdWJ0ZXN0SWQpLnF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudERhdGFFbnRyeVZpZXcgYXNzZXNzbWVudDogYXNzZXNzbWVudFxuXG5cblxuICBzeW5jOiAoIGFzc2Vzc21lbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRTeW5jVmlldyBcImFzc2Vzc21lbnRcIjogYXNzZXNzbWVudFxuXG4gIGFzc2Vzc21lbnRzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50cyA9IG5ldyBBc3Nlc3NtZW50c1xuICAgICAgICBhc3Nlc3NtZW50cy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4jICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudHNNZW51Vmlld1xuIyAgICAgICAgICAgICAgYXNzZXNzbWVudHMgOiBhc3Nlc3NtZW50c1xuICAgICAgICAgICAgYXNzZXNzbWVudHNWaWV3ID0gbmV3IEFzc2Vzc21lbnRzTWVudVZpZXdcbiAgICAgICAgICAgICAgYXNzZXNzbWVudHMgOiBhc3Nlc3NtZW50c1xuICAgICAgICAgICAgVGFuZ2VyaW5lLmFwcC5ybS5nZXQoJ21haW5SZWdpb24nKS5zaG93IGFzc2Vzc21lbnRzVmlld1xuXG4gIHJlc3RhcnQ6IChuYW1lKSAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJydW4vI3tuYW1lfVwiLCB0cnVlXG5cbiAgcnVuOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogaWRcbiAgICAgICAgYXNzZXNzbWVudC5kZWVwRmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogLT5cbiAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRSdW5WaWV3IG1vZGVsOiBhc3Nlc3NtZW50XG5cbiAgcnVuTWFyOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogaWRcbiAgICAgICAgYXNzZXNzbWVudC5kZWVwRmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogLT5cbiAgICAgICAgICAgIFRhbmdlcmluZS5hc3Nlc3NtZW50ID0gYXNzZXNzbWVudFxuICAgICAgICAgICAgdmlld09wdGlvbnMgPVxuICAgICAgICAgICAgICBhc3Nlc3NtZW50OiBUYW5nZXJpbmUuYXNzZXNzbWVudFxuICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0ID0gbmV3IERhc2hib2FyZExheW91dCgpO1xuICAgICAgICAgICAgVGFuZ2VyaW5lLmFwcC5ybS5nZXQoJ21haW5SZWdpb24nKS5zaG93IGRhc2hib2FyZExheW91dFxuICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0LmNvbnRlbnRSZWdpb24ucmVzZXQoKVxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50Q29tcG9zaXRlVmlldyB2aWV3T3B0aW9uc1xuICAgICAgICAgICAgdmlldy5vbihcImNvbGxlY3Rpb246cmVuZGVyZWRcIiwgKCkgLT5cbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aGUgY29sbGVjdGlvbiB2aWV3IHdhcyByZW5kZXJlZCFcIilcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGRhc2hib2FyZExheW91dC5jb250ZW50UmVnaW9uLnNob3codmlldylcblxuICAgICAgICAgIGVycm9yOiAobW9kZWwsIGVyciwgY2IpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBKU09OLnN0cmluZ2lmeSBlcnJcblxuICByZXN1bWU6IChhc3Nlc3NtZW50SWQsIHJlc3VsdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmRlZXBGZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3VsdCBcIl9pZFwiIDogcmVzdWx0SWRcbiAgICAgICAgICAgIHJlc3VsdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudENvbXBvc2l0ZVZpZXdcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQ6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0XG5cbiAgICAgICAgICAgICAgICByZXN1bHQucGFyZW50ID0gdmlld1xuXG4gICAgICAgICAgICAgICAgaWYgcmVzdWx0LmhhcyhcIm9yZGVyX21hcFwiKVxuICAgICAgICAgICAgICAgICAgIyBzYXZlIHRoZSBvcmRlciBtYXAgb2YgcHJldmlvdXMgcmFuZG9taXphdGlvblxuICAgICAgICAgICAgICAgICAgb3JkZXJNYXAgPSByZXN1bHQuZ2V0KFwib3JkZXJfbWFwXCIpLnNsaWNlKCkgIyBjbG9uZSBhcnJheVxuICAgICAgICAgICAgICAgICAgIyByZXN0b3JlIHRoZSBwcmV2aW91cyBvcmRlcm1hcFxuICAgICAgICAgICAgICAgICAgdmlldy5vcmRlck1hcCA9IG9yZGVyTWFwXG5cbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdCBpbiByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZGF0YT8gJiYgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkP1xuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkXG5cbiAgICAgICAgICAgICAgICAjIHJlcGxhY2UgdGhlIHZpZXcncyByZXN1bHQgd2l0aCBvdXIgb2xkIG9uZVxuICAgICAgICAgICAgICAgIHZpZXcucmVzdWx0ID0gcmVzdWx0XG5cbiAgICAgICAgICAgICAgICAjIEhpamFjayB0aGUgbm9ybWFsIFJlc3VsdCBhbmQgUmVzdWx0VmlldywgdXNlIG9uZSBmcm9tIHRoZSBkYlxuICAgICAgICAgICAgICAgIHZpZXcuc3VidGVzdFZpZXdzLnBvcCgpXG4gICAgICAgICAgICAgICAgdmlldy5zdWJ0ZXN0Vmlld3MucHVzaCBuZXcgUmVzdWx0SXRlbVZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50ICAgICA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnRWaWV3IDogdmlld1xuICAgICAgICAgICAgICAgIHZpZXcuaW5kZXggPSByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIikubGVuZ3RoXG4jICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgICAgICAgICAgIFRhbmdlcmluZS5hcHAucm0uZ2V0KCdtYWluUmVnaW9uJykuc2hvdyB2aWV3XG5cblxuXG4gIHJlc3VsdHM6IChhc3Nlc3NtZW50SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAgLT5cbiAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICBvcHRpb25zOlxuICAgICAgICAgICAgICAgIGtleTogXCJyZXN1bHQtI3thc3Nlc3NtZW50SWR9XCJcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFJlc3VsdHNWaWV3XG4gICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICAgIDogYWxsUmVzdWx0c1xuIyAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuYXBwLnJtLmdldCgnbWFpblJlZ2lvbicpLnNob3cgdmlld1xuXG5cbiAgY3N2OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IENTVlZpZXdcbiAgICAgICAgICBhc3Nlc3NtZW50SWQgOiBpZFxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBjc3ZfYWxwaGE6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICAtPlxuICAgICAgICAgICAgZmlsZW5hbWUgPSBhc3Nlc3NtZW50LmdldChcIm5hbWVcIikgKyBcIi1cIiArIG1vbWVudCgpLmZvcm1hdChcIllZWVktTU1NLUREIEhIOm1tXCIpXG4gICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbiA9IFwiL1wiICsgVGFuZ2VyaW5lLmRiTmFtZSArIFwiL19kZXNpZ24vXCIgKyBUYW5nZXJpbmUuZGVzaWduRG9jICsgXCIvX2xpc3QvY3N2L2NzdlJvd0J5UmVzdWx0P2tleT1cXFwiI3tpZH1cXFwiJmZpbGVuYW1lPSN7ZmlsZW5hbWV9XCJcblxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBlcnJWaWV3ID0gbmV3IEVycm9yVmlld1xuICAgICAgICAgIG1lc3NhZ2UgOiBcIllvdSdyZSBub3QgYW4gYWRtaW4gdXNlclwiXG4gICAgICAgICAgZGV0YWlscyA6IFwiSG93IGRpZCB5b3UgZ2V0IGhlcmU/XCJcbiAgICAgICAgdm0uc2hvdyBlcnJWaWV3XG5cbiAgI1xuICAjIFJlcG9ydHNcbiAgI1xuICBrbGFzc0dyb3VwaW5nOiAoa2xhc3NJZCwgcGFydCkgLT5cbiAgICBwYXJ0ID0gcGFyc2VJbnQocGFydClcbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBjb2xsZWN0aW9uLndoZXJlIFwicGFydFwiIDogcGFydFxuICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKCByZXN1bHRzICkgLT5cbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgc3R1ZGVudHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzR3JvdXBpbmdWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgOiBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IGZpbHRlcmVkUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIG1hc3RlcnlDaGVjazogKHN0dWRlbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChzdHVkZW50KSAtPlxuICAgICAgICAgICAga2xhc3NJZCA9IHN0dWRlbnQuZ2V0IFwia2xhc3NJZFwiXG4gICAgICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDogc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZCwgXCJyZXBvcnRUeXBlXCIgOiBcIm1hc3RlcnlcIiwgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICMgZ2V0IGEgbGlzdCBvZiBzdWJ0ZXN0cyBpbnZvbHZlZFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdFtyZXN1bHQuZ2V0KFwic3VidGVzdElkXCIpXSA9IHRydWUgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0gXy5rZXlzKHN1YnRlc3RJZExpc3QpXG5cbiAgICAgICAgICAgICAgICAgICAgIyBtYWtlIGEgY29sbGVjdGlvbiBhbmQgZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24gPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24uYWRkIG5ldyBTdWJ0ZXN0KFwiX2lkXCIgOiBzdWJ0ZXN0SWQpIGZvciBzdWJ0ZXN0SWQgaW4gc3VidGVzdElkTGlzdFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IE1hc3RlcnlDaGVja1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBwcm9ncmVzc1JlcG9ydDogKHN0dWRlbnRJZCwga2xhc3NJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgIyBzYXZlIHRoaXMgY3JhenkgZnVuY3Rpb24gZm9yIGxhdGVyXG4gICAgICAgICMgc3R1ZGVudElkIGNhbiBoYXZlIHRoZSB2YWx1ZSBcImFsbFwiLCBpbiB3aGljaCBjYXNlIHN0dWRlbnQgc2hvdWxkID09IG51bGxcbiAgICAgICAgYWZ0ZXJGZXRjaCA9ICggc3R1ZGVudCwgc3R1ZGVudHMgKSAtPlxuICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGFsbFN1YnRlc3RzICkgLT5cbiAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlXG4gICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgICAgICAgICAgXCJyZXBvcnRUeXBlXCIgICA6IFwicHJvZ3Jlc3NcIlxuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyBjb2xsZWN0aW9uLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZCwgXCJyZXBvcnRUeXBlXCIgOiBcInByb2dyZXNzXCJcblxuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgaWYgc3R1ZGVudHM/XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGZpbHRlciBgUmVzdWx0c2AgYnkgYEtsYXNzYCdzIGN1cnJlbnQgYFN0dWRlbnRzYFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFByb2dyZXNzVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgaWYgc3R1ZGVudElkICE9IFwiYWxsXCJcbiAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IGFmdGVyRmV0Y2ggc3R1ZGVudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBudWxsLCBzdHVkZW50c1xuXG4gICNcbiAgIyBTdWJ0ZXN0c1xuICAjXG4gIGVkaXRTdWJ0ZXN0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBfaWQgOiBpZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogc3VidGVzdC5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN1YnRlc3RFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWwgICAgICA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50IDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIGVkaXRLbGFzc1N1YnRlc3Q6IChpZCkgLT5cblxuICAgIG9uU3VjY2VzcyA9IChzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnM9bnVsbCkgLT5cbiAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgbW9kZWwgICAgICA6IHN1YnRlc3RcbiAgICAgICAgY3VycmljdWx1bSA6IGN1cnJpY3VsdW1cbiAgICAgICAgcXVlc3Rpb25zICA6IHF1ZXN0aW9uc1xuICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3tjdXJyaWN1bHVtLmlkfVwiXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnMud2hlcmUoXCJzdWJ0ZXN0SWRcIjpzdWJ0ZXN0LmlkKVxuICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Mgc3VidGVzdCwgY3VycmljdWx1bVxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgI1xuICAjIFF1ZXN0aW9uXG4gICNcbiAgZWRpdFF1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIF9pZCA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gIGVkaXRLbGFzc1F1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIFwiX2lkXCIgOiBpZFxuICAgICAgICBxdWVzdGlvbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChxdWVzdGlvbiwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdFxuICAgICAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUXVlc3Rpb25FZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25cIiAgIDogcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgVXNlclxuICAjXG4gIGxvZ2luOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG5cbiAgICAgICAgdXNlcnMgPSBuZXcgVGFibGV0VXNlcnNcbiAgICAgICAgdXNlcnMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuIyAgICAgICAgICAgIHZtLnNob3cgbmV3IExvZ2luVmlld1xuIyAgICAgICAgICAgICAgdXNlcnM6IHVzZXJzXG4gICAgICAgICAgICBsb2dpblZpZXcgPSBuZXcgTG9naW5WaWV3XG4gICAgICAgICAgICAgIHVzZXJzOiB1c2Vyc1xuIyAgICAgICAgICAgIGRhc2hib2FyZExheW91dCA9IG5ldyBEYXNoYm9hcmRMYXlvdXQoKTtcbiAgICAgICAgICAgIFRhbmdlcmluZS5hcHAucm0uZ2V0KCdtYWluUmVnaW9uJykuc2hvdyBsb2dpblZpZXdcbiAgICAgICAgICAgIGxvZ2luVmlldy5hZnRlclJlbmRlcigpXG4jICAgICAgICAgICAgZGFzaGJvYXJkTGF5b3V0LmNvbnRlbnRSZWdpb24uc2hvdyhsb2dpblZpZXcpXG5cbiAgbG9nb3V0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLmxvZ291dCgpXG5cbiAgYWNjb3VudDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc2hvd1ZpZXcgPSAodGVhY2hlcikgLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IEFjY291bnRWaWV3XG4gICAgICAgICAgICB1c2VyIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgICAgICAgIHRlYWNoZXI6IHRlYWNoZXJcbiAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBpZiBcImNsYXNzXCIgaXMgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIilcbiAgICAgICAgICBpZiBUYW5nZXJpbmUudXNlci5oYXMoXCJ0ZWFjaGVySWRcIilcbiAgICAgICAgICAgIHRlYWNoZXIgPSBuZXcgVGVhY2hlciBcIl9pZFwiOiBUYW5nZXJpbmUudXNlci5nZXQoXCJ0ZWFjaGVySWRcIilcbiAgICAgICAgICAgIHRlYWNoZXIuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzaG93Vmlldyh0ZWFjaGVyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRlYWNoZXIgPSBuZXcgVGVhY2hlciBcIl9pZFwiOiBVdGlscy5odW1hbkdVSUQoKVxuICAgICAgICAgICAgdGVhY2hlci5zYXZlIG51bGwsXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc2hvd1ZpZXcodGVhY2hlcilcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2hvd1ZpZXcoKVxuXG4gIHNldHRpbmdzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IFNldHRpbmdzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGxvZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGxvZ3MgPSBuZXcgTG9nc1xuICAgICAgICBsb2dzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTG9nVmlld1xuICAgICAgICAgICAgICBsb2dzOiBsb2dzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIHRlYWNoZXJzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB1c2VycyA9IG5ldyBUYWJsZXRVc2Vyc1xuICAgICAgICB1c2Vycy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFRlYWNoZXJzVmlld1xuICAgICAgICAgICAgICAgICAgdGVhY2hlcnM6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICB1c2VyczogdXNlcnNcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICMgVHJhbnNmZXIgYSBuZXcgdXNlciBmcm9tIHRhbmdlcmluZS1jZW50cmFsIGludG8gdGFuZ2VyaW5lXG4gIHRyYW5zZmVyOiAtPlxuICAgIGdldFZhcnMgPSBVdGlscy4kX0dFVCgpXG4gICAgbmFtZSA9IGdldFZhcnMubmFtZVxuICAgICQuY291Y2gubG9nb3V0XG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAkLmNvb2tpZSBcIkF1dGhTZXNzaW9uXCIsIG51bGxcbiAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgIFwibmFtZVwiICAgICA6IG5hbWVcbiAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICQuY291Y2guc2lnbnVwXG4gICAgICAgICAgICAgIFwibmFtZVwiIDogIG5hbWVcbiAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW1wiX2FkbWluXCJdXG4gICAgICAgICAgICAsIG5hbWUsXG4gICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICB1c2VyID0gbmV3IFVzZXJcbiAgICAgICAgICAgICAgdXNlci5zYXZlXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgIDogbmFtZVxuICAgICAgICAgICAgICAgIFwiaWRcIiAgICA6IFwidGFuZ2VyaW5lLnVzZXI6XCIrbmFtZVxuICAgICAgICAgICAgICAgIFwicm9sZXNcIiA6IFtdXG4gICAgICAgICAgICAgICAgXCJmcm9tXCIgIDogXCJ0Y1wiXG4gICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICB3YWl0OiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICQuY291Y2gubG9naW5cbiAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgICAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIkVycm9yIHRyYW5zZmVyaW5nIHVzZXIuXCJcbiJdfQ==
