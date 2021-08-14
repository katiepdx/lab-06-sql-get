require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('player routes', () => {
    // let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      // const signInData = await fakeRequest(app)
      //   .post('/auth/signup')
      //   .send({
      //     league: 'WNBA',
      //     email: 'WNBA@WNBA.com',
      //     password: '1234'
      //   });
      
      // token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns all players', async() => {
      const expectation = [
        { 
          id: 1, 
          name: 'Sue Bird', 
          team: 'Seattle Storm',
          is_active: true,
          number: 10,
          league_id: 1
        },
        { 
          id: 2, 
          name: 'Diana Taurasi', 
          team: 'Phoenix Mercury',
          is_active: true,
          number: 3,
          league_id: 1
        },
        { 
          id: 3, 
          name: 'Jewell Loyd', 
          team: 'Seattle Storm',
          is_active: true,
          number: 24,
          league_id: 1
        },
        { 
          id: 4, 
          name: 'Breanna Stewart', 
          team: 'Seattle Storm',
          is_active: true,
          number: 30,
          league_id: 1
        },
        { 
          id: 5, 
          name: 'Candace Parker', 
          team: 'Chicago Sky',
          is_active: true,
          number: 3,
          league_id: 1
        },
      ];
      
      const data = await fakeRequest(app)
        .get('/players')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('returns sue bird for player/1', async() => {
      const expectation = { 
        id: 1, 
        name: 'Sue Bird', 
        team: 'Seattle Storm',
        is_active: true,
        number: 10,
        league_id: 1
      };
      const data = await fakeRequest(app)
        .get('/players/1')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('GET /player/:id sends an ERROR status and message if the player does not exist', async() => {
      const failedGetById = await fakeRequest(app)
        .get('/players/100')
        .expect('Content-Type', /json/)
        .expect(500)
      expect(failedGetById.body.error).toEqual('Sorry, no player found with the id of 100')
    })

    test('POST /players creates a new player', async() => {
      const newPlayer = {
        name: 'new player',
        team: 'new player team',
        is_active: true,
        number: 0,
        league_id: 1
      };

      const data = await fakeRequest(app)
        .post('/players')
        .send(newPlayer)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual({ ...newPlayer, id: 6 });
    });

    test('PUT /players/:id updates the player data by id', async() => {
      const updatedPlayer = {
        name: 'Sue BIRD',
        team: 'Seattle STORM',
        is_active: true,
        number: 10,
        league_id: 1
      };

      const data = await fakeRequest(app)
        .put('/players/1')
        .send(updatedPlayer)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(data.body).toEqual({ ...updatedPlayer, id: 1 });
    });

    test('PUT /player/:id - sends an ERROR status and message if the player does not exist', async() => {
      const updatedPlayer = {
        name: 'Sue BIRD',
        team: 'Seattle STORM',
        is_active: true,
        number: 10,
        league_id: 1
      };
      
      const failedUpdate = await fakeRequest(app)
        .put('/players/100')
        .send(updatedPlayer)
        .expect(500)
        .expect('Content-Type', /json/)
      expect(failedUpdate.body.error).toEqual('Sorry, could not update player 100')
    })

    test('DELETE /players/:id deletes the player by id', async() => {
      const deletedPlayer = await fakeRequest(app)
        .delete('/players/6')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(deletedPlayer.body.id).toEqual(6);

      const failedRequest = await fakeRequest(app)
        .get('/players/6')
        .expect(500)
      expect(failedRequest.body.error).toEqual('Sorry, no player found with the id of 6')
    });

    test('DELETE /players/:id sends an ERROR status and message if player does not exist', async() => {
      const failedDelete = await fakeRequest(app)
        .delete('/players/100')
        .expect(500)
      expect(failedDelete.body.error).toEqual('Sorry, could not delete player 100. Player may not exist in database.')
    })
  });
});
