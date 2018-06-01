var express = require('express'); // Web Framework
var app = express();
var port = process.env.PORT || 3000;
var sql = require('mssql'); // MS Sql Server client
var bodyParser = require("body-parser");
//var cors = require('cors');
//app.use(cors())

var sqlConfig = {
    user: 'stw004',
    password: 'Hopadillo1',
    server: 'aa8oqu89jtflq2.c8onelmtehzn.us-east-2.rds.amazonaws.com',
    database: 'landtrack'
}

 app.listen(port, function () {
    //var host = server.address().address
    console.log("app listening at ", port)
});

app.use(function(req, res, next) {
    bodyParser.json();
    bodyParser.urlencoded({ extended: true })
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.get('/tracts', function(req, res, next){
  new sql.ConnectionPool(sqlConfig).connect().then(pool => {
    return pool.request().query('select * from landtrack.dbo.Tracts')
  }).then(result => {
    res.end(JSON.stringify(result.recordset))
    sql.close();
  }).catch(err => {
    res.status(500).send({message: "error"})
    sql.close();
  });  
});


app.get('/projects', function(req, res, next){
  new sql.ConnectionPool(sqlConfig).connect().then(pool => {
    return pool.request().query('select distinct landtrack.dbo.Tracts.Project from landtrack.dbo.Tracts')
  }).then(result => {
    res.end(JSON.stringify(result.recordset))
    sql.close();
  }).catch(err => {
    res.status(500).send({message: "error"})
    sql.close();
  });  
});

app.get('/tracts/:project', function(req, res, next){
  new sql.ConnectionPool(sqlConfig).connect().then(pool => { 
    return pool.request().input('Project', req.params.project)
    .execute('landtrack.dbo.projectselection')
  }).then(result => {
    res.end(JSON.stringify(result.recordset))
    sql.close();
  }).catch(err => {
    res.status(500).send({message: "error"})
    sql.close();
  });  
});

app.get('/notes/:tractname', function(req, res, next){
  new sql.ConnectionPool(sqlConfig).connect().then(pool => { 
    return pool.request().input('tractname', req.params.tractname)
    .execute('landtrack.dbo.notequery')
  }).then(result => {
    res.end(JSON.stringify(result.recordset))
    sql.close();
  }).catch(err => {
    res.status(500).send({message: "error"})
    sql.close();
  });  
});

app.post('/newnote', function(req, res, next){
  res.setHeader("Content-Type","application/json")
  new sql.ConnectionPool(sqlConfig).connect().then(pool =>{
    pool.query('insert into landtrack.dbo.Notes (Tract_Num, Date, Call_Type, Note) values (req.body.Tract_Num, req.body.Date, req.body.Call_Type, Note)')
  }).then(result=>{sql.close();}).catch(err =>{
    res.status(500).send({message: "error"})
    sql.close();
  });
});
