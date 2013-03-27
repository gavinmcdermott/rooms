Meteor.setInterval(function(){

  var time = new Date().getTime() - 5000;
  var expiredUsers = LoggedUsers.find( {stamp: {$lt: time } } ).fetch();
  for (var i = 0; i < expiredUsers.length; i++) {
    Rooms.update({}, {$pull: {'users': expiredUsers[i].id} }, { multi: true }, function(e) {
      // console.log('success!!!');
      // console.log('we removed: ', expiredUsers[i].id);
    });
    LoggedUsers.remove({'id': expiredUsers[i].id});
  }
}, 5000);