/*
!!!! DELETE THIS FILE AFTER IMPLIMENTATION!!!!!!
just needed to demo some interactions
*/


// demo event handeler for dialog caller
document.getElementById("dialog-caller").onclick = function(){
	
	// open dialog
	document.getElementsByTagName("body")[0].classList.add("dialog-open");
	// disable conflicting buttons
	var i; 
	var buttonObjsArray = document.getElementsByClassName("disable-on-dialog");
	for (i = 0; i < buttonObjsArray.length; i++) {
		console.log(buttonObjsArray[i]);
		buttonObjsArray[i].disabled = true;
	}
	
	// add forecase badges
	document.getElementsByTagName("main")[0].classList.add("forecast-mode");
	// Add forecaste data point to svg chart
	  chart.add_data_point(
		[ 480, 455, 420, 230],
		"Forecase"
	  );
	
};

// demo event handler for dialog caller
document.getElementById("dialog-close-caller").onclick = function(){
	
	// close dialog 
	document.getElementsByTagName("body")[0].classList.remove("dialog-open");
	// undisable conflicting buttons 
	var i; 
	var buttonObjsArray = document.getElementsByClassName("disable-on-dialog");
	for (i = 0; i < buttonObjsArray.length; i++) {
		console.log(buttonObjsArray[i]);
		buttonObjsArray[i].disabled = false;
	}
	
	// remove forecast badges
	document.getElementsByTagName("main")[0].classList.remove("forecast-mode");
	// Remove forecaste data point to svg chart
  	chart.remove_data_point();
	
};


// demo event handler for graph switch between hours and days
document.getElementById("graph-view-hours").onclick = function(){
	
	// remove all active classes 
	let els = this.parentElement.children,
		i = els.length;
	while (i--) {
		els[i].classList.remove("active");
	}
	// add active class list to current
	this.classList.add("active");
	
	// load new data in chart
	chart.update_values(
		[
			{values: [235, 356, 232 ,212, 245, 120, 342, 252, 298]},
			{values: [205, 330, 210, 180, 224, 80, 312, 236, 242]},
			{values: [185, 312, 192 ,162, 205, 62, 292, 212, 218]},
			{values: [101, 215, 93, 86, 101, 23, 212, 104, 120]}
		],
		["11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
	 );
	// checking if forecast is on and adding the forecast data also
	/* ... */

}
