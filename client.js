(function(){

  // Do not to use implied globals
  Room = {};

  var maxSize = null;

  Room.setMax = function(size) {
    maxSize = size;
    return;
  };

  Room.availableRooms = function() {
    var query = { current_count: { $gt: -1, $lt: maxSize } };
    if(maxSize) {
      query.current_count.$lt = maxSize;
    }
    return Rooms.find(query).fetch();
  };

  Room.availableRoomCount = function() {
    // todo: there's a count query, I think
    return Room.availableRooms().length;
  };

  // take the word Room out of all these class method names
  // try Room.create()
  Room.makeRoom = function(callback, room_name) {
    // why would there be no room name?
    Rooms.insert({
      'current_count': 0,
      'max_size': maxSize,
      'name': room_name || null,
      'users': []
    }, function(error, roomId) {
      callback(roomId);
    });
  };

  Room.destroyRoom = function(roomId) {
    Rooms.remove( {_id: roomId}, function(error, result) {
      return result;
    } );
  };

  Room.createRoomSession = function(roomId) {
    return Session.set('currentRoom', roomId);
  };

  Room.addToRoom = function(user) {
    // if (!Session.get('currentRoom')) {
      Rooms.update( {_id: Session.get('currentRoom')},
                    {$inc: {current_count: 1} } );
      Rooms.update( {_id: Session.get('currentRoom')},
                    {$push: {users: user} } );
    // }
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

  var removePlayer = function(playerQueryObject) {
    Rooms.update( {_id: Session.get('currentRoom')},
                  {$unset: playerQueryObject }, function(){

                    Rooms.update( {_id: Session.get('currentRoom')},
                                  {$pull: {'users': null } }, function(){

                                    var r = Rooms.findOne({_id: Session.get('currentRoom')});
                                    if (r.users.length === 0) {
                                      Rooms.remove({_id: Session.get('currentRoom')});
                                    }
                                    Session.set('currentRoom', null);

                                  } );
                  } );
  };

  Room.removeFromRoom = function(user) {
    Rooms.update( {_id: Session.get('currentRoom')},
                  {$inc: {current_count: -1} } );

    var playerQueryObject = getUserToRemove(user);
    removePlayer(playerQueryObject);
  };

}());