(function(){

  Room = {};

  var maxSize;

  Room.setMax = function(size) {
    maxSize = size;
    return;
  };

  Room.availableRooms = function() {
    return Rooms.find({ current_count: { $gt: -1, $lt: maxSize } }).fetch();
  };

  Room.availableRoomCount = function() {
    return Rooms.find({ current_count: { $gt: -1, $lt: maxSize } }).fetch().length;
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

  Room.addToRoom = function(roomId, user) {
    Rooms.update( {_id: roomId},
                  {$inc: {current_count: 1} } );
    Rooms.update( {_id: roomId},
                  {$push: {users: user} } );
  };

  Room.removeFromRoom = function(roomId, user) {
    Players.update( {_id: user},
                    { $set : { room_id: null } } );
    Rooms.update( {_id: roomId},
                  {$inc: {current_count: -1} } );

    var usersInRoom = Rooms.findOne({_id: roomId},
                                    {users: 1, _id: 0} ).users;
    var playerIdx = usersInRoom.indexOf(user);
    playerIdx = 'users.'+playerIdx;
    var playerLeaving = {};
    playerLeaving[playerIdx] = 1;
    Rooms.update( {_id: roomId},
                  {$unset: playerLeaving }, function(){
                    Rooms.update( {_id: roomId},
                    {$pull: {'users': null } }, function(){
                      var r = Rooms.findOne({_id: roomId});
                      if (!r.users.length) {
                        Rooms.remove({_id: roomId});
                      }
                      Session.set('currentRoom', null);
                      // console.log("the currentRoom is now: ", Session.get('currentRoom'));
                    } );
                  } );
  };

  return Room;

}());