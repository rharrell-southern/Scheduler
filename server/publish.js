Meteor.publish('timeSlots', function(){
	return timeSlots.find({});
})