const loki = require('lokijs');
const Promise = require('bluebird');

const db = new loki('botan.db');

const pdb = new Promise(function(resolve, reject) {
  let facts, stars, last_message;
  db.loadDatabase({}, function() {
    facts = setupCollection('facts');
    stars = setupCollection('stars');
    last_message = setupCollection('last_message');
    resolve({ db: db, facts: facts, stars: stars, last_message: last_message });
  });
});

function setupCollection(name) {
  let col = db.getCollection(name);
  if (col) {
    return col;
  } else {
    return db.addCollection(name);
  }
}

module.exports = pdb;
