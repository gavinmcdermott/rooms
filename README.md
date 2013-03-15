meteor-rooms
============
A simple smart package for creating rooms in your Meteor app.

v0.1.0 - This is ALPHA quality

API Docs
--------
https://github.com/gavinmcdermott/rooms

Install Meteorite
------------
You'll need to you have Meteorite installed to use meteor-rooms.

To install and use Meteorite, you'll need node/npm and git. To install, run `npm install -g meteorite`

Install meteor-rooms
-----------
In a Meteorite-managed app: `$ mrt add rooms`

Run the Demo
-----------
[link coming soon]

Get Started
======
To create a simple demo app using meteor-rooms:

1 - Create a new Meteor App
2 - Then run  `$ mrt add rooms`
3 - Remove the pre-existing html, then copy/paste the following in its place:

    <head>
      <title>meteor-rooms demo</title>
    </head>

    <body>
      <div class="container">
        {{ loginButtons }} <br>
        {{#if currentUser}}
          {{ createRoomControls }}
          {{ roomsList }}
          {{> room }}
        {{/if}}
      </div>
    </body>

    <template name="room">
      {{#if inRoom}}
        {{> singleRoom }}
      {{/if}}
    </template>

4 - for some basic styling, add this to your CSS:

    html, body {
      font-family: sans-serif;
    }

    .container {
      width: 900px;
      height: 790px;
      margin: 0 auto;
      background-color: #faf7f7;
    }

Usage
=====
Handlebar Helpers
------
`{{ createRoomControls }}` - Adds a template that allows users to manually create their own room.

`{{ roomsList }}` - Adds a template that shows the list of all rooms that have been created - lets users select rooms to join.

These helpers are not mandatory. They add a simple interface to get up  and running quickly. You can create rooms and manage the Meteor Session through the meteor-rooms API.

Meteor Template
------
{{> room }} - adds a Meteor Template showing a user's current room.


API
====
Collections:
------
`LoggedUsers` - A collection used for tracking when a user is in a room. A user is automatically added to this collection when they are added to a room, and removed from this collecton upon leaving it. You do not have to worry about this.

This allows for removal of users if someone exists a client session without explicitly leaving a room.

A LoggedUser object contains:

    id: currentUser's ._id
    stamp: time when the user enters the room

`Rooms` - A collection used to hold all rooms that are created.

A Rooms object contains:

      'maxSize': maxSize,
      'name': roomName,
      'users': []

- maxSize is a property set on the rooms object. For more info on this, check out the API docs below.
- users is an array containing all active users in the room at that current time.

`Messages` - A collection that holds all messages for your app.

An example Message Object creation:

    'message': msg,
    'user_id': Session.get('currentUser'),
    'room_id': Session.get('currentRoom'),
    'user_email': Meteor.users.find({_id: Session.get('currentUser') }).fetch()[0].emails[0].address,
    'timestamp': new Date().getTime()



Methods
---
Create a room:

    Room.create( roomname, callback )

The callback returns the new room object. This allows for things like allowing you to automatically add a user to the newly created room.

Example:

    Room.create(roomName, function(newRoomId){
      Room.addUser(newRoomId, Session.get('currentUser'));
      Meteor.users.update({_id: Session.get('currentUser') }, {$set:{"profile.currentRoom": newRoomId}});
    });


To add a user to a room:

    Room.addUser(newRoomId, Session.get('currentUser'));

- more docs on the way soon


