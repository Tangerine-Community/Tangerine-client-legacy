var ReplicationLogEntry,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ReplicationLogEntry = (function(_super) {

  __extends(ReplicationLogEntry, _super);

  function ReplicationLogEntry() {
    ReplicationLogEntry.__super__.constructor.apply(this, arguments);
  }

  ReplicationLogEntry.prototype.url = "/replicationLogEntry";

  return ReplicationLogEntry;

})(Backbone.Model);
