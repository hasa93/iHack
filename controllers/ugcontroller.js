
var mongoose = require('mongoose'), 
	Users = mongoose.model('Users'),
	Groups = mongoose.model('Groups'),
	Tasks = mongoose.model('Tasks');

exports.getUsers = function(req, res){
	Users.find(function(err, rcd){
		if(err) console.log(err); 
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.getGroups = function(req, res){
	Groups.find(function(err, rcd){
		if(err) console.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	})
}

exports.getUser = function(req, res){
	Users.find({"_id" : req.parms.id}, function(err, rcd){
		if(err) console.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	})
}

exports.getGroup = function(req, res){
	Groups.find({"_id" : req.parms.id}, function(err, rcd){
		if(err) console.log(err)
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	})
}


exports.createUser= function(req, res){

	var user = new Users(req.body);

	user.save(function(err, rcd){
		if(err) console.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.addUsersToGroup = function(req, res){
	
	Users.update({"_id": req.params.memId}, {$push: {groups: req.params.grpId}}, {}, function(err, rcd){
			if (err) console.log(err);

			console.log("Update success!");
			res.setHeader('content-type', 'application/json');
			res.send(rcd);
	});	
}

exports.removeUsersFromGroup = function(req, res){
	
	Users.update({"_id": req.params.memId}, {$pull: {groups: req.params.grpId}}, {}, function(err, rcd){
			if (err) console.log(err);
			
			res.setHeader('content-type', 'application/json');
			res.send(rcd);
	});	
}

exports.updateUser = function(req, res){
	Users.update({"_id" : req.params.id}, req.body, {}, function(err, rcd){

		if(err) console.log(err);

		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.createTask = function(req, res){
	
	var task = new Tasks(req.body);

	task.save(function(err,rcd){
		if(err) console.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.getTasksByUserGroup = function(req, res){
	Tasks.find({ "group": req.params.groupid, "owner" : req.params.id }, function(err, rcd){
		if(err) console.log(err);

		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.getTasksByUser = function(req, res){
	Tasks.find({ "owner" : req.params.id }, function(err, rcd){
		if(err) console.log(err);

		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.getTasksByGroup = function(req, res){
	Tasks.find({"group" : req.params.id}, function(err, rcd){
		if(err) console.log(err);

		res.setHeader('content-type','application/json');
		res.send(rcd);
	});
}

exports.removeTask = function(req, res){

	Tasks.update({"_id": req.params.id}, {"status":true}, {}, function(err, rcd){
		if(err) consle.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	})
}

exports.getTasks = function(req, res){
	Tasks.find(function(err, rcd){
		if(err) console.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.deleteTask = function(req, res){
	Tasks.remove({"_id" : req.params.id }, function(err, rcd){
		if(err) console.log(err);

		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.createGroup = function(req, res){

	var group = new Groups(req.body);

	group.save(function(err, rcd){
		if(err) console.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});

}

exports.deleteGroup = function(req, res){
	Groups.remove({"_id" : req.params.id }, function(err, rcd){
		if(err) console.log(err);
				
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});
}

exports.getUsersByGroup = function(req, res){
	Users.find({"groups": { $in:[ req.params.id ]}}, function(err, rcd){
		if(err) console.log(err);
		res.send(rcd);
	});
}
