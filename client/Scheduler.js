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
				events: eventsList
			});
		});
		
};

function timeZoneAdjust(dateString, format) {
	var dateObject = new Date(dateString);
	var offSet = dateObject.getTimezoneOffset() ;
	dateObject.setMinutes(offSet);
	return formatDate(dateObject, format);
}

Template.Main.events = {
	'click #createTimeSlotLink':function (event){
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
		var start = getDateFromFormat(day + ' ' + starttime, 'M/dd/yyyy h:mma');
		var end = getDateFromFormat(day + ' ' + endtime, 'M/dd/yyyy h:mma');
		start = new Date(start);
		end = new Date(end);
		//alert('Date: ' + day + '\nStart: ' + start + '\nEnd: ' + end + '\nOccupants: ' + occupants);
		Meteor.call('insertSchedule', title , start, end, occupants);
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





