const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const request = require('request');

const inviteFile = './invites.json';
const joinFailFile = './joinFails.json';
const sleepTime = 15000;

var successCount = 0;
var failCount = 0;

let obj = {
    invites: []
};

var json = JSON.stringify(obj);
if (!fs.existsSync(inviteFile)) {
    console.log("Error: Invites file does not exist!");
    process.exit(1);
}

let obj2 = {
    fails: []
};

var json2 = JSON.stringify(obj2);
if (!fs.existsSync(joinFailFile)) {
    fs.writeFile(joinFailFile, json2, 'utf8', function(err) {
        if (err) throw err;
    });
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function joinGuild(name, code) {

    var options = {
        url: 'https://discordapp.com/api/v6/invites/'+ code,
        headers: {
          'content-length': '0',
          'authorization': process.env.TOKEN
        }
      };

    request.post(options, function (error, response, body) {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            console.log("Successfully joined: " + name);
            successCount++;
        }
        else if (!error && response.statusCode != 200){
            fs.readFile(joinFailFile, 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                obj2 = JSON.parse(data);
        
                obj2.fails.push({
                    server: name,
                    invite: code
                });
                
                json2 = JSON.stringify(obj2);
                fs.writeFile(joinFailFile, json2, 'utf8',  function(err) {
                    if (err) throw err;
                    console.log("Failed to join: " + name);
                    failCount++;
                });
            }});
        }
      });
}

fs.readFile(inviteFile, 'utf8', async function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data);

    for (var i = 0; i < obj.invites.length; i++) {
        var curr = obj.invites[i];
        console.log("Trying to join: " + curr.server);
        joinGuild(curr.server, curr.invite)
        console.log("Sleeping...");
        await sleep(sleepTime);
    }
    console.log("Finished joining all servers\nSuccess: " + successCount + "\nFails: " + failCount);
}});