const dotenv = require('dotenv');
dotenv.config();
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');

const inviteFile = './invites.json';
const sleepTime = 15000;

let obj = {
    invites: []
};

var json = JSON.stringify(obj);
fs.writeFile(inviteFile, json, 'utf8', function(err) {
    if (err) throw err;
});

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function saveInvite(guild) {

    if (!guild.me.hasPermission('CREATE_INSTANT_INVITE')) {
        console.log("No perms to create invites in: " + guild.name);
        return;
    }

    var channels = guild.channels.findAll('type', 'text');
    if (!channels[0]) {
        console.log("Failed to save invite for: " + guild.name + "\nError: No channels found!");
        return;
    }

    var channel = channels[0];

    var options = {
        url: 'https://discordapp.com/api/v6/channels/'+ channel.id +'/invites',
        headers: {
          'content-type': 'application/json',
          'content-length': '44',
          'authorization': process.env.TOKEN
        },
        body: '{"max_age":0,"max_uses":0,"temporary":false}'
      };

    request.post(options, function (error, response, body) {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            fs.readFile(inviteFile, 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data);
        
                obj.invites.push({
                    server: {
                        name: info.guild.name,
                        id: info.guild.id
                    },
                    channel: {
                        name: info.channel.name,
                        id: info.channel.id
                    },
                    invite: {
                        code: info.code
                    }
                });
                
                json = JSON.stringify(obj);
                fs.writeFile(inviteFile, json, 'utf8',  function(err) {
                    if (err) throw err;
                    console.log("Saved invite for: " + guild.name);
                    });
            }});
        }
        else if (!error && response.statusCode != 200){
            console.log("Failed to save invite for: " + guild.name + "\nError: " + body);
        }
      });
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  for(let guild of client.guilds) {
    console.log("Trying to save invite to: " + guild[1].name);
    saveInvite(guild[1]);
    console.log("Sleeping...")
    await sleep(sleepTime);
    }
});

client.login(process.env.TOKEN);