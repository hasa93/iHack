module.exports = function(app){
var controllers = require('./controllers/index');
var group = require('./controllers/ugcontroller');

app.get('/', controllers.index);
// app.get('/group/new', controllers.newgroup);
// app.get('/resource/new', controllers.newresource);

//API

app.post('/api/user/create', group.createUser);
app.get('/api/user/:id/get', group.getUser);
app.get('/api/user/list', group.getUsers);
app.get('/api/user/:id/getGroup', group.getGroupsByUserId);

app.post('/api/group/create', group.createGroup);
app.get('/api/group/:id/get', group.getGroup);
app.get('/api/group/list', group.getGroups);

};
