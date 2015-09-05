module.exports = function(app){
var controllers = require('./controllers/index');
var group = require('./controllers/ugcontroller');

app.get('/', controllers.index);

//API

app.post('/api/user/create', group.createUser);
// app.post('/api/groups/create', group.create);
// app.get('/api/groups/', group.allGroups); //list all groups
// app.get('/api/groups/:id/tasks', api.get); //returns tasks of all users
// app.post('/api/groups/:id/tasks', api.get); // update tasks
// app.get('/api/api/', api.index);
// app.post('/api/api/create', api.create);
// app.get('/api/groups/:id', api.get);

// app.get('/api/users/', user.locations);
// app.get('/api/user/:id/', user.locationOf);
// app.post('/api/user/:id/', user.locationOf);

// app.get('/api/user/:id/tasks/:id', user.getTask);
// app.post('/api/user/:id/tasks/', user.createTask);

// app.get('/api/api/:id/delete', api.delete);
// app.get('/api/api/findmac/:mac', api.findMac);

// //apiLocation
// app.get('/api/api/location/data', api.listLocationData);
// app.post('/api/api/location/data', api.addLocationData);
};
