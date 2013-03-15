var heartBeat;

Meteor.autorun(function () {
  if (Session.get('currentRoom')) {
    heartBeat = Meteor.setInterval(function(){
      LoggedUsers.update({'id': Session.get('currentUser')}, {$set: {stamp: new Date().getTime() } } );
    }, 1000);
  }
});

Room = (function(){

  // Do not to use implied globals
  var Room = {};

  Room.addToCurrentlyOpen = function(userId) {
    if (this.availableRooms()[0]) {
      var room = this.availableRooms()[0];
      console.log(room._id);
      console.log(userId);
      return this.addUser(room._id, userId);
    }
  };

  Room.options = {
    clearEmpty: false
  };

  var maxSize = Infinity;
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

  // take the word Room out of all these class method names
  // try Room.create()
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
    if (Session.get('currentRoom')) {
      Room.removeFromRoom(userId, roomId);
      Session.set('currentRoom', null);
    }
    Session.set('currentRoom', roomId);
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
          Session.set('currentRoom', null);
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