var Rooms = new Meteor.Collection('rooms');
// { room_id: 10, players: [player_id]
var LoggedUsers = new Meteor.Collection('loggedUsers');

var Messages = new Meteor.Collection('messages');

//while client is open, send timestamp to server
//update collection with timestamp
//server function checking if timestamp has diff of over 10s