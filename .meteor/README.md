meteor-rooms
============
A simple smart package for creating rooms in your Meteor app.

v0.1.0

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
-----
To create a room: `Room.create( roomname, callback )`
- the call back returns the new room object and allows you to automatically add the user to the newly created room



