const express = require('express')
const app = express()

var bodyParser = require('body-parser')
app.use(bodyParser.json());

const vsts = require("azure-devops-node-api");
const collectionURL = process.env.COLLECTIONURL;    
const token = process.env.TOKEN;

var authHandler = vsts.getPersonalAccessTokenHandler(token);
var connection = new vsts.WebApi(collectionURL, authHandler);

// var vstsGit = connection.getGitApi().then( success => { console.log(success); }, error => { console.log(error); } );
var vstsGit = null;
connection.getGitApi().then(result => {vstsGit = result; console.log(result); }, error => { console.log(error); });

app.get('/', function (req, res) {
res.send('Hello World!')
})

app.listen(3000, function () {
console.log('Example app listening on port 3000!')
})

app.post('/', function (req, res) {
    var repoId = req.body.resource.repository.id;
    var pullRequestId = req.body.resource.pullRequestId;
    var title = req.body.resource.title;
    var prStatus = {
        "state": "Failed",
        "description": "Ready for review",
        "targetUrl": "http://visualstudio.microsoft.com",
        "context": {
            "name": "precheckin-status-menu-menu",
            "genre": "precheckin"
        }
    }
    if (title.includes("WIP")) {
        prStatus.state = "pending";
        prStatus.description = "Work in progress"
    }
    // console.log("PRStatus=", prStatus);
    // console.log("repoId = ", repoId);
    // console.log("PRID=",pullRequestId);
    vstsGit.createPullRequestStatus(prStatus, repoId, pullRequestId).then( result => {
        console.log(result);
    });    
    res.send('Received the POST')
})

