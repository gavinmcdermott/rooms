Room = {};
Room.availableRooms = function() {
  return Rooms.find({ current_count: { $gt: -1, $lt: ROOM_SIZE } }).fetch();
};
Room.availableRoomCount = function() {
  return Rooms.find({ current_count: { $gt: -1, $lt: ROOM_SIZE } }).fetch().length;
};
Room.makeRoom = function(size, roomName, callback) {
  var room = Rooms.insert({
    'name': roomName || null,
    'players': [],
    'current_count': 0,
    'size': size
  }, function(error, result) {
    callback(result);
  });
};
Room.createSession = function(room) {
  Session.set('currentRoom', room);
};
Room.addToRoom = function(room, user) {
  Rooms.update( {_id: room},
                {$inc: {current_count: 1} } );
  Rooms.update( {_id: room},
                {$push: {players: user} } );
};
Room.removeFromRoom = function(room, user) {
  Players.update( {_id: user},
                  { $set : { room_id: null } } );
  Rooms.update( {_id: room},
                {$inc: {current_count: -1} } );

  var usersInRoom = Rooms.findOne({_id: room},
                                  {players: 1, _id: 0} ).players;
  var playerIdx = usersInRoom.indexOf(user);
  playerIdx = 'players.'+playerIdx;
  var playerLeaving = {};
  playerLeaving[playerIdx] = 1;
  Rooms.update( {_id: room},
                {$unset: playerLeaving }, function(){
                  Rooms.update( {_id: room},
                  {$pull: {'players': null } }, function(){
                    var r = Rooms.findOne({_id: room});
                    if (!r.players.length) {
                      Rooms.remove({_id: room});
                    }
                    Session.set('currentRoom', null);
                    // console.log("the currentRoom is now: ", Session.get('currentRoom'));
                  } );
                } );
};