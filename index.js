const Discord = require('discord.js');
const client = new Discord.Client();
const { ListEvents, handleTokenKey } = require('./calendar_exports.js')
const cron = require('cron');
var moment = require('moment-timezone');

client.on('ready', () => {
  client.user.setStatus('available')
  client.user.setPresence({
    game: {
      name: 'Tierras del Suroeste',
      type: 'PLAYING'
    }
  });

  let id = '741624770067431535';
  let message = client.channels.get(id);

  console.log("A las 7:30 mandare el mensaje con los horarios");
  let scheduledMessage = new cron.CronJob('00 30 07 * * 1-5', async () => {

    message.fetchMessages({
      limit: 100,
    }).then((messages) => {
      message.bulkDelete(messages).catch(error => console.log(error.stack));
    });

    console.log('Timer corriendo bro');
    let actualDate = moment().format('L');
    message.send("**---------------------------------------------------------------------------------------------------------------------------------------------------**")
    message.send(`<@&740619946635296909> __***el menu del dia ${actualDate}***__:`);
    let events = await ListEvents(message);
    message.send(events);
    message.send("**---------------------------------------------------------------------------------------------------------------------------------------------------**")
  },
    null,
    true,
    'America/Argentina/Cordoba');

  scheduledMessage.start();
  console.log('Ready!');
});

client.on('message', async message => {
  //Check bot ping
  if (message.content === '!ping') {
    message.reply("pong");
  }

  // Purge messages
  if (message.content.startsWith('!purge')) {
    const user = message.mentions.users.first();
    // Parse Amount
    const amount = !!parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2])
    if (!amount) return message.reply('Debes especificar un monto para borrar!');
    if (!amount && !user) return message.reply('Tenes que especificar un usuario y cantidad, o sol cantidad de mensajes que quieras eliminar!');
    // Fetch 100 messages (will be filtered and lowered up to max amount requested)
    message.channel.fetchMessages({
      limit: amount + 1,
    }).then((messages) => {
      if (user) {
        const filterBy = user ? user.id : Client.user.id;
        messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
      }
      message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
    });
    message.channel.send("Eliminando...").then(msg => msg.delete(500));
  }

  // List events
  if (message.content === '!listarTest') {
    let actualDate = moment().format('L');
    message.channel.send("**---------------------------------------------------------------------------------------------------------------------------------------------------**")
    // message.channel.send(`<@&740619946635296909> __***el menu del dia ${actualDate}***__:`);
    let events = await ListEvents();
    message.channel.send(events);
    message.channel.send("**---------------------------------------------------------------------------------------------------------------------------------------------------**")
  }


  // Accept Token Key
  if (message.content.startsWith('!token-key')) {
    if (client.user.lastMessage && client.user.lastMessage.content.startsWith("Autoriza el bot entrando al siguiente url: ") && !client.user.lastMessage.content.startsWith("Autentica3")) {
      const tokenKey = message.content.split(" ")[1]
      let authMessage = await handleTokenKey(tokenKey, message);
      message.channel.send(authMessage)
    }
    else {
      message.channel.send("No capo...")
    }
  }

});

client.login(process.env.token);