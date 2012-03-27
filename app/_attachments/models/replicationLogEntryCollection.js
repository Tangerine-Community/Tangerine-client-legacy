var ReplicationLogEntryCollection,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ReplicationLogEntryCollection = (function(_super) {

  __extends(ReplicationLogEntryCollection, _super);

  function ReplicationLogEntryCollection() {
    ReplicationLogEntryCollection.__super__.constructor.apply(this, arguments);
  }

  ReplicationLogEntryCollection.prototype.model = ReplicationLogEntry;

  ReplicationLogEntryCollection.prototype.url = "/replicationLogEntry";

  return ReplicationLogEntryCollection;

})(Backbone.Collection);
