var express = require('express')
var app = express()
var path = require('path')

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')))
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')))
app.use(express.static(path.join(__dirname, 'public')))

app.listen(3000, '127.0.0.1', function() {
  console.log('Express listening on port 3000')
}).on('error', function(err) {
  console.error(err);
  process.exit(1)
});