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
			        alert('Event: ' + calEvent.id);
			    },
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'agendaWeek,agendaDay'
				},
				defaultView: 'agendaWeek',
				ignoreTimeZone: false,
				events: eventsList
			});
		});
		
};

Template.Main.events = {
	
}

Template.timeForm.Occupants = function () {
	return selectIterate(1,50);
}

Template.timeForm.events = {
	'submit': function(event){
		event.preventDefault();
		var day = $('#datepicker').val();
		var starttime = $('#starttime').val();
		var endtime = $('#endtime').val();
		var occupants = $('#occupants option:selected').val();
		var start = getDateFromFormat(day + ' ' + starttime, 'M/dd/yyyy h:mma');
		var end = getDateFromFormat(day + ' ' + endtime, 'M/dd/yyyy h:mma');
		start = new Date(start);
		end = new Date(end);
		//alert('Date: ' + day + '\nStart: ' + start + '\nEnd: ' + end + '\nOccupants: ' + occupants);
		Meteor.call('insertSchedule', 'This is a title' , start, end, occupants);
		$('#createTimeSlot').modal('hide');
		genCal();
	}
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





