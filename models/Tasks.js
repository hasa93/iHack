
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TasksSchema = new Schema({

	task : {type: String},
	owner : {type: String},
	group : {type: String},
	status : {type: Boolean}
});

mongoose.model('Tasks', TasksSchema);