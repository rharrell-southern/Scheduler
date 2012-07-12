var date = new Date();

function genCal (){
	var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		var eventsList = [];
		Meteor.call('fetchSchedule',function(error, result){
			console.log(result);
			eventsList = result;
			$('#cal').html('');
			$('#cal').fullCalendar({
			    eventClick: function(calEvent, jsEvent, view) {
			        $('#createTimeSlot').modal('show');
			        Meteor.call('findScheduleById',calEvent.id, function (error, result){
			        	$('#createTimeSlot #title').html("Update "+ result.title);
			        	$('#createTimeSlot input[type="submit"]').val('Update Request')
						$('#createTimeSlot #delete').html('<input type="button" class="delete btn btn-danger" id="'+result.id +'" value="Delete"/>');
			        	$('#datepicker').val(timeZoneAdjust(result.start, 'MM/dd/yyyy'));
			        	$('#starttime').val(timeZoneAdjust(result.start, 'h:mma'));
			        	$('#endtime').val(timeZoneAdjust(result.end, 'h:mma'));
			        	$('#occupants option[value="'+result.occupants+'"]').attr('selected', true);
			        	$("#occupants").trigger("liszt:updated");
					})

			    },
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'agendaWeek,agendaDay'
				},
				defaultView: 'agendaWeek',
				ignoreTimezone: false,
				events: eventsList
			});
		});
		
};

function timeZoneAdjust(dateString, format) {
	dateString *= 1000;
	console.log(dateString);
	var dateObject = new Date(dateString);
	console.log(dateObject);
	//var offSet = dateObject.getTimezoneOffset() ;
	//console.log(offSet);
	//dateObject.setMinutes(offSet);
	return formatDate(dateObject, format);
}

Template.Main.events = {
	'click #createTimeSlotLink':function (event){
		$('#createTimeSlot input[type="submit"]').val('Submit Request')
		$('#createTimeSlot #delete').html('');
		$('#createTimeSlot #title').html('Request a meeting time');
		$('#datepicker').val('');
    	$('#starttime').val('');
    	$('#endtime').val('');
    	$('#occupants option:selected').attr('selected', false);
    	$("#occupants").trigger("liszt:updated");
	},
	'click #delete': function (event) {
		var conf = confirm('Are you sure you want to delete this event?');
		if (conf){
			Meteor.call('deleteSchedule',event.target.id);
			$('#createTimeSlot').modal('hide');
			genCal();	
		}
		
	}
}

Template.timeForm.Occupants = function () {
	return selectIterate(1,50);
}

Template.timeForm.events = {
	'submit': function(event){
		event.preventDefault();
		var title = grabUrlVars('title', window.location.href)
		var day = $('#datepicker').val();
		var starttime = $('#starttime').val();
		var endtime = $('#endtime').val();
		var occupants = $('#occupants option:selected').val();
		var start = getDateFromFormat(day + ' ' + starttime+':00', 'M/dd/yyyy h:mma:ss');
		var end = getDateFromFormat(day + ' ' + endtime+':00', 'M/dd/yyyy h:mma:ss');
		end /= 1000;
		start /= 1000;
		//alert('Date: ' + day + '\nStart: ' + start + '\nEnd: ' + end + '\nOccupants: ' + occupants);
		if ($('#createTimeSlot input[type="submit"]').val() == 'Submit Request') {
			Meteor.call('insertSchedule', title , start, end, occupants);
		} else if ($('#createTimeSlot input[type="submit"]').val() == 'Update Request') {
			var updateId = $('#delete input').attr("id");
			Meteor.call('updateSchedule', updateId, start, end, occupants);
		}
		$('#createTimeSlot').modal('hide');
		genCal();
	},
	'blur #datepicker' : function(event) {
		checkUsersStart();
		checkUsersEnd();
	},
	'blur #starttime' : function(event) {
		checkUsersStart();
		checkUsersEnd();
	},
	'blur #endtime' : function(event) {
		checkUsersStart();
		checkUsersEnd();
	}
}
function checkUsersStart() {
	var day = $('#datepicker').val();
	var starttime = $('#starttime').val();
	var endtime = $('#endtime').val();
	var occupants = $('#occupants option:selected').val();
	var userCount = 0;
	var prevCount = 0;
	var queryEnd, queryStart = {};
	if (day && starttime && endtime) {

		// Set up start and end time limits
		var startTimeStamp = getDateFromFormat(day + ' ' + starttime+':00', 'M/dd/yyyy h:mma:ss');
		var endTimeStamp = getDateFromFormat(day + ' ' + endtime+':00', 'M/dd/yyyy h:mma:ss');
		startTimeStamp /= 1000;
		endTimeStamp /= 1000;
		startTimeStamp += 3600;
		endTimeStamp += 3600;
		queryEnd = { "start": { $lt: endTimeStamp } };
		queryStart = { "end": { $gt: startTimeStamp } };

		//Set up queries and fetch collections
		var endResult = timeSlots.find(queryEnd);
		var startResult = timeSlots.find(queryStart);
		var startResult2 = timeSlots.find(queryStart);

		//Debug Code
		console.log('Initial Start Time: ' + startTimeStamp);
		console.log('Initial End Time: ' + endTimeStamp);
		console.log('Start Results: ' + startResult.count());
		console.log('End Results: ' + endResult.count());


		//Start Iterations to check for layers of events
		if (startResult.count() > 0) {
		    console.log("Executing Start Results now!");
			startResult.forEach(function(startItem) {
				var tmpCount = 0;
				if (endResult) {
					endResult.forEach(function(endItem) {
						if (startItem.end >= endItem.start && startItem.end <= endItem.end) {
							tmpCount += parseInt(endItem.occupants);
						}
					});
				};
				startResult2.forEach(function(startItem2){
					if (startItem.end <= startItem2.end && startItem.end >= startItem2.start){
						if (startItem2.start < startTimeStamp) {
							tmpCount += parseInt(startItem2.occupants);
						}
					}
				});

				console.log('Temp Count: ' + tmpCount);

				if (prevCount < tmpCount) {
					userCount = tmpCount;
				}
				prevCount = tmpCount;
			});
		}
		
	}
	console.log('User Count: ' + userCount);
	return(userCount);
}
function checkUsersEnd() {
	var day = $('#datepicker').val();
	var starttime = $('#starttime').val();
	var endtime = $('#endtime').val();
	var occupants = $('#occupants option:selected').val();
	var userCount = 0;
	var prevCount = 0;
	var queryEnd, queryStart = {};
	if (day && starttime && endtime) {

		// Set up start and end time limits
		var startTimeStamp = getDateFromFormat(day + ' ' + starttime+':00', 'M/dd/yyyy h:mma:ss');
		var endTimeStamp = getDateFromFormat(day + ' ' + endtime+':00', 'M/dd/yyyy h:mma:ss');
		startTimeStamp /= 1000;
		endTimeStamp /= 1000;
		startTimeStamp += 3600;
		endTimeStamp += 3600;
		queryEnd = { "start": { $lt: endTimeStamp } };
		queryStart = { "end": { $gt: startTimeStamp } };

		//Set up queries and fetch collections
		var endResult = timeSlots.find(queryEnd);
		var startResult = timeSlots.find(queryStart);
		var endResult2 = timeSlots.find(queryEnd);

		//Debug Code
		console.log('Initial Start Time: ' + startTimeStamp);
		console.log('Initial End Time: ' + endTimeStamp);
		console.log('Start Results: ' + startResult.count());
		console.log('End Results: ' + endResult.count());


		//Start Iterations to check for layers of events

		if (endResult.count() > 0) {
		    console.log("Executing End Results now!");
			endResult.forEach(function(endItem) {
				var tmpCount = 0;
				if (startResult) {	
					startResult.forEach(function(startItem) {
						if (endItem.start >= startItem.end && endItem.start <= startItem.start) {
							tmpCount += parseInt(startItem.occupants);
						}
					});
				}
				endResult2.forEach(function(endItem2){
					if (endItem.start >= endItem2.start && endItem.start <= endItem2.end){
						if (endItem2.end > endTimeStamp) {
							tmpCount += parseInt(endItem2.occupants);
						}
					}
				});

				console.log('Temp Count: ' + tmpCount);

				if (prevCount < tmpCount) {
					userCount = tmpCount;
				}
				console.log('Previous Count: ' + prevCount);
				console.log('User Count: ' + userCount);
				prevCount = tmpCount;
			});
			
		}
	}
	console.log('User Count: ' + userCount);
	return(userCount)
}
function selectIterate(min,max){
	var options = '[\n';
	for(i=min;i<=max;i++){
		options += '        "'+i+'"';
		if (i != max) {
			options += ', ';
		}
		options += '\n';
	}
	options += '  ]';
	var optionsObj = eval('(' +options+ ')');
	return optionsObj;
}
	


var CalendarRouter, Router;
CalendarRouter = Backbone.Router.extend({
	routes: {
		"": "main",
		"times": "times"
	},
	main: function () {
			
	},
	times: function(){
		
	}
});
Router = new CalendarRouter;
Meteor.startup(function (){
	$('#starttime').timepicker();
	$('#endtime').timepicker();
	$( "#datepicker" ).datepicker();
	$(".chzn-select").chosen({no_results_text: "Maximum of 50"});
	genCal();
	Meteor.subscribe('timeSlots');
	return Backbone.history.start({
		pushSate: true
	});
});





