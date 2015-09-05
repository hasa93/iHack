
var mongoose = require('mongoose'), 
	Users = mongoose.model('Users'),
	Groups = mongoose.model('Groups');

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

exports.getGroupsByUserId = function(req, res){

	Users.aggregate([
		{$match : { "_id" : req.params.id }},
		{$project : {_id : 1, groups : 1}},
		{$group: {_id : "$_id", groups: {$push: "$groups"}}}

		]).exec(function(err, data){
			if(!data.length) console.log("User not found!");
			if(err) console.log(err);

			res.setHeader('content-type', 'application/json');
			res.send(data);
		});
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

			console.log("Update success!");
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

exports.createGroup = function(req, res){

	var group = new Groups(req.body);

	group.save(function(err, rcd){
		if(err) console.log(err);
		res.setHeader('content-type', 'application/json');
		res.send(rcd);
	});

}