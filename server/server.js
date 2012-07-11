Meteor.methods({
	insertSchedule: function (title, start, end, occupants ) {
		timeSlots.insert({title:title, start:start, end:end, occupants:occupants, allDay:false}, function(error, result){
			timeSlots.update({_id:result},{$set: {id:result}});
		});
	},
	updateSchedule: function(id, title, start, end, occupants) {
		var currentInfo = timeSlots.findOne({_id:id});
		if(currentInfo) {
			title = (!title) ? currentInfo.title : title;
			start = (!start) ? currentInfo.start : start;
			end = (!end) ? currentInfo.end : end; 
			occupants = (!occupants) ? currentInfo.occupants : occupants;

			timeSlots.update({_id:id},{$set: {id:id, title:title, start:start, end:end, occupants:occupants}});
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
	}
})