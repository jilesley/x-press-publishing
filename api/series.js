const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


seriesRouter.param('seriesID', (req, res, next, seriesId) => {
  db.get(`SELECT * FROM Series WHERE id = $seriesId`,
    {$seriesId: seriesId},
    (err, series) => {
      if (err) {
        next(err);
      } else if (series) {
        req.series = series;
        req.seriesId = seriesId;
        next();
      } else {
        return res.status(404).send();
      }
    }
  )
});


const issuesRouter = require('./issues');
seriesRouter.use('/:seriesID/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Series`, (err, series) => {
    if (err) {
      next(err);
    } else {
      return res.status(200).json({series: series});
    }
  })
});


seriesRouter.get('/:seriesID', (req, res, next) => {
  return res.status(200).json({series: req.series});
});


seriesRouter.post('/', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;

  if (!name || !description) {
    return res.status(400).send();
  }

  db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`,
    {
      $name: name,
      $description: description
    }, function(err) {
      if(err) {
        next(err)
      } else {
        db.get(`SELECT * FROM Series WHERE id = $lastID`,
          {$lastID: this.lastID},
          (err, series) => {
            res.status(201).json({series: series});
          }
        )
      }
    }
  )
});


seriesRouter.put('/:seriesID', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;

  if (!name || !description) {
    return res.status(400).send();
  }

  db.run(`UPDATE Series SET name = $name, description = $description WHERE id = $seriesId`,
    {
      $name: name,
      $description: description,
      $seriesId: req.seriesId
    }, function(err) {
      if(err) {
        next(err)
      } else {
        db.get(`SELECT * FROM Series WHERE id = $seriesId`,
          {$seriesId: req.seriesId},
          (err, series) => {
            res.status(200).json({series: series});
          }
        )
      }
    }
  )
});


seriesRouter.delete('/:seriesID', (req, res, next) => {
  db.get(`SELECT * FROM Issue WHERE series_id = $seriesId`,
    {$seriesId: req.seriesId},
    (err, issues) => {
      if(err) {
        next(err)
      } else if (issues) {
        return res.status(400).send();
      } else {
        db.run(`DELETE FROM Series WHERE id = $seriesId`,
          {$seriesId: req.seriesId}, function(err) {
            if(err) {
              next(err)
            } else {
              res.status(204).send();
            }
          }
        )
      }
    }
  )
})


module.exports = seriesRouter;
