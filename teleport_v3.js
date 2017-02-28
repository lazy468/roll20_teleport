/* ************ TELEPORTING SCRIPT V3 ************************
* The intention of this script is to allow the DM to teleport
* one or all characters to a location based on a token placed 
* on the DM layer of the map. 
* To activate the script, type "!tp " and add the name
* of the teleport location (must not contrain spaces) and then 
* the name of the party member to teleport there. They must be 
* seperated by commas. If you want all to teleport, type all. 
* ie. !tp teleport01, all - teleports all players to teleport01
*
* AUTOTELEPORTING: (Command !atp) This feature allows you to place a token on 
* One square (for example stairs) and it will auto move a token 
* to the linked location and back again should you choose.
* Linked locations need to be tokens placed on the GMLayer.
* Naming conventions:
* Two way doors: XXXXXXXX2A, XXXXXXXXX2B
* Three way dooes: XXXXXXXX3A, XXXXXXXXX3B, XXXXXXXXX3C
* (in the case of one way doors, dont create a 3C)
* This system can handle up to 9 way doors (9I max).
****************************************************************/
on("ready", function() {
  log(">> Itialized Auto Teleport - V 1.0");
  LoadSettings ()
  CreateMacro_Emote ()
  CreateMacro_FX ()
  CreateMacro_TP ()
  sendChat("System","/w gm Auto Teleport Loaded - [Click Here](!tp help) or type !tp help for commands.")
});

var Teleporter = Teleporter || {};

function sendHelp () {
    var finalMessage = "/w gm &{template:default} {{name=Teleport Commands !tp help}}"+
    "{{[Auto]\n!tp atp=[Toggle](!tp atp) ["+Teleporter.AUTOTELEPORTER+"]\n Automatic teleporting}}"+
    "{{[Ping]\n!tp ptp=[Toggle](!tp ptp) ["+Teleporter.PINGTELEPORTER+"]\n Ping on teleport}}"+
    "{{[FX]\n!tp fx=[Toggle](!tp fx) ["+Teleporter.FXTELEPORTER+"]\n "+Teleporter.FXTYPE+"}}"+
    "{{[Emote]\n!tp etp=[Toggle](!tp etp) ["+Teleporter.EMOTETELEPORTER+"]\n "+Teleporter.EMOTE+"}}"+
    "{{setfx\nMacro=#tp-fx\n Change the FX.}}"+
    "{{setemote\nMacro=#tp-emote\n Change the emote.}}"+
    "{{[Teleport]\n!tp [t],[p]\n!tp [t],all=Where t is the name of target token to teleport to on the GM layer and p is each player token name seperated by commas or 'all' to teleport everyone.}}"+
    "{{Setup=[How To](!tp setup)}}"
    
    sendChat("", finalMessage);
}

function sendHelp_Setup () {
    var setupMessage = "/w gm &{template:default} {{name=Setup}}"+
    "{{Setup=To set up auto teleporting you must create objects on the GM layer with identical name except for the last 2 characters.  For this example XXXXX2A and XXXXX2B, this indicates a two way system and links between A and B. If you want to create a 3 way system it becomes 3A, 3B, and 3C and so on teleporting players to each node in sequence. Up to 9 teleports are supported for a system.}}"+
    "{{Switches=You can flag teleport tokens on the GM layer with status markers to disable individual effects.}}"+
        "{{Red X=Disables the teleporter}}"+
            "{{Purple=Disables FX}}"+
                "{{Pink=Disables Emotes}}"+
                    "{{Yellow=Disables Ping}}"
    
    sendChat("", setupMessage); 
}

function CreateMacro_Emote () {
    macro = findObjs({
      _type: 'macro',
      name: 'tp-emote'
    })[0];

    if(!macro) {
      players = findObjs({
        _type: 'player'
      });
      gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'tp-emote',
          action: '!tp setemote, ?{Emote}',
          istokenaction: false
        });
      });
    }    
}

function CreateMacro_FX () {
    macro = findObjs({
      _type: 'macro',
      name: 'tp-fx'
    })[0];

    if(!macro) {
      players = findObjs({
        _type: 'player'
      });
      gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'tp-fx',
          action: '!tp setfx, ?{Emote}',
          istokenaction: false
        });
      });
    }    
}

function CreateMacro_TP () {
    var tp_macro = findObjs({
      _type: 'macro',
      name: 'teleport'
    })[0];

    var tp_all_macro = findObjs({
      _type: 'macro',
      name: 'teleport-all'
    })[0];
    
    //find the objects on the GM layer
    var gmObjs = findObjs({
    _pageid: Campaign().get("playerpageid"), 
    _type: "graphic",
    layer: "gmlayer", 
    });

    var tp_objs = "";

    _.each(gmObjs, function(obj) {
      tp_objs += "|" + obj.get("name");
    });
    
    var tp_macro_action = '!tp ?{Teleport to?' + tp_objs + '}, @{target|token_name}';
    var tp_all_macro_action = '!tp ?{Teleport to?' + tp_objs + '}, all';
 
        players = findObjs({
          _type: 'player'
        });
        
        gms = _.filter(players, player => {
          return playerIsGM(player.get('_id'));
        });

        if (tp_objs.length !== 0)
        {
            if(!tp_macro)
            {
              _.each(gms, gm => {
                createObj('macro', {
                  _playerid: gm.get('_id'),
                  name: 'teleport',
                  action: tp_macro_action,
                  istokenaction: false
                });
              });
              sendChat("System","/w gm Macro Created > #teleport");
            }
            else
            {
                tp_macro.set('action', tp_macro_action);    
            }
            
            if(!tp_all_macro)
            {
              _.each(gms, gm => {
                createObj('macro', {
                  _playerid: gm.get('_id'),
                  name: 'teleport-all',
                  action: tp_all_macro_action,
                  istokenaction: false
                });
              });
              sendChat("System","/w gm Macro Created > #teleport-all");
            }
            else
            {
                tp_all_macro.set('action', tp_all_macro_action);    
            }
        }
        else 
        {
            tp_all_macro.set('action', "/w gm No teleport locations on this map!");
            tp_macro.set('action', "/w gm No teleport locations on this map!"); 
        }

}

function LoadSettings () {
    TeleportSettings = findObjs({
        type: "character",
        name: "TeleportSettings"
    })[0];
        
    if (!TeleportSettings) 
    {
        log(">> Auto Teleport -> No token settings detected, initializing token default settings.")
        
        Teleporter.AUTOTELEPORTER = true; //Set to true if you want teleports to be linked
        Teleporter.EMOTETELEPORTER = true; //Set to true if you want teleporters to emote
        Teleporter.PINGTELEPORTER = true; //Set to true if you want teleporters to emote
        Teleporter.FXTELEPORTER  = true; //Set to true if you want teleporters with fx
        Teleporter.EMOTE = "vanishes into thin air"; //Set the emote to use
        Teleporter.FXTYPE = "burn-smoke"; //Set the emote to use
        
        CharacterSettings = createObj("character", {
            name: "TeleportSettings"
        });
        createObj('attribute', {
            name: 'AutoTeleport',
            current: true,
            characterid: CharacterSettings.id
        });
        createObj('attribute', {
            name: 'Emote',
            current: true,
            characterid: CharacterSettings.id
        });
        createObj('attribute', {
            name: 'Ping',
            current: true,
            characterid: CharacterSettings.id
        });
        createObj('attribute', {
            name: 'FX',
            current: true,
            characterid: CharacterSettings.id
        });
        createObj('attribute', {
            name: 'EmoteString',
            current: "vanishes into thin air",
            characterid: CharacterSettings.id
        });
        createObj('attribute', {
            name: 'FXType',
            current: 'burn-smoke',
            characterid: CharacterSettings.id
        });
    }
    else
    {
        Teleporter.AUTOTELEPORTER = getAttrByName(TeleportSettings.id, 'AutoTeleport')
        Teleporter.EMOTETELEPORTER = getAttrByName(TeleportSettings.id, 'Emote')
        Teleporter.PINGTELEPORTER = getAttrByName(TeleportSettings.id, 'Ping')
        Teleporter.FXTELEPORTER = getAttrByName(TeleportSettings.id, 'FX')
        Teleporter.EMOTE = getAttrByName(TeleportSettings.id, 'EmoteString')
        Teleporter.FXTYPE = getAttrByName(TeleportSettings.id, 'FXType')
    }
}

function UpdateSettings () {
    TeleportSettings = findObjs({
        type: "character",
        name: "TeleportSettings"
    })[0];

    var atp = findObjs({_type: "attribute",name: "AutoTeleport",_characterid: TeleportSettings.id})[0];
    var etp = findObjs({_type: "attribute",name: "Emote",_characterid: TeleportSettings.id})[0];
    var ptp = findObjs({_type: "attribute",name: "Ping",_characterid: TeleportSettings.id})[0];
    var emote = findObjs({_type: "attribute",name: "EmoteString",_characterid: TeleportSettings.id})[0];
    var fx = findObjs({_type: "attribute",name: "FX",_characterid: TeleportSettings.id})[0];
    var fxtype = findObjs({_type: "attribute",name: "FXType",_characterid: TeleportSettings.id})[0];
    
    atp.set('current', Teleporter.AUTOTELEPORTER);
    etp.set('current', Teleporter.EMOTETELEPORTER);
    ptp.set('current', Teleporter.PINGTELEPORTER);
    fx.set('current', Teleporter.FXTELEPORTER);
    emote.set('current', Teleporter.EMOTE);
    fxtype.set('current', Teleporter.FXTYPE);
}

function ToggleSettings (tset) {

switch (tset) {
    case "atp":
        if ( Teleporter.AUTOTELEPORTER === true) 
        { Teleporter.AUTOTELEPORTER = false; }
        else
        { Teleporter.AUTOTELEPORTER = true; }
        break;
    case "etp":
        if ( Teleporter.EMOTETELEPORTER === true) 
        { Teleporter.EMOTETELEPORTER = false; }
        else
        { Teleporter.EMOTETELEPORTER = true; }
        break;
    case "ptp":
        if ( Teleporter.PINGTELEPORTER === true) 
        { Teleporter.PINGTELEPORTER = false; }
        else
        { Teleporter.PINGTELEPORTER = true; }
        break;
    case "fx":
        if ( Teleporter.FXTELEPORTER === true) 
        { Teleporter.FXTELEPORTER = false; }
        else
        { Teleporter.FXTELEPORTER = true; }
        break;
}
UpdateSettings()
sendHelp()
}

on('change:campaign:playerpageid', function(campaign) {
    var currMap = getObj('page', campaign.get('playerpageid'));
    CreateMacro_TP()
});

Teleporter.Teleport = function (CharName, TargetName) {
"use strict";

var LocX = 0;
var LocY = 0;

//find the target location
var location = findObjs({
_type: "graphic",
layer: "gmlayer", //target location MUST be on GM layer
name: TargetName
});

if (location.length === 0) {
return; //exit if invalid target location
}

// Get the page ID of the triggering object.
var targetPageID = location[0].get('pageid');

LocX = location[0].get("left");
LocY = location[0].get("top");

//if all are indicated, it lists all
//finds all tokens with the name
var targets = findObjs({
_pageid: targetPageID, 
_type: "graphic"
});

//Move characters to target location
_.each(targets, function(obj) {
//Only player tokens
if (CharName === "all") {
if (obj.get("represents") !== "") {
log("Setting all");

if (Teleporter.FXTELEPORTER === true) {
spawnFx(obj.get("left"), obj.get("top"), Teleporter.FXTYPE, targetPageID);
}

if (Teleporter.PINGTELEPORTER === true) {
sendPing(LocX, LocY, targetPageID, null, true); 
}

obj.set("left", LocX + 1);
obj.set("top", LocY);
}
}
else {
if (obj.get("name").indexOf(CharName) !== -1 && obj.get("layer") !== "gmlayer") {
if (obj.get("represents") !== "") {

if (Teleporter.FXTELEPORTER === true) {
spawnFx(obj.get("left"), obj.get("top"), Teleporter.FXTYPE, targetPageID);
}
if (Teleporter.PINGTELEPORTER === true) {
sendPing(LocX, LocY, targetPageID, null, true);
}

obj.set("left", LocX + 1);
obj.set("top", LocY);
}
}
}
});
};

on("chat:message", function(msg) { 
"use strict";
var cmdName = "!tp ";

if (msg.type === "api" && msg.content.indexOf(cmdName) !== -1 && playerIsGM(msg.playerid)) {
var cleanedMsg = msg.content.replace(cmdName, "");
var commands = cleanedMsg.split(", ");
var targetName = commands[0];

switch (targetName){
    case "atp":
        ToggleSettings("atp");
        break;
    case "etp":
        ToggleSettings("etp");
        break;
    case "ptp":
        ToggleSettings("ptp");
        break;
    case "fx":
        ToggleSettings("fx");
        break;
    case "help":
        sendHelp()
        break;
    case "setup":
        sendHelp_Setup()
        break;
    case "setfx":
        log(">> Set Teleport FX To: "+commands[1])
        Teleporter.FXTYPE = commands[1];
        UpdateSettings()
        sendHelp()
        break;
    case "setemote":
        log(">> Set Teleport Emote To: "+commands[1])
        Teleporter.EMOTE = commands[1];
        UpdateSettings()
        sendHelp()
        break;
    default:
        var i = 1;
        while ( i < commands.length ) {
        Teleporter.Teleport(commands[i], targetName);
        i = i + 1;
        }
        break;
}
}
});

var findContains = function(obj,layer){
"use strict";
var cx = obj.get('left'),
cy = obj.get('top');


if(obj) {
layer = layer || 'gmlayer';
return _.chain(findObjs({
_pageid: obj.get('pageid'), 
_type: "graphic",
layer: layer 
}))
.reduce(function(m,o){
var l=o.get('left'),
t=o.get('top'),
w=o.get('width'),
h=o.get('height'),
ol=l-(w/2),
or=l+(w/2),
ot=t-(h/2),
ob=t+(h/2);

if( ol <= cx && cx <= or 
&& ot <= cy && cy <= ob 
){
m.push(o);
}
return m;
},[])
.value();
}
return [];
}; 

on("change:graphic", function(obj) {
"use strict";

// Get the page ID of the triggering object.
var currentPageID = obj.get('pageid');

if(obj.get("layer") === "gmlayer" || obj.get("layer") === "map") {
return; //Don't trigger if it's an object on the gm or map layer.
}
if (Teleporter.AUTOTELEPORTER === false) {
return; //Exit if auto Teleport is disabled
}
/* To use this system, you need to name two Teleportation locations the same
* with only an A and B distinction. For instance Teleport01A and Teleport01B 
* will be linked together. When a token gets on one location, it will be
* Teleported to the other automatically */

//Finds the current teleportation location
var CurrName = "";

var location = findContains(obj,'gmlayer');
if (location.length === 0) {
return;
}

//Don't teleport if marked dead (with an X)
if(location[0].get('status_dead')) {
return;
}

CurrName = location[0].get("name");

var Letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

//Number of doors in the cycle (second to last character)
var doorCount = CurrName.substr(CurrName.length - 2, 1);

//Current Letter of the Door
var currDoor = CurrName.substr(CurrName.length - 1, 1);
//Finds the pair location and moves target to that location

var i = 0;

if( CurrName.match(/^R:/) ) {
i = randomInteger(doorCount)-1;
} else {
i = Letters.indexOf(currDoor);

if (i === doorCount - 1) {
i = 0;
}
else {
i = i + 1;
}
}

var NewName = CurrName.substr(0,CurrName.length - 2) + doorCount + Letters[i];

var NewX = 0;
var NewY = 0;

var newLocation = findObjs({
_pageid: currentPageID, 
_type: "graphic",
layer: "gmlayer", //target location MUST be on GM layer
name: NewName
});
_.each(newLocation, function(Loc){
//Get the new Location
NewX = Loc.get("left");
NewY = Loc.get("top");
});

if (NewX === 0 ) {
return;
}

if (Teleporter.EMOTETELEPORTER === true && !location[0].get('status_pink')) {
//Display an emote when vanishing
sendChat(obj.get("name"), "/e "+Teleporter.EMOTE);
}

if (Teleporter.PINGTELEPORTER === true && !location[0].get('status_yellow')) {
sendPing(NewX, NewY, currentPageID, null, true); 
}

if (Teleporter.FXTELEPORTER === true && !location[0].get('status_purple')) {
spawnFx(obj.get("left"), obj.get("top"), Teleporter.FXTYPE, currentPageID);
}


obj.set("left", NewX);
obj.set("top", NewY);

});