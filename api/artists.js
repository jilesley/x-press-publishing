const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


artistsRouter.get('/',(req, res, next) => {
  db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err, artists) => {
    if (err) {
      next(err);
    } else {
      return res.status(200).json({artists: artists});
    }
  })
});


artistsRouter.param('artistID', (req, res, next, artistId) => {
  db.get(`SELECT * FROM Artist WHERE id = $artistId`,
    {$artistId: artistId},
    (err, artist) => {
      if (err) {
        next(err);
      } else if (artist) {
        req.artist = artist;
        req.artistId = artistId;
        next();
      } else {
        return res.status(404).send();
      }

    }
  )
});


artistsRouter.get('/:artistID', (req, res, next) => {
  return res.status(200).json({artist: req.artist});
});


artistsRouter.put('/:artistID', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;

  if (!name || !dateOfBirth || !biography) {
    return res.status(400).send();
  }

  let isCurrentlyEmployed = 0;

  if (req.body.artist.isCurrentlyEmployed !== 0) {
    isCurrentlyEmployed = 1;
  }

  db.run(`UPDATE Artist SET
            name = $name,
            date_of_birth = $dateOfBirth,
            biography = $biography,
            is_currently_employed = $isCurrentlyEmployed
          WHERE id = $artistId`,
    {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
      $artistId: req.artistId
    }, function(err) {
      if(err) {
        next(err)
      } else {
        db.get(`SELECT * FROM Artist WHERE id = $artistId`,
          {$artistId: req.artistId},
          (err, artist) => {
            res.status(200).json({artist: artist});
          }
        )
      }
    }
  )
});


artistsRouter.post('/', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;

  if (!name || !dateOfBirth || !biography) {
    return res.status(400).send();
  }

  let isCurrentlyEmployed = 0;

  if (req.body.artist.isCurrentlyEmployed !== 0) {
    isCurrentlyEmployed = 1;
  }

  db.run(`INSERT INTO Artist
            (name, date_of_birth, biography, is_currently_employed)
          VALUES ($name, $date_of_birth, $biography, $is_currently_employed)`,
    {
      $name: name,
      $date_of_birth: dateOfBirth,
      $biography: biography,
      $is_currently_employed: isCurrentlyEmployed
    }, function(err) {
      if(err) {
        next(err)
      } else {
        db.get(`SELECT * FROM Artist WHERE id = $lastID`,
          {$lastID: this.lastID},
          (err, artist) => {
            res.status(201).json({artist: artist});
          }
        )
      }
    }
  )
});


artistsRouter.delete('/:artistID', (req, res, next) => {
  db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId`,
    {$artistId: req.artistId}, function(err) {
      if(err) {
        next(err)
      } else {
        db.get(`SELECT * FROM Artist WHERE id = $artistId`,
          {$artistId: req.artistId},
          (err, artist) => {
            res.status(200).json({artist: artist});
          }
        )
      }
    }
  )
});


module.exports = artistsRouter;
