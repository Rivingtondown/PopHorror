"use strict";

var Imported = Imported || {};
Imported.Rivington_Harvest = true;

var Rivington = Rivington || {};
Rivington.Harvest = Rivington.Harvest || {};
/*:
* @plugindesc Assists with creation of harvest events.
* @author RivingtonDown
*
* @param ---Scavenger---
* @default
*
* @param Scavenge Items
* @desc Comma delimited list of scavenge items
* Default 10,11,12,13,14,15,16,17
* @default 10,11,12,13,14,15,16,17
*
* @param Scavenge Events
* @desc Comma delimited list of events on Event Map
* Default 0
* @default 0
*
* @param Scavenger Event Regions
* @desc Comma delimited list of regions where those events spawn
* Default 0
* @default 0
*

@help

Rivington_Harvest
by: RivingtonDown

----------------------------------------------------------------------------
Comments
----------------------------------------------------------------------------

<hvGather>
job:x     //Optional Job ID
item:x    //Required Item ID
level:x   //Level of Skill
tool:x    //Optional Tool Item ID
</hvGather>

----------------------------------------------------------------------------
PLUGIN COMMANDS
----------------------------------------------------------------------------

hvGather {number of items} {required skill id} {job experience earned} {self switch to toggle} {item id/name to gain}

*/

(function () {
  Rivington.Parameters = PluginManager.parameters('Rivington_Harvest');
  Rivington.Param = Rivington.Param || {};

  //Parameters

  Rivington.Harvest.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    Rivington.Harvest.Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'hvGather') this.harvest('Gather', args);
  };

  Rivington.Harvest.parseComment = function (command, args, eventId) {
    //Create harvestable event by parsing <createHarvest> comment
    var evCmds = $gameMap.event(eventId).event().pages[$gameMap.event(eventId).findProperPageIndex()].list; //find all commands on this event's current page
    var evComments = _.filter(evCmds, function (o) {
      return o.code === 108 || o.code === 408;
    }); //find all comments within this page
    //Amongst any and all comments find the start and end of the <hvCommand> comment
    var startKey,
        endKey = 0;
    _.forEach(evComments, function (value, key) {
      if (value.parameters[0] == "<hv" + command + ">") {
        startKey = key || 0;
      }
      if (value.parameters[0] == "</hv" + command + ">") {
        endKey = key || 0;
      }
    });
    if (startKey == 0 && endKey == 0) {
      return false;
    }
    evComments = _.filter(evComments, function (value, key) {
      return key > startKey && key < endKey;
    }); //filter the comments to only everything inbetween <createHarvest>
    //build a clean harvest js object based on that comment's strings
    var hvObject = {};
    _.forEach(evComments, function (o) {
      var hvKey = o.parameters[0].split(':')[0];
      var hvValue = o.parameters[0].split(':')[1];
      if (hvValue.split(',')[1]) {
        hvObject[hvKey] = parseInt(hvValue.split(',')[0]);
        hvObject[hvKey + '2'] = parseInt(hvValue.split(',')[1]);
      } else {
        hvObject[hvKey] = parseInt(hvValue);
      }
    });

    return hvObject;
  };

  Rivington.Harvest.hvMessage = function (position, msg, audio) {
    $gameMessage.setPositionType(position); //set message to screen middle
    if (audio) {
      AudioManager.playSe({ name: audio, volume: 100, pitch: 100, pan: 0, pos: 0 });
    }
    $gameMessage.add(msg);
  };

  Rivington.Harvest.randomInc = function (min, max) {
    min = Math.ceil(parseInt(min));
    max = Math.floor(parseInt(max));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  Rivington.Harvest.calculateItems = function (hvObject) {
    AudioManager.playSe({ name: "Move4", volume: 20, pitch: 180, pan: 0, pos: 0 });
    $gameParty.gainItem($dataItems[hvObject.item], hvObject.yield);
    var _msg = "Found " + $dataItems[hvObject.item].name + " x" + hvObject.yield;
    if (hvObject.item2) {
      $gameParty.gainItem($dataItems[hvObject.item2], hvObject.yield2);
      _msg += ' and ' + $dataItems[hvObject.item2].name + " x" + hvObject.yield2;
    }
    Rivington.Harvest.hvMessage(2, _msg);
    setTimeout(function(){
      $gameVariables.setValue(6,0);
    },1000)
  };

  Rivington.Harvest.resetScavenge = function(){
    $gameVariables.setValue(6,0); //zero out temp threat variable
    $gameVariables.setValue(7,0); //zero out tool select variable
    $gameSwitches.setValue(5,false); //turn off select tool text
    if ($dataMap.meta.threat && parseInt($dataMap.meta.threat) > 0) {
      $gameSwitches.setValue(4,true); //turn back on threat count-up
    }
  }

  

  Game_Interpreter.prototype.harvest = function (command, args) {
    if (!args) return;
    if (args[0] == "battery") {
      var randBatt = [];
      if(args[1]){
        var battVariance = 1;
      } else {
        var battVariance = parseInt($dataMap.meta.scrap);
      }
      for(var i=26-battVariance;i<26;i++) randBatt.push(i);
      randBatt = randBatt[Math.floor(Math.random()*randBatt.length)];
      $gameParty.gainItem($dataItems[randBatt], 1);
      var _msg = "Found a "+$dataItems[randBatt].name.split(":")[0]+" at"+$dataItems[randBatt].name.split(":")[1]+" charge";
      Rivington.Harvest.hvMessage(2, _msg)
    } else {

    
      //build a clean object by parsing through the comment
      var hvObject = Rivington.Harvest.parseComment(command, args, this._eventId) || {};
      command = command.toLowerCase();
      console.log(args)
      //Parse the plugin command arguments into a clean js object
      hvObject['skill'] = parseInt(args[1]) || null;
      hvObject['jp'] = parseInt(args[2]) || null;
      hvObject['switch'] = args[3] || null;
      if(args[4] && args[4] != "") {
        hvObject['item'] = args[4];
        if (hvObject.item.indexOf(',') > -1) {
          hvObject['item'] = args[4].split(',')[0]
          hvObject['item2'] = args[4].split(',')[1]
        }
        if (isNaN(hvObject.item)) {
          for(var i = 10; i < 20; i++) {
            if ($dataItems[i].name == hvObject.item) {
              hvObject.item = $dataItems[i].id;
            }
          }
        } else {
          hvObject.item = parseInt(hvObject.item)
        }
        if (hvObject.item2 && isNaN(hvObject.item2)) {
          for(var i = 10; i < 20; i++) {
            if ($dataItems[i].name == hvObject.item2) {
              hvObject.item2 = $dataItems[i].id;
            }
          } 
        } else if (hvObject.item2) {
          hvObject.item2 = parseInt(hvObject.item2)
        }
        if (hvObject.item2 && typeof hvObject.item2 != "number") {
          console.warn("no database entry:",hvObject.item2)
          hvObject.item2 = null;
        }
        if (typeof hvObject.item != "number") {
          console.error("no database entry:",hvObject.item)
          return;
        }
      }
      if(args[5] && args[5] != "") {
        hvObject['tool'] = args[5];
        if (isNaN(hvObject.tool)) {
          for(var i = 1; i < 5; i++) {
            if ($dataItems[i].name == hvObject.tool) {
              hvObject.tool = $dataItems[i].id;
            }
          }
        } else {
          hvObject.tool = parseInt(hvObject.tool)
        }
        if (typeof hvObject.tool != "number") {
          console.error("no database entry:",hvObject.tool)
          return;
        }
      }
      
      //Calculate the yield, whether or not it yields multiple items or a random amount of those items
      hvObject['yield'] = hvObject.item2 ? args[0].split(',')[0] : args[0] || 1;
      hvObject['yield2'] = hvObject.item2 ? args[0].split(',')[1] : null;
      hvObject['yield'] = hvObject.yield.split('-').length > 1 ? Rivington.Harvest.randomInc(hvObject.yield.split('-')[0], hvObject.yield.split('-')[1]) : parseInt(hvObject.yield);
      if (hvObject.yield2) {
        hvObject['yield2'] = hvObject.yield2.split('-').length > 1 ? Rivington.Harvest.randomInc(hvObject.yield2.split('-')[0], hvObject.yield2.split('-')[1]) : parseInt(hvObject.yield2);
      }
      console.log(hvObject);

      if (!hvObject.skill || (hvObject.skill && $gameActors.actor(1).isLearnedSkill(hvObject.skill))) {
        if (($gameParty.hasItem($dataItems[hvObject.tool]) && $gameVariables.value(7) == hvObject.tool) || !hvObject.tool) {
          //has and selected corrected tool or no tool required
          if($gameVariables.value(6) > 0 && (!hvObject.threat || parseInt(hvObject.threat) <= 0)) {
            //if variable 6 is set and hvObject.threat is not
            hvObject.threat = $gameVariables.value(6);
          } else {
            hvObject.threat = hvObject.threat || 0;
            hvObject.threat = parseInt(hvObject.threat);
          }
          $gameVariables.setValue(6,hvObject.threat);

          var newThreatValue = $gameVariables.value(5) + hvObject.threat;
          if (hvObject.threat > 0) {
            $gameVariables.setValue(5,newThreatValue);
          }
          Rivington.Harvest.calculateItems(hvObject);
          if (hvObject.switch) {
            $gameSelfSwitches.setValue([this._mapId, this._eventId, hvObject.switch], true);
          }
            
        } else if ($gameVariables.value(7) > 1 && $gameVariables.value(7) != hvObject.tool) {
          //selected wrong tool
          var _msg = "That tool won't work here"
          Rivington.Harvest.hvMessage(2, _msg);
        } else {
          if (!$gameParty.hasItem($dataItems[hvObject.tool])) {
            //var _msg = "No one in the party has a " + $dataItems[hvObject.tool].name + ".";
            var _msg = "No one in the party has the required tool"
            Rivington.Harvest.hvMessage(2, _msg);
          }
        } //end if have item
      } else {
        var _msg2 = "No one has learned the " + $dataSkills[hvObject.skill].name + " skill";
        Rivington.Harvest.hvMessage(2, _msg2);
      } //end if have skill
    } //end if battery
    Rivington.Harvest.resetScavenge();//Reset all the variables and switches and turn back on Threat
  };
})();
