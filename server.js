var express      = require('express'),
    bodyparser   = require('body-parser'),
    urlParser    = require('url'),
    exec         = require('child_process').exec,
    DockerRunner = require('docker-exec');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({ extended: false }));

app.post("/analyse", function(req, res) { 
    var path     = urlParser.parse(req.param('url')).pathname,
        parts    = path.split('/'),
        userName = parts[parts.length - 2],
        repoName = parts[parts.length - 1];
        
    if(repoName.indexOf('.') > 0) repoName = repoName.slice(0, repoName.lastIndexOf('.'));

    var ds = new DockerRunner();
    ds.start({Image: "codescape-worker", Volumes: { "/repo": {}}, Binds: [ __dirname + "/public/repos:/repo:rw" ]}).then(function (stream) {
	stream.pipe(process.stdout);
	var cloneDir = userName + "_" + repoName;
	console.log("Cloning into ", cloneDir);
        return ds.run("git clone " + req.param("url") + " " + cloneDir + " && cd /tmp/" + cloneDir + " && cloc --report-file report.cloc --csv --by-file . && cloc2json report.cloc > /repo/" + cloneDir + ".json");
    }).then(function() {
	console.log("Stopping container..");
        return ds.stop();
    }).then(function() {
        res.send("Done");
    }).catch(function(e) { console.log("ERROR:", e); });
});


app.listen(8080 || process.env.PORT);
