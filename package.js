Package.describe({
  summary: "Rooms package for managing rooms and users"
});

Package.on_use(function(api){
  api.add_files('client.js', 'client');
  api.add_files('shared.js', ['client', 'server']);
});