var express     = require('express'),
    bodyparser  = require('body-parser'),
    urlParser   = require('url'),
    exec        = require('child_process').exec;

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({ extended: false }));

app.post("/analyse", function(req, res) { 
    var path     = urlParser.parse(req.param('url')).pathname,
        parts    = path.split('/'),
        repoName = parts[parts.length - 1];
        
    if(repoName.indexOf('.') > 0) repoName = repoName.slice(0, repoName.lastIndexOf('.'));

    console.log('cd /tmp && git clone ' + req.param('url') + ' && cd /tmp/' + repoName + ' && cloc --report-file ' + __dirname + '/public/repos/' + repoName + '.cloc --csv --by-file .');
    exec('cd /tmp && git clone ' + req.param('url') + ' && cd /tmp/' + repoName + ' && cloc --report-file data.cloc --csv --by-file . && cloc2json data.cloc > ' + __dirname + '/public/repos/' + repoName + '.json && rm -rf /tmp/' + repoName);

    res.send(repoName); 
});


app.listen(8080 || process.env.PORT);