module.exports = function(app){
var controllers = require('./controllers/index');
var group = require('./controllers/ugcontroller');

// app.get('/group/new', controllers.newgroup);
// app.get('/resource/new', controllers.newresource);

//API

app.post('/api/user/create', group.createUser);
app.post('/api/user/:id/update', group.updateUser);
app.get('/api/user/:id/get', group.getUser);
app.get('/api/user/list', group.getUsers);
app.get('/api/user/:id/tasks', group.getTasksByUser);
app.get('/api/user/:id/:groupid/tasks', group.getTasksByUserGroup);

app.post('/api/group/create', group.createGroup);
app.post('/api/group/add/:grpId/:memId', group.addUsersToGroup);
app.post('/api/group/remove/:grpId/:memId', group.removeUsersFromGroup);
app.get('/api/group/:id/get', group.getGroup);
app.get('/api/group/list', group.getGroups);

app.post('/api/task/create', group.createTask);
app.get('/api/task/:id/remove', group.removeTask);
app.get('/api/task/list', group.getTasks);

};
