var mongoose = require('mongoose')
    , Schema = mongoose.Schema


/**
 * Group Schema
 */

var GroupSchema = new Schema({
  	name : {type : String }
  }
);

mongoose.model('Groups', GroupSchema);

