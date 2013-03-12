var heartBeat;

Meteor.autorun(function () {
  if (Session.get('currentRoom')) {
    heartBeat = Meteor.setInterval(function(){
      LoggedUsers.update({'id': Session.get('currentUser')}, {$set: {stamp: new Date().getTime() } } );
    }, 1000);
  }
});

(function(){

  // Do not to use implied globals
  Room = {};

  var maxSize = Infinity;

  Room.setMax = function(size) {
    maxSize = size;
    return;
  };

  Room.currentSize = function(roomId) {
    return Rooms.findOne({_id: roomId}).users.length;
  };

  Room.availableRooms = function() {
    // console.log(
    //   Rooms.find({ $where: 'users.length < maxSize' })
    // );
    // var query = { currentCount: { $gt: -1, $lt: maxSize } };
    // if(maxSize) {
    //   query.currentCount.$lt = maxSize;
    // }
    // return Rooms.find(query).fetch();
  };

  // take the word Room out of all these class method names
  // try Room.create()
  Room.makeRoom = function(roomName) {
    Rooms.insert({
      // 'currentCount': 0,
      'maxSize': maxSize,
      'name': roomName,
      'users': []
    }, function(err, res) {
      return res;
    });
  };

  Room.addUser = function(roomId, userId) {
    Session.set('currentRoom', roomId);
    // Rooms.update( {_id: roomId }, {$inc: {currentCount: 1} } );
    Rooms.update( {_id: roomId }, {$push: {users: userId} } );
    LoggedUsers.insert({'id': userId }, {$set: {stamp: new Date().getTime() } } );
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
    Rooms.update( {_id: currentRoom},
                  {$unset: playerQueryObject }, function(){

                    Rooms.update( {_id: currentRoom},
                                  {$pull: {'users': null } }, function(){

                                    // Rooms.update( {_id: currentRoom},
                                    //               {$inc: {currentCount: -1} } );
                                    var r = Rooms.findOne({_id: currentRoom});
                                    if (r.users.length === 0) {
                                      Rooms.remove({_id: currentRoom});
                                    }
                                    LoggedUsers.remove({'id': Session.get('currentUser')} );
                                    Session.set('currentRoom', null);

                                  } );
                  } );
  };

  Room.removeFromRoom = function(user) {
    var room = Session.get('currentRoom');
    var playerQueryObject = getUserToRemove(user);
    removePlayer(playerQueryObject, room);
    Meteor.clearInterval(heartBeat);
  };

}());