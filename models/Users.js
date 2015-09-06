
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
/* Users schema
**/

var UserSchema = new Schema({
	username : {type : String},
	groups : {type: Array}	
});

mongoose.model('Users', UserSchema);