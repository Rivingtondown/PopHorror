"use strict";

var Imported = Imported || {};
Imported.Rivington_Util = true;

var Rivington = Rivington || {};
var RIV = RIV || {};
RIV.Util = RIV.Util || {};
/*:
* @plugindesc Javascript Utilities.
* @author RivingtonDown
*
* @help
*
* Rivington_Util
* by: RivingtonDown
*
*/

(function () {

  RIV.Util.mapIntArray = function(x) {
    return _.map(JSON.parse(x), function(z){return parseInt(z)});
  }

  RIV.Util.ArrContainsAll = function(a) {
      var fn = function(n, src, got, all) {
          if (n == 0) {
              if (got.length > 0) {
                  all[all.length] = got;
              }
              return;
          }
          for (var j = 0; j < src.length; j++) {
              fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
          }
          return;
      }
      var all = [];
      for (var i = 3; i < 4; i++) {
          fn(i, a, [], all);
      }
      all.push(a);
      return all;
  }

  RIV.Util.ArrHasValue = function(a,b) {
    this.array = a;
    for(var i=0;i<array.length;i++){
      return this.array[i].split(",").contains(String(b))
    }
  }

  RIV.Util.ArrSharedValue = function (haystack, arr) {
      this.sharedIndex = 0;
      for(var i = 0; i<haystack.length; i++) {
        if(arr.includes(haystack[i])) {
          this.sharedIndex = haystack[i];
          i = haystack.length+1;
        }
      }
      return this.sharedIndex;
  };

  RIV.Util.enoughTime = function(args) {
    this.timeUnit = args.charAt(args.length - 1);
    this.time = parseInt(args.substring(0, args.length - 1));
    this.extraHour = 0;
    if (this.timeUnit == "m" && OrangeTimeSystem.minute + this.time >= 60) {
      this.extraHour += 1;
    }
    if ((this.timeUnit == "h" && (OrangeTimeSystem.hour + this.time >=24)) || (this.timeUnit == "m" && (OrangeTimeSystem.hour + this.extraHour >=24))) {
      return false;
    } else {
      return true;
    }
  };

  RIV.Util.getRegionTileList = function(regionId) {
    var tileList = [];

    for (var x = 0; x < $gameMap.width(); x++) {
      for (var y = 0; y < $gameMap.height(); y++) {
          if ($gameMap.regionId(x, y) == regionId) {
            tileList.push({x : x, y : y});
          }
      }
    }

    return tileList;
  };

})();
