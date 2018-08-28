/********************\
    Simple Window
  (Window_SimpleCTB)
\********************/

// Window Object declared as a Function
function Window_SimpleCTB() {
    // Initialize the object using the function that is defined below
    // this refers to the Window Object, arguments will be x & y
    this.initialize.apply(this, arguments);
};

// Window Object defined/created
Window_SimpleCTB.prototype = Object.create(Window_Base.prototype);
Window_SimpleCTB.prototype.constructor = Window_SimpleCTB;

//******************************************************
// Note: The following are functions of Window_SimpleCTB

// Function: Initialize the object using x & y
Window_SimpleCTB.prototype.initialize = function(x, y) {
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
};

// Function: Simply returns the width for the window (hard coded in this example)
Window_SimpleCTB.prototype.windowWidth = function() {
    return 240;
};

// Function: Simply returns the height for the window
Window_SimpleCTB.prototype.windowHeight = function() {
    return this.fittingHeight(1);
};

// Function: Refreshes the window
// Note: This is where the drawing happens
Window_SimpleCTB.prototype.refresh = function() {
    // x is set to textPadding() which is defined in Window_Base
    // Q: What is textPadding?
    // A: textPadding is the space before and after text in pixels, sort of like an offset
    var x = this.textPadding();

    // width is set to the width of the window - (textpading * 2)
    var width = this.contents.width - this.textPadding() * 2;

    // clear the window
    this.contents.clear();

    // draws an icon
    //           (iconIndex, x, y)
    this.drawIcon(    2,     0, 0);

    // draws text
    //            (text,   x, y, maxWidth, align)
    this.drawText('Text', 36, 0,    80,   'left');
};

// Function: Opens the window
Window_SimpleCTB.prototype.open = function() {
    this.refresh();
    Window_Base.prototype.open.call(this);
};


/********************\
     Scene Menu
    (Scene_Menu)
\********************/
// Note: The following are functions of Scene_Menu

// Function: creates the scene
// Note: This is an overwrite of the menu scene not using an alias
Scene_Menu.prototype.create = function() {
    // Calls the create function from Scene_MenuBase to help setup the basics of a scene
    Scene_MenuBase.prototype.create.call(this);

    // Creates the command window (Item, Equip, Skill, Options, Save, Exit, Etc.)
    this.createCommandWindow();

    // Creates the gold window
    //Note: Created before the simple window because it is used for the 'y' position
    this.createGoldWindow();

    // Creates the simple window using the function below
    this.createSimpleWindow();

    // Creates the status window
    this.createStatusWindow();
};

// Function: creates the simple window
Scene_Menu.prototype.createSimpleWindow = function() {
  // Create the new simple window and add it to the Mene Scene's window list

  // Create a new variable the calls the function of the object
  //                       Window_SimpleCTB(x,y)
  this._simpleWindow = new Window_SimpleCTB(0,0);

  // Set the 'y' position and uses the gold window's height to find the right position
  this._simpleWindow.y = Graphics.boxHeight - this._simpleWindow.height - this._goldWindow.height;

  // Add the window using a function named addWindow defined in Scene_Menu
  this.addWindow(this._simpleWindow);
};

Window_EventItem.prototype.createSimpleWindow = function() {
  // Create the new simple window and add it to the Mene Scene's window list

  // Create a new variable the calls the function of the object
  //                       Window_SimpleCTB(x,y)
  this._simpleWindow = new Window_SimpleCTB(0,0);

  // Set the 'y' position and uses the gold window's height to find the right position
  this._simpleWindow.y = Graphics.boxHeight - 300;

  // Add the window using a function named addWindow defined in Scene_Menu
  this.addWindow(this._simpleWindow);
};

Window_EventItem.prototype.initialize = function(messageWindow) {
  this._messageWindow = messageWindow;
  var width = Graphics.boxWidth;
  var height = this.windowHeight();
  Window_ItemList.prototype.initialize.call(this, 0, 0, width, height);
  this.createSimpleWindow();
  this.openness = 0;
  this.deactivate();
  this.setHandler('ok',     this.onOk.bind(this));
  this.setHandler('cancel', this.onCancel.bind(this));
};

