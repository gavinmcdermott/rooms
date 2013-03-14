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

    Template.room.inRoom = function() {
      return Session.get('currentRoom');
    };

    Template.createRoom.events = {
      "click .create": function() {
        var roomName = $('input.nameRoomField').val();
        Room.makeRoom(roomName, function(newRoomId){
          Room.addUser(newRoomId, Session.get('currentUser'));
          Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": newRoomId}});
        });
      },
      "keyup .nameRoomField": function(event) {
        var roomName = $(".nameRoomField").val();
        if (event.type == "keyup" && event.which == 13 && roomName !== '') {
          Room.makeRoom(roomName, function(newRoomId){
            Room.addUser(newRoomId, Session.get('currentUser'));
            Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": newRoomId}});
          });
        }
      }
    };

    Template.allRooms.rooms = function() {
      return Rooms.find({}).fetch();
    };

    Template.allRooms.events = {
      'click .join': function() {
        if (Session.get('currentRoom')) {
          Session.set('currentRoom', null);
        }
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
        Room.removeFromRoom(Meteor.userId(), Session.get('currentRoom'));
        Meteor.users.update({_id: Meteor.userId() }, {$set:{"profile.currentRoom": null}});
      }
    };

    Template.roomChat.messages = function() {
      return Messages.find({'room_id' : Session.get("currentRoom")}, {sort: {created_at: 1}});
    };

    Template.roomChat.events = {
      'click .submit': function() {
        var msg = $('.msgEnterField').val();
        $('.msgEnterField').val('');
        Messages.insert({
          'message': msg,
          'user_id': Session.get('currentUser'),
          'room_id': Session.get('currentRoom'),
          'user_email': Meteor.users.find({_id: Session.get('currentUser') }).fetch()[0].emails[0].address,
          'timestamp': new Date().getTime()
        });
      },
      "keyup .msgEnterField": function(event) {
        var msg = $('.msgEnterField').val();
        if (event.type == "keyup" && event.which == 13 && msg !== '') {
          $('.msgEnterField').val('');
          Messages.insert({
            'message': msg,
            'user_id': Session.get('currentUser'),
            'room_id': Session.get('currentRoom'),
            'user_email': Meteor.users.find({_id: Session.get('currentUser') }).fetch()[0].emails[0].address,
            'timestamp': new Date().getTime()
          });
        }
      }
    };
  });
}