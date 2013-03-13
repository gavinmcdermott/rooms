Package.describe({
  summary: "Rooms package for managing rooms and users"
});

Package.on_use(function(api){
  api.use('accounts-ui', ['client', 'server']);
  api.use('accounts-password', ['client', 'server']);
  api.use('templating', 'client');

  api.add_files('main.html', 'client');
  api.add_files('rooms.js', 'client');
  api.add_files('client.js', 'client');
  api.add_files('shared.js', ['client', 'server']);
});