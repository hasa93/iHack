
/*
 * GET users listing.
 */
 
var mongoose = require('mongoose')
   , Groups = mongoose.model('Groups')
   , User = mongoose.model('User')

exports.locations = function (req, res) {

       Groups.aggregate(
       [
        {
            $sort: {
                timestamp : -1
            }
        },
        {
            $project: {
                id: 1,
                timestamp : 1,
                data : 1,
                status: 1
            }
        },
        {
            $group: {
                _id: '$id',
                timestamp : { $first: '$timestamp'},
                status : { $first: "$status"},
                path : { $first: "$data"}
            }
        }
       ]).exec(function (err, data) {
            if (err) console.log(err);
            res.setHeader('content-type','application/json');
            res.send(data);
       }); 
};

exports.locationOf = function (req, res) {
	   User.find({ "_id":  req.params.id }, function (err, data) {
            if (err) { console.log(err); res.send([]); return; } 
            data.forEach(function(entry) {
				var User = entry.toObject();
				Groups.find({ "id":  req.params.id }).sort({"timestamp": 1}).limit(1).exec(
				   function (err, data) { 
						if (err) { console.log(err); res.send([]); return; } 
						if (!data[0]) { console.log('No data for '+req.params.id); res.send([]); return; } 
						res.setHeader('content-type','application/json');
						User.data = data[0].data;
						User.longitude = data[0].data[data[0].data.length-1].o;
						User.latitude = data[0].data[data[0].data.length-1].a;
						res.send([User]); // Sending as an array as requested 
				   }
				); 
		   });
		});  
};

exports.initialLocations = function (req, res) {

	   Groups.aggregate(
		[
			{ $match: { "type" : 1 } },
			{
				$sort: {
					timestamp : -1
				}
			},
			{
				$project: {
					id: 1,
					timestamp : 1,
					data : 1,
					status: 1
				}
			},
			{$unwind:'$data'},
			{
				$group: {
					_id: '$id',
					timestamp : { $first: '$timestamp'},
					status : { $first: "$status"},
					path : { $push: "$data" }
				}
			}
        ]).
        exec(function (err, data) {
				if (err) { console.log(err); res.send(500); return; }
				var response = [];
				var i = 0;
				data.forEach(function(User) {
					User.find({ "id":  User._id, "status":  1 }, function (err, rcd) {
						i++;
						if (err) { console.log(err);  }
						if(!rcd.length) { 
							console.log("No User found for User "+User._id);
						}
						else{
							User['name'] = rcd[0].name;
							User['device'] = rcd[0].device;
						}
						User["latitude"] = User.path[User.path.length-1].a;
						User['longitude'] = User.path[User.path.length-1].o;
						
						console.log(rcd);
						console.log(User._id);
						response.push(User);
						if(i==data.length){
							res.setHeader('content-type','application/json');
							res.send(response);
					    }
				   });
				})
		   }
		); 
};

exports.index = function (req, res) {
       User.find({ "status":  1 }, function (err, rcd) {
            if (err) console.log(err);
            res.setHeader('content-type','application/json');
            res.send(rcd);
       });
};

exports.get = function (req, res) {
       User.find({ "_id":  req.params.id }, function (err, rcd) {
            if (err) console.log(err);
            res.setHeader('content-type','application/json');
            res.send(rcd);
       });
};

exports.findMac = function (req, res) {
       User.find({ "device":  {"mac": req.params.mac} }, function (err, rcd) {
            if (err) console.log(err);
            res.setHeader('content-type','application/json');
            res.send(rcd);
       });
};

exports.create = function (req, res) {
       var b = new User(req.body);
       b.save(function (err, rcd) {
            if (err) console.log(err);
            res.setHeader('content-type','application/json');
            res.send(rcd);
       });
};

exports.update = function (req, res) {
       User.update({ "id":  req.params.id }, req.body , {} , function (err, count) {
		   if (err) console.log(err);
           res.setHeader('content-type','application/json');
           res.send({ "updated" : count });
	   });
};

exports.delete = function (req, res) {
       User.update({ "id":  req.params.id }, { "status": 0 } , {} , function (err, count) {
		   if (err) console.log(err);
           res.setHeader('content-type','application/json');
           res.send({ "deleted" : count });
	   });
};

exports.add = function (req, res) {
       var tl = new Groups(req.body);
       tl.save(function (err, rcd) {
            if (err) console.log(err);
            res.setHeader('content-type','application/json');
            res.send(rcd);
       });
};

exports.listLocationData = function (req, res) {
       Groups.find(function (err, data) {
            if (err) console.log(err)
            res.setHeader('content-type','application/json');
            res.send(data);
       }); 
};
exports.addLocationData = function (req, res) {
       var tl = new Groups(req.body);
       tl.save(function (err, rcd) {
            if (err) console.log(err)
            res.setHeader('content-type','application/json');
            res.send(rcd);
       });
};

