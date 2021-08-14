const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/players', async(req, res) => {
  try {
    const data = await client.query('SELECT * from players');

    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/players/:id', async(req, res) => {
  const id = req.params.id;

  try {
    const data = await client.query('SELECT * from players WHERE id = $1', [id]);

    if(!data.rows[0]) res.status(500).json({ error: `Sorry, no player found with the id of ${id}`})
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/players', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO players(name, team, is_active, number, league_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `, [req.body.name, req.body.team, req.body.is_active, req.body.number, req.body.league_id]);
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/players/:id', async(req, res) => {
  const { id } = req.params;
  try {
    const data = await client.query(`
    UPDATE players
    set name = $1, team = $2, is_active = $3, number = $4, league_id = $5
    WHERE id = $6
    RETURNING *
    `, [req.body.name, req.body.team, req.body.is_active, req.body.number, req.body.league_id, id]);
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/players/:id', async(req, res) => {
  const { id } = req.params;

  try {
    const data = await client.query(`
    DELETE FROM players WHERE id = $1
    RETURNING *
    `, [id]);

    res.json(data.rows[0])
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})
app.use(require('./middleware/error'));

module.exports = app;
