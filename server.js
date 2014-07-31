var express      = require('express'),
    bodyparser   = require('body-parser'),
    urlParser    = require('url'),
    exec         = require('child_process').exec,
    DockerRunner = require('docker-exec'),
    fs           = require('fs');

var app = express();
app.enable('trust proxy');
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({ extended: false }));

app.get("/gallery.json", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    fs.readdir(__dirname + "/public/repos", function(err, files) {
        if (err) {
            res.send(JSON.stringify({error: err}));
            return;
        }

        files = files.filter(function (file) {
            return fs.statSync(__dirname + "/public/repos/" + file).isFile();
        });

        res.send(JSON.stringify(files));
    });
});

app.post("/analyse", function(req, res) { 
    var path     = urlParser.parse(req.param('url')).pathname,
        parts    = path.split('/'),
        userName = parts[parts.length - 2],
        repoName = parts[parts.length - 1],
	cloneDir = userName + "_" + repoName;
        
    if(repoName.indexOf('.') > 0) repoName = repoName.slice(0, repoName.lastIndexOf('.'));

    var ds = new DockerRunner();
    ds.start({Image: "codescape-worker", Volumes: { "/repo": {}}, Binds: [ __dirname + "/public/repos:/repo:rw" ]}).then(function (stream) {
	stream.pipe(process.stdout);
	console.log("Cloning into ", cloneDir);
        return ds.run("git clone " + req.param("url") + " " + cloneDir + " && cd /tmp/" + cloneDir + " && cloc --report-file report.cloc --csv --by-file . && cloc2json report.cloc > /repo/" + cloneDir + ".json");
    }).then(function() {
	console.log("Stopping container..");
        return ds.stop();
    }).then(function() {
        res.redirect("/index.html#" + cloneDir + ".json");
    }).catch(function(e) { console.log("ERROR:", e); });
});


app.listen(8080 || process.env.PORT);
