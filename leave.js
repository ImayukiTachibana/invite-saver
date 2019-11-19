const dotenv = require('dotenv');
dotenv.config();
const Discord = require('discord.js');
const client = new Discord.Client();

const sleepTime = 15000;

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
  
    for (let guild of client.guilds) {
        if (guild[1].owner != guild[1].me){
            console.log("Trying to leave: " + guild[1].name);
            guild[1].leave()
                .then(g => console.log("Left guild: " + g.name))
                .catch(console.error);
        }
        else {
            console.log("Skipping: " + guild[1].name);
        }
        console.log("Sleeping...");
        await sleep(sleepTime);
      }
      console.log("Left all server not owned by current user!");
  });
  
  client.login(process.env.TOKEN);