const client = require('../lib/client');
// import our seed data:
const players = require('./players.js');
const leaguesData = require('./leagues.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const leagues = await Promise.all(
      leaguesData.map(league => {
        return client.query(`
                      INSERT INTO leagues (league, email, hash)
                      VALUES ($1, $2, $3)
                      RETURNING *;
                  `,
        [league.league, league.email, league.hash]);
      })
    );
    const league = leagues[0].rows[0];

    await Promise.all(
      players.map(player => {
        return client.query(`
                    INSERT INTO players (name, team, is_active, number, league_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [player.name, player.team, player.isActive, player.number, league.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
