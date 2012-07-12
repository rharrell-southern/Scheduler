Meteor.methods({
	insertSchedule: function (title, start, end, occupants) {
		timeSlots.insert({title:title, start:start, end:end, occupants:occupants, allDay:false}, function(error, result){
			timeSlots.update({_id:result},{$set: {id:result}});
		});
	},
	updateSchedule: function(id, start, end, occupants) {
		var currentInfo = timeSlots.findOne({_id:id});
		if(currentInfo) {
			timeSlots.update({_id:id},{$set: {start:start, end:end, occupants:occupants}});
			return true;
		} else {
			return false;
		}
	},
	fetchSchedule: function (query) {
		var eventsList = [];
		var eventCollection;
		if (query) {
			eventColletion = timeSlots.find(query);
		} else {
			eventCollection = timeSlots.find();
		}
		eventCollection.forEach(function(item){
			eventsList.push(item);
		});
		return eventsList;
	},
	findScheduleById: function(id){
		return timeSlots.findOne({_id:id});
	},
	deleteSchedule: function (id) {
		timeSlots.remove({_id:id});
	},
	checkUsers:function(day, starttime, endtime, occupants) {
		var userCount = 0;
		var prevCount = 0;
		var queryEnd, queryStart = {};
		if (day && starttime && endtime) {

			// Set up start and end time limits
			var startTimeStamp = getDateFromFormat(day + ' ' + starttime+':00', 'M/dd/yyyy h:mma:ss');
			var endTimeStamp = getDateFromFormat(day + ' ' + endtime+':00', 'M/dd/yyyy h:mma:ss');
			startTimeStamp /= 1000;
			endTimeStamp /= 1000;
			queryEnd = { "start": { $lt: endTimeStamp } };
			queryStart = { "end": { $gt: startTimeStamp } };

			//Set up queries and fetch collections
			var endResult = timeSlots.find(queryEnd);
			var startResult = timeSlots.find(queryStart);
			var endResult2 = timeSlots.find(queryEnd);
			var startResult2 = timeSlots.find(queryStart);

			//Debug Code
			console.log('Initial Start Time: ' + startTimeStamp);
			console.log('Initial End Time: ' + endTimeStamp);
			console.log('Start Results: ' + startResult.count());
			console.log('End Results: ' + endResult.count());


			//Start Iterations to check for layers of events
			if (startResult.count > 0) {
			    console.log("Executing Start Results now!");
				startResult.forEach(function(startItem) {
					var tmpCount = 0;
					if (endResult) {
						endResult.forEach(function(endItem) {
							console.log('S1 End 1: ' + startItem.end + ' >= ' + 'S1 Start 2: ' + endItem.start);
							console.log('S1 End 1: ' + startItem.end + ' <= ' + 'S1 End 2: ' + endItem.end);
							if (startItem.end >= endItem.start && startItem.end <= endItem.end) {
								tmpCount += endItem.occupants;
							}
						});
					};
					startResult2.forEach(function(startItem2){
						console.log('S2 End 1: ' + startItem.end + ' <= ' + 'S2 End 2: ' + startItem2.end);
						console.log('S2 End 1: ' + startItem.end + ' >= ' + 'S2 Start 2: ' + startItem2.start);
						if (startItem.end <= startItem2.end && startItem.end >= startItem2.start){
							if (startItem2.start < startTimeStamp) {
								tmpCount += startItem2.occupants;
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

			endResult.rewind();	
			endResult2.rewind();
			startResult.rewind();

			if (endResult.count() > 0) {
			    console.log("Executing End Results now!");
				endResult.forEach(function(endItem) {
					var tmpCount = 0;
					if (startResult) {	
						startResult.forEach(function(startItem) {
							if (endItem.start >= startItem.end) {  e1 = 'Is: true' } else { e1 = 'Is: false' }
							console.log('E1 Start 1: ' + startItem.end + ' >= ' + 'E1 End 2: ' + startItem.end + ' ' + e1);
							if (endItem.start <= startItem.start) { e1 = 'Is: true' } else { e1 = 'Is: false' }
							console.log('E1 Start 1: ' + startItem.end + ' <= ' + 'E1 Start 2: ' + startItem.start + ' ' + e1);
							if (endItem.start >= startItem.end && endItem.start <= startItem.start) {
								tmpCount += parseInt(startItem.occupants);
							}
						});
					}
					endResult2.forEach(function(endItem2){
							var e2;
							if (endItem.start >= endItem2.start) { e2 = 'Is: true' } else { e2 = 'Is: false'}
							console.log('E2 Start 1: ' + endItem.end + ' >= ' + 'E2 Start 2: ' + endItem2.end + ' ' + e2);
							if (endItem.start <= endItem2.end) { e2 = 'Is: true' } else { e2 = 'Is: false'}
							console.log('E2 Start 1: ' + endItem.end + ' <= ' + 'E2 End 2: ' + endItem2.start + ' ' + e2);
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
	}
})