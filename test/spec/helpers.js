var Tangerine;

Tangerine = new Marionette.Application();

Tangerine.user = new TabletUser();

Tangerine.settings = new Settings({
  "_id": "settings"
});

console.log("Tangerine settings: " + JSON.stringify(Tangerine.settings));

window.Tangerine = Tangerine;
