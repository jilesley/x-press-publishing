const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


issuesRouter.param('issueID', (req, res, next, issueId) => {
  db.get(`SELECT * FROM Issue WHERE id = $issueId`,
    {$issueId: issueId},
    (err, issue) => {
      if (err) {
        next(err);
      } else if (issue) {
        req.issue = issue;
        req.issueId = issueId;
        next();
      } else {
        return res.status(404).send();
      }
    }
  )
});


issuesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Issue WHERE series_id = $seriesId`,
    {$seriesId: req.params.seriesID}, (err, issues) => {
    if (err) {
      next(err);
    } else {
      return res.status(200).json({issues: issues});
    }
  })
});


issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;

  if (!name || !issueNumber || !publicationDate || !artistId) {
    return res.status(400).send();
  }

  db.run(`INSERT INTO Issue
            (name, issue_number, publication_date, artist_id, series_id)
          VALUES ($name, $issue_number, $publication_date, $artist_id, $series_id)`,
    {
      $name: name,
      $issue_number: issueNumber,
      $publication_date: publicationDate,
      $artist_id: artistId,
      $series_id: req.params.seriesID
    }, function(err) {
      if(err) {
        next(err)
      } else {
        db.get(`SELECT * FROM Issue WHERE id = $lastID`,
          {$lastID: this.lastID},
          (err, issue) => {
            res.status(201).json({issue: issue});
          }
        )
      }
    }
  )
});


issuesRouter.put('/:issueID', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;

  if (!name || !issueNumber || !publicationDate || !artistId) {
    return res.status(400).send();
  }

  db.run(`UPDATE Issue SET
            name = $name,
            issue_number = $issue_number,
            publication_date = $publication_date,
            artist_id = $artist_id,
            series_id = $series_id
          WHERE id = $issueId`,
    {
      $name: name,
      $issue_number: issueNumber,
      $publication_date: publicationDate,
      $artist_id: artistId,
      $series_id: req.params.seriesID,
      $issueId: req.params.issueID
    }, function(err) {
      if(err) {
        next(err)
      } else {
        db.get(`SELECT * FROM Issue WHERE id = $issueId`,
          {$issueId: req.issueId},
          (err, issue) => {
            res.status(200).json({issue: issue});
          }
        )
      }
    }
  )
});


issuesRouter.delete('/:issueID', (req, res, next) => {
  db.run(`DELETE FROM Issue WHERE id = $issueId`,
    {$issueId: req.params.issueID}, function(err) {
      if(err) {
        next(err)
      } else {
        res.status(204).send();
      }
    }
  )
});


module.exports = issuesRouter
