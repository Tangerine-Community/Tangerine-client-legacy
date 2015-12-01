var Assessment;

Assessment = Backbone.Model.extend({
  url: 'assessment',
  VERIFY_TIMEOUT: 20 * 1000,
  initialize: function(options) {
    if (options == null) {
      options = {};
    }
    return this.subtests = new Subtests;
  },
  verifyConnection: (function(_this) {
    return function(callbacks) {
      if (callbacks == null) {
        callbacks = {};
      }
      if (callbacks.error != null) {
        _this.timer = setTimeout(callbacks.error, _this.VERIFY_TIMEOUT);
      }
      return $.ajax({
        url: Tangerine.settings.urlView("group", "byDKey"),
        dataType: "jsonp",
        data: {
          keys: ["testtest"]
        },
        timeout: _this.VERIFY_TIMEOUT,
        success: function() {
          clearTimeout(_this.timer);
          return typeof callbacks.success === "function" ? callbacks.success() : void 0;
        }
      });
    };
  })(this),
  deepFetch: function(opts) {
    if (opts == null) {
      opts = {};
    }
    opts.error = opts.error || $.noop;
    opts.success = opts.success || $.noop;
    return this.fetch({
      error: opts.error,
      success: (function(_this) {
        return function() {
          _this.subtests = new Subtests;
          _this.subtests.assessment = _this;
          return _this.subtests.fetch({
            viewOptions: {
              key: "subtest-" + _this.id
            },
            error: function() {
              return console.log("deepFetch of Assessment failed");
            },
            success: function(subtests) {
              subtests.ensureOrder();
              return opts.success.apply(subtests.assessment, arguments);
            }
          });
        };
      })(this)
    });
  }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFBLFVBQUEsR0FBYSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQWYsQ0FFWDtFQUFBLEdBQUEsRUFBSyxZQUFMO0VBRUEsY0FBQSxFQUFpQixFQUFBLEdBQUssSUFGdEI7RUFJQSxVQUFBLEVBQVksU0FBRSxPQUFGOztNQUFFLFVBQVE7O1dBR3BCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSTtFQUhOLENBSlo7RUFXQSxnQkFBQSxFQUFrQixDQUFBLFNBQUEsS0FBQTtXQUFBLFNBQUUsU0FBRjs7UUFBRSxZQUFZOztNQUM5QixJQUF5RCx1QkFBekQ7UUFBQSxLQUFDLENBQUEsS0FBRCxHQUFTLFVBQUEsQ0FBVyxTQUFTLENBQUMsS0FBckIsRUFBNEIsS0FBQyxDQUFBLGNBQTdCLEVBQVQ7O2FBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FDRTtRQUFBLEdBQUEsRUFBSyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBQTJCLE9BQTNCLEVBQW9DLFFBQXBDLENBQUw7UUFDQSxRQUFBLEVBQVUsT0FEVjtRQUVBLElBQUEsRUFBTTtVQUFBLElBQUEsRUFBTSxDQUFDLFVBQUQsQ0FBTjtTQUZOO1FBR0EsT0FBQSxFQUFTLEtBQUMsQ0FBQSxjQUhWO1FBSUEsT0FBQSxFQUFTLFNBQUE7VUFDUCxZQUFBLENBQWEsS0FBQyxDQUFBLEtBQWQ7MkRBQ0EsU0FBUyxDQUFDO1FBRkgsQ0FKVDtPQURGO0lBRmdCO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVhsQjtFQXNCQSxTQUFBLEVBQVcsU0FBRSxJQUFGOztNQUFFLE9BQU87O0lBRWxCLElBQUksQ0FBQyxLQUFMLEdBQWUsSUFBSSxDQUFDLEtBQUwsSUFBZ0IsQ0FBQyxDQUFDO0lBQ2pDLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBSSxDQUFDLE9BQUwsSUFBZ0IsQ0FBQyxDQUFDO1dBRWpDLElBQUMsQ0FBQSxLQUFELENBQ0U7TUFBQSxLQUFBLEVBQU8sSUFBSSxDQUFDLEtBQVo7TUFDQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBRVAsS0FBQyxDQUFBLFFBQUQsR0FBWSxJQUFJO1VBQ2hCLEtBQUMsQ0FBQSxRQUFRLENBQUMsVUFBVixHQUF1QjtpQkFDdkIsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQ0U7WUFBQSxXQUFBLEVBQ0U7Y0FBQSxHQUFBLEVBQUssVUFBQSxHQUFXLEtBQUMsQ0FBQSxFQUFqQjthQURGO1lBRUEsS0FBQSxFQUFPLFNBQUE7cUJBQ0wsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQ0FBWjtZQURLLENBRlA7WUFJQSxPQUFBLEVBQVMsU0FBQyxRQUFEO2NBRVAsUUFBUSxDQUFDLFdBQVQsQ0FBQTtxQkFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQWIsQ0FBbUIsUUFBUSxDQUFDLFVBQTVCLEVBQXdDLFNBQXhDO1lBSE8sQ0FKVDtXQURGO1FBSk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFQ7S0FERjtFQUxTLENBdEJYO0NBRlciLCJmaWxlIjoibW9kdWxlcy9hc3Nlc3NtZW50L0Fzc2Vzc21lbnQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJBc3Nlc3NtZW50ID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cbiAgdXJsOiAnYXNzZXNzbWVudCdcblxuICBWRVJJRllfVElNRU9VVCA6IDIwICogMTAwMFxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucz17fSApIC0+XG4gICAgIyB0aGlzIGNvbGxlY3Rpb24gZG9lc24ndCBnZXQgc2F2ZWRcbiAgICAjIGNoYW5nZXMgdXBkYXRlIHRoZSBzdWJ0ZXN0IHZpZXcsIGl0IGtlZXBzIG9yZGVyXG4gICAgQHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgIyBAZ2V0UmVzdWx0Q291bnQoKVxuXG4gICMgcmVmYWN0b3IgdG8gZXZlbnRzXG4gIHZlcmlmeUNvbm5lY3Rpb246ICggY2FsbGJhY2tzID0ge30gKSA9PlxuICAgIEB0aW1lciA9IHNldFRpbWVvdXQoY2FsbGJhY2tzLmVycm9yLCBAVkVSSUZZX1RJTUVPVVQpIGlmIGNhbGxiYWNrcy5lcnJvcj9cbiAgICAkLmFqYXhcbiAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKVxuICAgICAgZGF0YVR5cGU6IFwianNvbnBcIlxuICAgICAgZGF0YToga2V5czogW1widGVzdHRlc3RcIl1cbiAgICAgIHRpbWVvdXQ6IEBWRVJJRllfVElNRU9VVFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBjYWxsYmFja3Muc3VjY2Vzcz8oKVxuXG4gIGRlZXBGZXRjaDogKCBvcHRzID0ge30gKSAtPlxuXG4gICAgb3B0cy5lcnJvciAgID0gb3B0cy5lcnJvciAgIHx8ICQubm9vcFxuICAgIG9wdHMuc3VjY2VzcyA9IG9wdHMuc3VjY2VzcyB8fCAkLm5vb3BcblxuICAgIEBmZXRjaFxuICAgICAgZXJyb3I6IG9wdHMuZXJyb3JcbiAgICAgIHN1Y2Nlc3M6ID0+XG4jICAgICAgICBjb25zb2xlLmxvZyBcIkBzdWJ0ZXN0czogXCIgKyBAc3VidGVzdHNcbiAgICAgICAgQHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgIEBzdWJ0ZXN0cy5hc3Nlc3NtZW50ID0gQFxuICAgICAgICBAc3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgICAgIGtleTogXCJzdWJ0ZXN0LSN7QGlkfVwiXG4gICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcImRlZXBGZXRjaCBvZiBBc3Nlc3NtZW50IGZhaWxlZFwiXG4gICAgICAgICAgc3VjY2VzczogKHN1YnRlc3RzKSAtPlxuIyAgICAgICAgICAgIGNvbnNvbGUubG9nIFwic3VidGVzdHM6IFwiICsgSlNPTi5zdHJpbmdpZnkoc3VidGVzdHMpXG4gICAgICAgICAgICBzdWJ0ZXN0cy5lbnN1cmVPcmRlcigpXG4gICAgICAgICAgICBvcHRzLnN1Y2Nlc3MuYXBwbHkgc3VidGVzdHMuYXNzZXNzbWVudCwgYXJndW1lbnRzXG5cbiJdfQ==
