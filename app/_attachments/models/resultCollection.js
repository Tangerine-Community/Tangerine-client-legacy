var ResultCollection,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResultCollection = (function(_super) {

  __extends(ResultCollection, _super);

  function ResultCollection() {
    ResultCollection.__super__.constructor.apply(this, arguments);
  }

  ResultCollection.prototype.model = Result;

  ResultCollection.prototype.replicate = function(target, options) {
    var replicationLogEntry;
    target = target + "/" + this.databaseName;
    $("#message").html("Syncing to " + target);
    replicationLogEntry = new ReplicationLogEntry({
      timestamp: new Date().getTime(),
      source: this.assessmentId,
      target: target
    });
    replicationLogEntry.save();
    return $.couch.replicate(Tangerine.databaseName, target, {
      filter: Tangerine.design_doc_name + "/resultFilter",
      assessment: this.assessmentId,
      success: function() {
        return options.success();
      },
      error: function(res) {
        return $("#message").html("Error: " + res);
      }
    });
  };

  ResultCollection.prototype.lastCloudReplication = function(options) {
    var replicationLogEntryCollection;
    replicationLogEntryCollection = new ReplicationLogEntryCollection();
    return replicationLogEntryCollection.fetch({
      success: function() {
        var mostRecentReplicationLogEntry;
        mostRecentReplicationLogEntry = this.first();
        replicationLogEntryCollection.each(function(replicationLogEntry) {
          if (replicationLogEntry.source !== this.assessmentId) return;
          if (replicationLogEntry.timestamp > mostRecentReplicationLogEntry.timestamp) {
            return mostRecentReplicationLogEntry = replicationLogEntry;
          }
        });
        return options.success(mostRecentReplicationLogEntry);
      }
    });
  };

  return ResultCollection;

})(Backbone.Collection);
