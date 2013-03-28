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

    Handlebars.registerHelper('createRoomControls', function(){
      var roomCreationControls = '<div class="createRoomControls"><input type="text" class="nameOfRoomField" placeholder="Enter a room name"><button type="submit" class="button createRoomButton">Create Room</button></div>';
      return new Handlebars.SafeString(roomCreationControls);
    });

    $(document).on('click', '.createRoomButton', function(){
      var roomName = $('input.nameOfRoomField').val();
      if (roomName !== '') {
        Room.create(roomName, function(newRoomId){
          Room.addUser(newRoomId, Session.get('currentUser'));
          Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": newRoomId}});
        });
      }
    });

    $(document).on('keyup', '.nameOfRoomField', function(event) {
      var roomName = $(event.currentTarget).attr('value');
      console.log(roomName);
      if (event.type == "keyup" && event.which == 13 && roomName !== '') {
        Room.create(roomName, function(newRoomId){
          Room.addUser(newRoomId, Session.get('currentUser'));
          Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": newRoomId}});
        });
      }
    });



    Handlebars.registerHelper('roomsList', function(){
      var roomsInList = Rooms.find({}).fetch();
      var res = '<div class="roomList">';

      for (var i = 0; i < roomsInList.length; i++) {
        res = res
          + '<div class="listedRoom">'
            + '<span class="listedRoomName">'
              + roomsInList[i].name
            + '</span>'
            + '<span class="listedRoomCount">'
              + roomsInList[i].users.length + ' user(s)'
            + '</span>'
            + '<button id="' + roomsInList[i]._id + '" class="button joinRoom">'
              + 'Join'
            + '</button>'
          + '</div>';
      }

      res = res + '</div>';
      return new Handlebars.SafeString(res);
    });

    $(document).on('click', '.joinRoom', function(e){
      // console.log(e.currentTarget.id);
      if (Session.get('currentRoom')) {
        console.log('removing user from: ', Session.get('currentRoom'));
        Room.removeFromRoom(userId, Session.get('currentRoom'));
        // Session.set('currentRoom', null);
      }
      Room.addUser(e.currentTarget.id, Session.get('currentUser'));
      Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": e.currentTarget.id}});
    });

    Handlebars.registerHelper('roomName', function(){
      var room = Rooms.findOne({_id: Session.get('currentRoom')});
      return room && room.name;
    });

    Handlebars.registerHelper('roomUserCount', function(){
      if(Session.get('currentRoom')){
        return Room.currentSize(Session.get('currentRoom'));
      }
    });




    Handlebars.registerHelper('inRoom', function(){
      if (Session.get('currentRoom')) {
        return Rooms.findOne({_id: Session.get('currentRoom')});
      }
    });


    Template.room.events = {
      'click .leaveRoom': function() {
        Room.removeFromRoom(Meteor.userId(), Session.get('currentRoom'));
        Meteor.users.update({_id: Meteor.userId() }, {$set:{"profile.currentRoom": null}});
      }
    };

    Handlebars.registerHelper('roomMessages', function() {
      return Messages.find({'room_id' : Session.get("currentRoom")}, {sort: {created_at: 1}});
    });

    Template.roomChat.events = {
      'click .sendMsgToRoom': function() {
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