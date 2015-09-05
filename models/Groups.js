var mongoose = require('mongoose')
    , Schema = mongoose.Schema


/**
 * Group Schema
 */

var GroupSchema = new Schema({
  	name : {type : String },
  	admin: {type: Array}
  }
);

mongoose.model('Groups', GroupSchema);

