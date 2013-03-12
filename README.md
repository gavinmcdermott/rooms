meteor-rooms
============
A smart package that enables rooms, users, and user messaging in a Meteor application with just a couple lines of code. This currently depends on Meteor Accounts.

Installation
------------
This package can be installed with [Meteorite].
From inside a Meteorite-managed app: ```$ mrt add rooms```

Usage
------------
Here are the main concepts:
1. Lobby
2. Rooms

Lobby
----
To add a lobby to your page, simply add the ```{{> lobby}}``` helper to an HTML file. This will place a lobby widget on the page.

Rooms
----
To add a room to your page, just add the ```{{> room}}``` helper to an HTML file. This will place give you a room context.

Within the room context (```{{> room}} ... {{/room}}```)you have access to several other helpers:

```{{> chatbox}}```  - This helper adds a simple chatbox to the current room.

```{{> userList}}``` - This helper adds a list of the current users in the room.


[Meteorite]: http://oortcloud.github.com/meteorite/