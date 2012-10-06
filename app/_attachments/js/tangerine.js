var Router,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    'login': 'login',
    'register': 'register',
    'logout': 'logout',
    'account': 'account',
    'transfer': 'transfer',
    'class': 'klass',
    'class/edit/:id': 'klassEdit',
    'class/student/:studentId': 'studentEdit',
    'class/student/report/:studentId': 'studentReport',
    'class/:id/:part': 'klassPartly',
    'class/:id': 'klassPartly',
    'class/run/:studentId/:subtestId': 'runSubtest',
    'class/result/student/subtest/:studentId/:subtestId': 'studentSubtest',
    'curricula': 'curricula',
    'curriculum/:id': 'curriculum',
    'curriculum/import': 'curriculumImport',
    'settings': 'settings',
    'update': 'update',
    '': 'landing',
    'groups': 'groups',
    'assessments': 'assessments',
    'assessments/:group': 'assessments',
    'run/:id': 'run',
    'print/:id': 'print',
    'resume/:assessmentId/:resultId': 'resume',
    'restart/:id': 'restart',
    'edit/:id': 'edit',
    'csv/:id': 'csv',
    'results/:name': 'results',
    'import': 'import',
    'subtest/:id': 'editSubtest',
    'question/:id': 'editQuestion',
    'report/partByStudent/:subtestId': 'partByStudent',
    'report/studentToDate/:studentId': 'studentToDate',
    'report/masteryCheck/:studentId': 'masteryCheck',
    'report/progress/:studentId': 'progressReport',
    'report/classToDate/:klassId': 'klassToDate'
  };

  Router.prototype.landing = function() {
    if (Tangerine.settings.context === "server") {
      return Tangerine.router.navigate("groups", true);
    } else if (Tangerine.settings.context === "mobile") {
      return Tangerine.router.navigate("assessments", true);
    } else if (Tangerine.settings.context === "class") {
      return Tangerine.router.navigate("class", true);
    }
  };

  Router.prototype.groups = function() {
    return Tangerine.user.verify({
      isAdmin: function() {
        var groups, view;
        groups = Tangerine.user.get("groups");
        if (groups.length === 1 && window.location.hash === "") {
          return Tangerine.router.navigate("assessments/" + groups[0], true);
        } else {
          view = new GroupsView;
          return vm.show(view);
        }
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.curricula = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
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
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.curriculum = function(curriculumId) {
    return Tangerine.user.verify({
      isRegistered: function() {
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
                  var _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = subtests.length; _i < _len; _i++) {
                    subtest = subtests[_i];
                    _results.push(subtest.get("part"));
                  }
                  return _results;
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
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.curriculumImport = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var view;
        view = new CurriculumImportView;
        return vm.show(view);
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.klass = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var allKlasses;
        allKlasses = new Klasses;
        return allKlasses.fetch({
          success: function(klassCollection) {
            var allCurricula;
            allCurricula = new Curricula;
            return allCurricula.fetch({
              success: function(curriculaCollection) {
                var view;
                view = new KlassesView({
                  klasses: klassCollection,
                  curricula: curriculaCollection
                });
                return vm.show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.klassEdit = function(id) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var klass;
        klass = new Klass({
          _id: id
        });
        return klass.fetch({
          success: function(model) {
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
                  allStudents: allStudents
                });
                return vm.show(view);
              }
            });
          }
        });
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("", true);
      }
    });
  };

  Router.prototype.klassPartly = function(klassId, part) {
    if (part == null) part = null;
    return Tangerine.user.verify({
      isRegistered: function() {
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
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.studentSubtest = function(studentId, subtestId) {
    return Tangerine.user.verify({
      isRegistered: function() {
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
                var allResults;
                allResults = new Results;
                return allResults.fetch({
                  success: function(collection) {
                    var result, view;
                    result = collection.where({
                      "subtestId": subtestId,
                      "studentId": studentId,
                      "klassId": student.get("klassId")
                    });
                    view = new KlassSubtestResultView({
                      "result": result,
                      "subtest": subtest,
                      "student": student
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

  Router.prototype.runSubtest = function(studentId, subtestId) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var subtest;
        subtest = new Subtest({
          "_id": subtestId
        });
        return subtest.fetch({
          success: function() {
            var student;
            student = new Student({
              "_id": studentId
            });
            return student.fetch({
              success: function() {
                var view;
                view = new KlassSubtestRunView({
                  "student": student,
                  "subtest": subtest
                });
                return vm.show(view);
              }
            });
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
      isRegistered: function() {
        return Tangerine.router.navigate("", true);
      }
    });
  };

  Router.prototype.studentEdit = function(studentId) {
    return Tangerine.user.verify({
      isRegistered: function() {
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
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("", true);
      }
    });
  };

  Router.prototype["import"] = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var view;
        view = new AssessmentImportView;
        return vm.show(view);
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.assessments = function(group) {
    if (group == null) group = null;
    if (group === null && Tangerine.settings.context === "server") {
      return Tangerine.router.navigate("groups", true);
    } else {
      group = decodeURIComponent(group);
      return Tangerine.user.verify({
        isRegistered: function() {
          var curricula;
          curricula = new Curricula;
          return curricula.fetch({
            success: function(collection) {
              var assessments;
              curricula = new Curricula(collection.where({
                "group": group
              }));
              assessments = new AssessmentListView({
                "curricula": curricula,
                "group": group
              });
              return vm.show(assessments);
            }
          });
        },
        isUnregistered: function() {
          return Tangerine.router.navigate("login", true);
        }
      });
    }
  };

  Router.prototype.editId = function(id) {
    id = Utils.cleanURL(id);
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          _id: id
        });
        return assessment.superFetch({
          success: function(model) {
            var view;
            view = new AssessmentEditView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.edit = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          "_id": id
        });
        return assessment.fetch({
          success: function(model) {
            var view;
            view = new AssessmentEditView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.restart = function(name) {
    return Tangerine.router.navigate("run/" + name, true);
  };

  Router.prototype.run = function(id) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var assessment;
        assessment = new Assessment({
          "_id": id
        });
        return assessment.fetch({
          success: function(model) {
            var view;
            view = new AssessmentRunView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.print = function(id) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var assessment;
        assessment = new Assessment({
          "_id": id
        });
        return assessment.fetch({
          success: function(model) {
            var view;
            view = new AssessmentPrintView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.resume = function(assessmentId, resultId) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function(assessment) {
            var result;
            result = new Result({
              "_id": resultId
            });
            return result.fetch({
              success: function(result) {
                var view;
                view = new AssessmentRunView({
                  model: assessment
                });
                view.result = result;
                view.subtestViews.pop();
                view.subtestViews.push(new ResultView({
                  model: result,
                  assessment: assessment,
                  assessmentView: view
                }));
                view.index = result.get("subtestData").length;
                return vm.show(view);
              }
            });
          }
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.results = function(assessmentId) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function() {
            var allResults,
              _this = this;
            allResults = new Results;
            return allResults.fetch({
              key: assessmentId,
              success: function() {
                var view;
                view = new ResultsView({
                  "assessment": assessment,
                  "results": allResults.models
                });
                return vm.show(view);
              }
            });
          }
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
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

  Router.prototype.partByStudent = function(subtestId) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var subtest;
        subtest = new Subtest({
          "_id": subtestId
        });
        return subtest.fetch({
          success: function() {
            var allResults;
            allResults = new Results;
            return allResults.fetch({
              success: function(collection) {
                var results, students;
                results = collection.where({
                  "subtestId": subtest.id
                });
                students = new Students;
                return students.fetch({
                  success: function() {
                    var view;
                    view = new PartByStudentView({
                      "students": students,
                      "subtest": subtest,
                      "results": results
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.klassToDate = function(klassId) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var klass;
        klass = new Klass({
          "_id": klassId
        });
        return klass.fetch({
          success: function() {
            var allStudents;
            allStudents = new Students;
            return allStudents.fetch({
              success: function(studentCollection) {
                var allSubtests, studentCount, students;
                students = studentCollection.where({
                  "klassId": klassId
                });
                studentCount = students.length;
                allSubtests = new Subtests;
                return allSubtests.fetch({
                  success: function(subtestCollection) {
                    var allResults, subtests;
                    subtests = subtestCollection.where({
                      "curriculumId": klass.get("curriculumId")
                    });
                    allResults = new Results;
                    return allResults.fetch({
                      success: function(results) {
                        var view;
                        view = new KlassToDateView({
                          "studentCount": studentCount,
                          "results": results,
                          "subtests": subtests,
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
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.masteryCheck = function(studentId) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var student;
        student = new Student({
          "_id": studentId
        });
        return student.fetch({
          success: function(student) {
            var klass;
            klass = new Klass({
              "_id": student.get("klassId")
            });
            return klass.fetch({
              success: function(klass) {
                var allResults;
                allResults = new Results;
                return allResults.fetch({
                  success: function(collection) {
                    var results, view;
                    results = new Results(collection.where({
                      "studentId": studentId,
                      "reportType": "mastery"
                    }));
                    view = new MasteryCheckView({
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
      }
    });
  };

  Router.prototype.progressReport = function(studentId) {
    console.log("ASDAS");
    return Tangerine.user.verify({
      isRegistered: function() {
        var student;
        student = new Student({
          "_id": studentId
        });
        return student.fetch({
          success: function(student) {
            var klass;
            klass = new Klass({
              "_id": student.get("klassId")
            });
            return klass.fetch({
              success: function(klass) {
                var allResults;
                allResults = new Results;
                return allResults.fetch({
                  success: function(collection) {
                    var results, view;
                    results = new Results(collection.where({
                      "studentId": studentId,
                      "reportType": "progress"
                    }));
                    view = new ProgressView({
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
      }
    });
  };

  Router.prototype.studentToDate = function(studentId) {
    return Tangerine.user.verify({
      isRegistered: function() {
        var student;
        student = new Student({
          "_id": studentId
        });
        return student.fetch({
          success: function(student) {
            var klass;
            klass = new Klass({
              "_id": student.get("klassId")
            });
            return klass.fetch({
              success: function() {
                var allSubtests;
                allSubtests = new Subtests;
                return allSubtests.fetch({
                  success: function(subtestCollection) {
                    var allResults, subtests;
                    subtests = subtestCollection.where({
                      "curriculumId": klass.get("curriculumId")
                    });
                    allResults = new Results;
                    return allResults.fetch({
                      success: function(results) {
                        var view;
                        view = new StudentToDateView({
                          "results": results,
                          "subtests": subtests,
                          "klass": klass,
                          "studentId": studentId,
                          "student": student
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
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
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
        return Tangerine.router.navigate("", true);
      },
      isUnregistereded: function() {
        return Tangerine.router.navigate("login", true);
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
          success: function(model, response) {
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
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function() {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.login = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        return Tangerine.router.navigate("", true);
      },
      isUnregistered: function() {
        var view;
        view = new LoginView;
        return vm.show(view);
      }
    });
  };

  Router.prototype.logout = function() {
    return Tangerine.user.logout();
  };

  Router.prototype.account = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var view;
        view = new AccountView({
          user: Tangerine.user
        });
        return vm.show(view);
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.settings = function() {
    return Tangerine.user.verify({
      isRegistered: function() {
        var settings;
        settings = new Settings({
          "_id": "TangerineSettings"
        });
        return settings.fetch({
          success: function(settings) {
            var view;
            view = new SettingsView({
              "settings": settings
            });
            return vm.show(view);
          }
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.update = function() {
    return Tangerine.user.verify({
      isAdmin: function() {
        $("#version-uuid").html("Updating...");
        return $.couch.replicate(Tangerine.config.address.cloud.host + "/" + Tangerine.config.address.cloud.dbName, Tangerine.config.address.local.dbName, {
          success: function() {
            $("#version-uuid").html("Successful update, now refreshing app...");
            return _.delay(function() {
              Tangerine.router.navigate("", false);
              return document.location.reload();
            }, 2000);
          },
          error: function(error) {
            return $("#version-uuid").html("Error updating: " + error);
          }
        }, {
          doc_ids: ["_design/tangerine"]
        });
      },
      isUnregistered: function(options) {
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.logs = function() {
    var view;
    view = new LogView;
    return vm.show(view);
  };

  Router.prototype.transfer = function() {
    var getVars, name,
      _this = this;
    getVars = Utils.$_GET();
    name = getVars.name;
    return $.couch.logout({
      success: function() {
        $.cookie("AuthSession", null);
        return $.couch.login({
          "name": name,
          "password": name,
          success: function() {
            Tangerine.router.navigate("");
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
                        Tangerine.router.navigate("");
                        return window.location.reload();
                      },
                      error: function() {
                        var view;
                        view = new ErrorView({
                          message: "There was a username collision",
                          details: ""
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

  return Router;

})(Backbone.Router);

$(function() {
  window.vm = new ViewManager();
  Tangerine.router = new Router();
  Tangerine.user = new User();
  Tangerine.nav = new NavigationView({
    user: Tangerine.user,
    router: Tangerine.router
  });
  return Tangerine.user.fetch({
    success: function() {
      return Backbone.history.start();
    },
    error: function() {
      return Backbone.history.start();
    }
  });
});
