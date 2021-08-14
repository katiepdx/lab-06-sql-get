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
  });
});
