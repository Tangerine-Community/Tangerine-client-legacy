var CheckDigit;

CheckDigit = (function() {
  CheckDigit.prototype.allowed = "ABCEFGHKMNPQRSTUVWXYZ".split("");

  CheckDigit.prototype.weights = [1, 2, 5, 11, 13];

  function CheckDigit(id) {
    if (id == null) {
      id = "";
    }
    this.set(id);
  }

  CheckDigit.prototype.set = function(id) {
    return this.id = id.toUpperCase();
  };

  CheckDigit.prototype.get = function(id) {
    var ch;
    if (id == null) {
      id = this.id;
    }
    if (!~((function() {
      var j, len, ref, results;
      ref = id.split("");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        ch = ref[j];
        results.push(!~this.allowed.indexOf(ch));
      }
      return results;
    }).call(this)).indexOf(false)) {
      return null;
    }
    return id + this.getDigit(id);
  };

  CheckDigit.prototype.generate = function() {
    var i;
    return this.get(((function() {
      var j, len, ref, results;
      ref = this.weights;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        results.push(this.allowed[Math.floor(Math.random() * this.allowed.length)]);
      }
      return results;
    }).call(this)).join(""));
  };

  CheckDigit.prototype.isValid = function(id) {
    if (id == null) {
      id = this.id;
    }
    if (id.length !== 6) {
      return false;
    }
    return (this.get(id.slice(0, id.length - 1))) === id;
  };

  CheckDigit.prototype.isNotValid = function(id) {
    if (id == null) {
      id = this.id;
    }
    return !this.isValid(id);
  };

  CheckDigit.prototype.getErrors = function() {
    var ch, errors, i, j, k, len, len1, ref, result;
    errors = [];
    result = [];
    ref = (function() {
      var k, len, ref, results;
      ref = this.id.split("");
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        ch = ref[k];
        results.push(this.allowed.indexOf(ch));
      }
      return results;
    }).call(this);
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      ch = ref[i];
      if (ch === -1) {
        result.push(this.id[i]);
      }
    }
    if (result.length !== 0) {
      for (k = 0, len1 = result.length; k < len1; k++) {
        i = result[k];
        errors.push("Error: '" + result + "' is not a valid student id character. Only the following characters are allowed: " + this.allowed + "<br/>(this helps reduce errors while writing down student IDs)");
      }
    }
    if (this.id.length !== 6) {
      errors.push("Error: Identifier must be 6 letters");
    }
    if (errors.length === 0 && this.isNotValid()) {
      errors.push("Error: Invalid ID. Maybe it was written down incorrectly. Generate a new one then write down the old ID and the new one a piece of paper. Include both IDs in comments section at end of assessment.");
    }
    return errors;
  };

  CheckDigit.prototype.getDigit = function(id) {
    var ch, checkDigit_10, i, id_10, weight;
    if (id == null) {
      id = this.id;
    }
    id_10 = (function() {
      var j, len, ref, results;
      ref = id.split("");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        ch = ref[j];
        results.push(this.allowed.indexOf(ch));
      }
      return results;
    }).call(this);
    checkDigit_10 = ((function() {
      var j, len, ref, results;
      ref = this.weights;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        weight = ref[i];
        results.push(id_10[i] * weight);
      }
      return results;
    }).call(this)).reduce(function(x, y) {
      return x + y;
    });
    return this.allowed[checkDigit_10 % this.allowed.length];
  };

  return CheckDigit;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90cmFuc2NyaXB0aW9uQ2hlY2tkaWdpdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBc0NBLElBQUE7O0FBQU07dUJBRUosT0FBQSxHQUFVLHVCQUF1QixDQUFDLEtBQXhCLENBQThCLEVBQTlCOzt1QkFFVixPQUFBLEdBQVUsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxFQUFQLEVBQVUsRUFBVjs7RUFFRyxvQkFBRSxFQUFGOztNQUFFLEtBQUs7O0lBQ2xCLElBQUMsQ0FBQSxHQUFELENBQU0sRUFBTjtFQURXOzt1QkFJYixHQUFBLEdBQUssU0FBRSxFQUFGO1dBQ0gsSUFBQyxDQUFBLEVBQUQsR0FBTSxFQUFFLENBQUMsV0FBSCxDQUFBO0VBREg7O3VCQUlMLEdBQUEsR0FBSyxTQUFFLEVBQUY7QUFDSCxRQUFBOztNQURLLEtBQUssSUFBQyxDQUFBOztJQUNYLElBQWUsQ0FBQyxDQUFDOztBQUFFO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQUEsQ0FBQyxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixFQUFqQjtBQUFGOztpQkFBRixDQUFnRCxDQUFDLE9BQWpELENBQXlELEtBQXpELENBQWpCO0FBQUEsYUFBTyxLQUFQOztBQUNBLFdBQU8sRUFBQSxHQUFLLElBQUMsQ0FBQSxRQUFELENBQVUsRUFBVjtFQUZUOzt1QkFLTCxRQUFBLEdBQVUsU0FBQTtBQUNSLFFBQUE7QUFBQSxXQUFPLElBQUMsQ0FBQSxHQUFELENBQU07O0FBQUM7QUFBQTtXQUFBLHFDQUFBOztxQkFBQSxJQUFDLENBQUEsT0FBUSxDQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBcEMsQ0FBQTtBQUFUOztpQkFBRCxDQUEwRSxDQUFDLElBQTNFLENBQWdGLEVBQWhGLENBQU47RUFEQzs7dUJBR1YsT0FBQSxHQUFTLFNBQUMsRUFBRDs7TUFBQyxLQUFHLElBQUMsQ0FBQTs7SUFDWixJQUFnQixFQUFFLENBQUMsTUFBSCxLQUFhLENBQTdCO0FBQUEsYUFBTyxNQUFQOztBQUNBLFdBQU8sQ0FBQyxJQUFDLENBQUEsR0FBRCxDQUFLLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBVCxFQUFXLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBckIsQ0FBTCxDQUFELENBQUEsS0FBb0M7RUFGcEM7O3VCQUlULFVBQUEsR0FBWSxTQUFDLEVBQUQ7O01BQUMsS0FBRyxJQUFDLENBQUE7O0FBQ2YsV0FBTyxDQUFJLElBQUMsQ0FBQSxPQUFELENBQVMsRUFBVDtFQUREOzt1QkFJWixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVM7QUFDVDs7Ozs7Ozs7OztBQUFBLFNBQUEsNkNBQUE7O01BQUMsSUFBdUIsRUFBQSxLQUFNLENBQUMsQ0FBOUI7UUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxFQUFHLENBQUEsQ0FBQSxDQUFoQixFQUFBOztBQUFEO0lBQ0EsSUFBRyxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFwQjtBQUEyQixXQUFBLDBDQUFBOztRQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksVUFBQSxHQUFXLE1BQVgsR0FBa0Isb0ZBQWxCLEdBQXNHLElBQUMsQ0FBQSxPQUF2RyxHQUErRyxnRUFBM0g7QUFBQSxPQUEzQjs7SUFDQSxJQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixLQUFpQixDQUFwQjtNQUEyQixNQUFNLENBQUMsSUFBUCxDQUFZLHFDQUFaLEVBQTNCOztJQUNBLElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBdUIsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUExQjtNQUE2QyxNQUFNLENBQUMsSUFBUCxDQUFZLHNNQUFaLEVBQTdDOztBQUVBLFdBQU87RUFSRTs7dUJBWVgsUUFBQSxHQUFVLFNBQUUsRUFBRjtBQUNSLFFBQUE7O01BRFUsS0FBSyxJQUFDLENBQUE7O0lBQ2hCLEtBQUE7O0FBQVM7QUFBQTtXQUFBLHFDQUFBOztxQkFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsRUFBakI7QUFBQTs7O0lBQ1QsYUFBQSxHQUFnQjs7QUFBQztBQUFBO1dBQUEsNkNBQUE7O3FCQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVztBQUFaOztpQkFBRCxDQUFnRCxDQUFDLE1BQWpELENBQXdELFNBQUMsQ0FBRCxFQUFHLENBQUg7YUFBUyxDQUFBLEdBQUk7SUFBYixDQUF4RDtBQUNoQixXQUFPLElBQUMsQ0FBQSxPQUFRLENBQUEsYUFBQSxHQUFnQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQXpCO0VBSFIiLCJmaWxlIjoibGliL3RyYW5zY3JpcHRpb25DaGVja2RpZ2l0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiI1RoaXMgaXMgYSBiYXNlMjEgZW5jb2RpbmdcbiMgXCJBQkNFRkdIS01OUFFSU1RVVldYWVpcIlxuXG4jIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2hlY2tfZGlnaXRcbiMgQSBnb29kIGNoZWNrZGlnaXQgd2lsbCBjYXRjaCBhbGwgc2luZ2xlIGNoYXJhY3RlciBjaGFuZ2VzIGFuZCBtb3N0IHRyYW5zY3JpcHRpb25zXG4jIFRoaXMgcmVxdWlyZXMgYSB3ZWlnaHRlZCBjaGVja2RpZ2l0IHNjaGVtZS5cbiMgV2UgbmVlZCBvdXIgd2VpZ2h0aW5ncyB0byBiZSBjb21wcmltZSB3aXRoIDIxXG4jIFRoaXMgd2lsbCBjYXRjaCBhbGwgc2luZ2xlIGRpZ2l0IGVycm9ycyBhbmQgbW9zdCB0cmFuc3Bvc2l0aW9uc1xuXG4jIEEgNSBjaGFyYWN0ZXIgc3RyaW5nIHdpbGwgYWxsb3cgZm9yIG1vcmUgdGhhbiA0IG1pbGxpb24gcG9zc2liaWxpdGllczpcbiMgMjFeNSA9IDQwODQxMDFcblxuIyBTbyB3ZSBuZWVkIDUgZGlmZmVybmV0IG51bWJlcnMgdGhhdCBhcmUgY29wcmltZSB0byAyMSB0byB1c2UgYXMgb3VyIHdlaWdodGluZ3NcbiMgMVxuIyAyXG4jIDVcbiMgMTFcbiMgMTNcblxuIyBUbyBjYWxjdWxhdGUgb3VyIGNoZWNrZGlnaXQgd2UgbXVsdGlwbHkgZWFjaCBjaGFyYWN0ZXIgYnkgaXRzIHdlaWdodGluZyB3aGljaCBpcyBkZXRlcm1pbmVkIGJ5IGl0cyBwb3NpdGlvblxuIyBFeGFtcGxlOiBcIkJBQkFTXCJcbiMgQ29udmVydCBmcm9tIEJhc2UgMjEgdG8gYmFzZSAxMFxuIyBCPTEsIEE9MCwgQj0xLCBBPTAsIFM9MTNcbiMgV2VpZ2h0IHRoZW1cbiMgMSoxLCAwKjIsIDEqNSwgMCoxMSwgMTMqMTNcbiMgQWRkIHRoZW0gdXBcbiMgMSArIDAgKyA1ICsgMCArIDE2OSA9IDE3NVxuIyBEbyBhIG1vZCAyMSBvbiBpdFxuIyAxNzUlMjEgPSA3XG4jIENvbnZlcnQgMjAgZnJvbSBiYXNlIDEwIHRvIG91ciBiYXNlMjEgZW5jb2Rpbmc6XG4jIEtcbiMgSGVuY2Ugb3VyIHJlc3VsdDpcbiMgQkFCQVNLXG5cbiMgVGhpcyBjbGFzcyBhbGxvd3MgeW91IHRvIHNldCBhIHN0cmluZyBvZiA1IGRpZ2l0cyBpbiBwZXJtaXNzaWJsZSBjaGFyYWN0ZXJzLlxuIyBgZ2V0YCByZXR1cm5zIHRoZSBzdHJpbmcgd2l0aCBhIGNoZWNrIGRpZ2l0LlxuIyBgc2V0YCBjaGFuZ2VzXG4jIGBnZW5lcmF0ZWAgcmV0dXJucyBhIGNvbXBsZXRlIGNoZWNrIGRpZ2l0LCBkb2VzIG5vdCBjaGFuZ2UgdGhlIGlkXG5jbGFzcyBDaGVja0RpZ2l0XG5cbiAgYWxsb3dlZCA6IFwiQUJDRUZHSEtNTlBRUlNUVVZXWFlaXCIuc3BsaXQgXCJcIlxuXG4gIHdlaWdodHMgOiBbMSwyLDUsMTEsMTNdICAgIyBUT0RPIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlIGNvcHJpbWVzXG5cbiAgY29uc3RydWN0b3I6ICggaWQgPSBcIlwiICkgLT5cbiAgICBAc2V0KCBpZCApXG4gIFxuICAjIHNldCBpZCwgZm9yY2UgdXBwZXJjYXNlXG4gIHNldDogKCBpZCApIC0+XG4gICAgQGlkID0gaWQudG9VcHBlckNhc2UoKVxuXG4gICMgcmV0dXJuIGZ1bGwgY2hlY2sgZGlnaXQgc2VxdWVuY2VcbiAgZ2V0OiAoIGlkID0gQGlkICkgLT5cbiAgICByZXR1cm4gbnVsbCBpZiAhfiggIX5AYWxsb3dlZC5pbmRleE9mKGNoKSBmb3IgY2ggaW4gaWQuc3BsaXQgXCJcIiApLmluZGV4T2YoZmFsc2UpXG4gICAgcmV0dXJuIGlkICsgQGdldERpZ2l0IGlkXG4gIFxuICAjIHJldHVybiBmdWxsIGNoZWNrIGRpZ2l0IHNlcXVlbmNlXG4gIGdlbmVyYXRlOiAtPlxuICAgIHJldHVybiBAZ2V0KCAoQGFsbG93ZWRbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQGFsbG93ZWQubGVuZ3RoKV0gZm9yIGkgaW4gQHdlaWdodHMgKS5qb2luIFwiXCIgKVxuXG4gIGlzVmFsaWQ6IChpZD1AaWQpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIGlkLmxlbmd0aCAhPSA2XG4gICAgcmV0dXJuIChAZ2V0KGlkLnNsaWNlKDAsaWQubGVuZ3RoLTEpKSkgPT0gKGlkKVxuXG4gIGlzTm90VmFsaWQ6IChpZD1AaWQpIC0+XG4gICAgcmV0dXJuIG5vdCBAaXNWYWxpZChpZClcblxuICAjIHJldHVybiBjaGFyYWN0ZXJzIGluIGlkIG5vdCBhbGxvd2VkXG4gIGdldEVycm9yczogLT5cbiAgICBlcnJvcnMgPSBbXVxuICAgIHJlc3VsdCA9IFtdXG4gICAgKHJlc3VsdC5wdXNoKEBpZFtpXSkgaWYgY2ggPT0gLTEpIGZvciBjaCwgaSBpbiAoQGFsbG93ZWQuaW5kZXhPZihjaCkgZm9yIGNoIGluIEBpZC5zcGxpdCBcIlwiIClcbiAgICBpZiByZXN1bHQubGVuZ3RoICE9IDAgdGhlbiBlcnJvcnMucHVzaCBcIkVycm9yOiAnI3tyZXN1bHR9JyBpcyBub3QgYSB2YWxpZCBzdHVkZW50IGlkIGNoYXJhY3Rlci4gT25seSB0aGUgZm9sbG93aW5nIGNoYXJhY3RlcnMgYXJlIGFsbG93ZWQ6ICN7QGFsbG93ZWR9PGJyLz4odGhpcyBoZWxwcyByZWR1Y2UgZXJyb3JzIHdoaWxlIHdyaXRpbmcgZG93biBzdHVkZW50IElEcylcIiBmb3IgaSBpbiByZXN1bHRcbiAgICBpZiBAaWQubGVuZ3RoICAgICE9IDYgdGhlbiBlcnJvcnMucHVzaCBcIkVycm9yOiBJZGVudGlmaWVyIG11c3QgYmUgNiBsZXR0ZXJzXCJcbiAgICBpZiBlcnJvcnMubGVuZ3RoIGlzIDAgYW5kIEBpc05vdFZhbGlkKCkgdGhlbiBlcnJvcnMucHVzaCBcIkVycm9yOiBJbnZhbGlkIElELiBNYXliZSBpdCB3YXMgd3JpdHRlbiBkb3duIGluY29ycmVjdGx5LiBHZW5lcmF0ZSBhIG5ldyBvbmUgdGhlbiB3cml0ZSBkb3duIHRoZSBvbGQgSUQgYW5kIHRoZSBuZXcgb25lIGEgcGllY2Ugb2YgcGFwZXIuIEluY2x1ZGUgYm90aCBJRHMgaW4gY29tbWVudHMgc2VjdGlvbiBhdCBlbmQgb2YgYXNzZXNzbWVudC5cIlxuXG4gICAgcmV0dXJuIGVycm9yc1xuXG4gICMgaGVscGVyIGZ1bmN0aW9uIHRoYXQgZG9lcyBhbGwgdGhlIHdvcmtcbiAgIyByZXR1cm4gY2hlY2sgZGlnaXRcbiAgZ2V0RGlnaXQ6ICggaWQgPSBAaWQgKSAtPlxuICAgIGlkXzEwID0gKEBhbGxvd2VkLmluZGV4T2YoY2gpIGZvciBjaCBpbiBpZC5zcGxpdCBcIlwiIClcbiAgICBjaGVja0RpZ2l0XzEwID0gKChpZF8xMFtpXSAqIHdlaWdodCApIGZvciB3ZWlnaHQsIGkgaW4gQHdlaWdodHMpLnJlZHVjZSAoeCx5KSAtPiB4ICsgeVxuICAgIHJldHVybiBAYWxsb3dlZFtjaGVja0RpZ2l0XzEwICUgQGFsbG93ZWQubGVuZ3RoXVxuXG4iXX0=
