if(Meteor.isClient){
  Meteor.startup(function(){
    Meteor.autorun(function () {
      if (Meteor.user()) {
        Session.set('currentUser', Meteor.userId());
        if (Meteor.user().profile) {
          if (Meteor.user().profile.currentRoom !== null) {
            Session.set('currentRoom', Meteor.user().profile.currentRoom);
          }
          if (Meteor.user().profile.currentRoom === null) {
            Session.set('currentRoom', null);
          }
        }
      } else {
        Session.set('currentUser', null);
      }
    });

    Template.rooms.inRoom = function() {
      return Session.get('currentRoom');
    };

    Template.createRoom.events = {
      "click .create": function() {
        var roomName = $('input.textInput').val();
        Room.makeRoom(roomName, function(newRoomId){
          Room.addUser(newRoomId, Session.get('currentUser'));
          Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": newRoomId}});
        });
      }
    };

    Template.allRooms.rooms = function() {
      return Rooms.find({}).fetch();
    };

    Template.allRooms.events = {
      'click .join': function() {
        Room.addUser(this._id, Session.get('currentUser'));
        Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": this._id}});
      }
    };

    Template.roomOverview.roomName = function() {
      var room = Rooms.findOne({_id: Session.get('currentRoom')});
      return room && room.name;
    };

    Template.roomOverview.currentCount = function() {
      if(Session.get('currentRoom')){
        return Room.currentSize(Session.get('currentRoom'));
      }
    };

    Template.room.events = {
      'click .leave': function() {
        Room.removeFromRoom(Meteor.userId());
        Meteor.users.update({_id: Meteor.userId() }, {$set:{"profile.currentRoom": null}});
      }
    };

    Template.roomChat.messages = function() {
      return Messages.find({'room_id' : Session.get("currentRoom")}, {sort: {created_at: 1}});
    };

    Template.roomChat.events = {
      'click .submit': function() {
        var msg = $('.room-msg').val();
        $('.room-msg').val('');
        Messages.insert({
          'message': msg,
          'user_id': Session.get('currentUser'),
          'room_id': Session.get('currentRoom'),
          'timestamp': new Date().getTime()
        });
      }
    };
  });
}