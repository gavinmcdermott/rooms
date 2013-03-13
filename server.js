Meteor.setInterval(function(){

  var time = new Date().getTime() - 5000;
  var expiredUsers = LoggedUsers.find( {stamp: {$lt: time } } ).fetch();
  console.log('outer');
  for (var i = 0; i < expiredUsers.length; i++) {
    console.log('inner');
    Rooms.update({}, {$pull: {'users': expiredUsers[i].id} }, function(e) {
      console.log('success!!!');
    } );
    console.log('id: ',expiredUsers[i].id);
    LoggedUsers.remove({'id': expiredUsers[i].id});
  }
}, 5000);