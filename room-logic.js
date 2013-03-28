// heartbeat is a ping to the server to let us know a user is logged in
// to a room. If they close the browser and leave a room that way, the
// heartbeat will expire and we'll remove the user after a period of time.
var heartBeat;

Meteor.autorun(function () {
  if (Session.get('currentRoom')) {
    heartBeat = Meteor.setInterval(function(){
      LoggedUsers.update({'id': Session.get('currentUser')}, {$set: {stamp: new Date().getTime() } } );
    }, 1000);
  }
});

Room = (function(){

  var Room = {},
      maxSize = Infinity;

  Room.options = {
    clearEmpty: false
  };

  Room.addToCurrentlyOpen = function(userId) {
    if (this.availableRooms()[0]) {
      var room = this.availableRooms()[0];
      return this.addUser(room._id, userId);
    }
  };

  Room.setLimit = function(size) {
    maxSize = size;
    return;
  };

  Room.availableRooms = function() {
    return getAvailableRooms(maxSize);
  };

  Room.currentSize = function(roomId) {
    return Rooms.findOne({_id: roomId}).users.length;
  };

  var getAvailableRooms = function(size) {
    if (maxSize !== Infinity) {
      return Rooms.find({ $where: 'this.users.length < '+size }).fetch();
    } else {
      return Rooms.find({}).fetch();
    }
  };

  Room.create = function(roomName, callback) {
    Rooms.insert({
      'maxSize': maxSize,
      'name': roomName,
      'users': []
    }, function(err, res) {
      callback(res);
    });
  };

  Room.addUser = function(roomId, userId) {
    if (!userInRoom(roomId, userId)) {
      Rooms.update( {_id: roomId }, {$push: {users: userId} } );
    }
    LoggedUsers.insert({'id': userId }, {$set: {stamp: new Date().getTime() } } );
  };

  var userInRoom = function(roomId, userId) {
    var users = Rooms.findOne({_id: roomId}, {users: 1, _id: 0} ).users;
    return _.contains(users, userId);
  };

  var getUserToRemove = function(user) {
    var usersInRoom = Rooms.findOne({_id: Session.get('currentRoom')},
                                    {users: 1, _id: 0} ).users;
    var playerIdx = usersInRoom.indexOf(user);
    playerIdx = 'users.'+playerIdx;
    var playerLeaving = {};
    playerLeaving[playerIdx] = 1;
    return playerLeaving;
  };

  var removePlayer = function(playerQueryObject, currentRoom) {
    Session.set('currentRoom', null);
    Rooms.update({
      _id: currentRoom}, {
        $unset: playerQueryObject
      }, function(){
        Rooms.update( {_id: currentRoom}, {
          $pull: {'users': null }
        }, function(){
          if (Room.options.clearEmpty) {
            var r = Rooms.findOne({_id: currentRoom});
            if (r.users.length === 0) {
              Rooms.remove({_id: currentRoom});
            }
          }
          LoggedUsers.remove({'id': Session.get('currentUser')} );
        });
    });
  };

  Room.removeFromRoom = function(userId, roomId) {
    var playerQueryObject = getUserToRemove(userId);
    removePlayer(playerQueryObject, roomId);
    Meteor.clearInterval(heartBeat);
  };

  return Room;

}());