const sqlconnection = require('../../sqlite');
const createUsers = require('./createUsers');

async function migrationsRun() {
  const schemas = [createUsers].join('');

  sqlconnection()
    .then((db) => db.exec(schemas))
    .then(() => console.log('Migrations run successfully!'))
    .catch((err) => console.log(err));
}

module.exports = migrationsRun;