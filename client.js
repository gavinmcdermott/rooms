(function(){

  Room = {};

  var maxSize = null;

  Room.setMax = function(size) {
    maxSize = size;
    return;
  };

  Room.availableRooms = function() {
    if(maxSize) {
      return Rooms.find({ current_count: { $gt: -1, $lt: maxSize } }).fetch();
    } else {
      return Rooms.find({ current_count: { $gt: -1 } }).fetch();
    }
  };

  Room.availableRoomCount = function() {
    if(maxSize) {
      return Rooms.find({ current_count: { $gt: -1, $lt: maxSize } }).fetch().length;
    } else {
      return Rooms.find({ current_count: { $gt: -1 } }).fetch().length;
    }
  };

  Room.makeRoom = function(callback, room_name) {
    var roomSize;

    if(maxSize) {
      roomSize = maxSize;
    } else {
      roomSize = null;
    }

    Rooms.insert({
      'current_count': 0,
      'max_size': roomSize,
      'name': room_name || null,
      'users': []
    }, function(error, roomId) {
      callback(roomId);
    });
  };

  Room.createSession = function(roomId) {
    return Session.set('currentRoom', roomId);
  };

  Room.addToRoom = function(user) {
    Rooms.update( {_id: Session.get('currentRoom')},
                  {$inc: {current_count: 1} } );
    Rooms.update( {_id: Session.get('currentRoom')},
                  {$push: {users: user} } );
  };

  var getPlayerToRemove = function(user) {
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
    Players.update( {_id: user},
                    { $set : { room_id: null } } );
    Rooms.update( {_id: Session.get('currentRoom')},
                  {$inc: {current_count: -1} } );

    var playerQueryObject = getPlayerToRemove(user);
    removePlayer(playerQueryObject);
  };

  return Room;

}());