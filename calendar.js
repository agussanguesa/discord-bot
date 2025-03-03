const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { credentials, calendarId } = require('./config/keys');
var moment = require('moment-timezone');

if (!calendarId) calendarId = "primary"

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, messageObj) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) {
        // if token not present
        // generate Auth URL
        getAccessUrl(oAuth2Client, messageObj)
      }

      else {
        // else if token is present
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      }
    })
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getAccessUrl(oAuth2Client, messageObj) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  messageObj.channel.send(`Autoriza el bot entrando al siguiente url:  ${authUrl}\n Contesta con [!token-key (token)] para autenticar`)
  return
}


async function getAccessToken(code) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  return new Promise((resolve, reject) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) reject(err)
      if (token === null) reject("Bad token key.")
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) reject(err)
        console.log('Token stored to', TOKEN_PATH);
      });
      resolve("Authenticated.")
    });
  });

}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  return new Promise((resolve, reject) => {
    calendar.events.list({
      calendarId: 'primary',
      calendarId,
      timeMax: addDays(1),
      timeMin: new Date(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) reject('La API de Google tiro un error: ' + err)
      const events = res.data.items;

      if (events.length) {
        let eventString = '';
        events.map((event, i) => {
          let hora = 'de ' + event.start.dateTime.slice(11, 16);
          hora += ' hasta ' + event.end.dateTime.slice(11, 16)
          eventString += `\n${i + 1}. __**${event.summary}**__ ${hora} | Link: <${event.hangoutLink}>`
        });
        resolve(eventString)
      }
      else {
        resolve("__**No hay eventos en el dia! :fire: **__")
      }
    });
  }
  )
}

function createEvent(auth, event) {
  const calendar = google.calendar({ version: 'v3', auth });

  return new Promise((resolve, reject) => {
    calendar.events.insert({
      auth: auth,
      calendarId,
      // calendarId: 'primary',
      resource: event,
    }, function (err, newEvent) {
      if (err) {
        reject(`There was an error contacting the Calendar service: ${err}`)
      }
      resolve(`Event created: ${newEvent.data.htmlLink}`);
    });
  }
  )

}


function deleteEvent(auth, id) {
  const calendar = google.calendar({ version: 'v3', auth });

  return new Promise((resolve, reject) => {
    calendar.events.delete({
      calendarId,
      // calendarId: 'primary',
      eventId: id
    }, function (err) {
      if (err) {
        reject(`There was an error contacting the Calendar service: ${err}`)
      }
      resolve(`Event deleted`);
    });
  }
  )

}

function addDays(days) {
  var result = new Date();
  // result = moment().tz("America/Argentina/Cordoba").format();
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = {
  authorize,
  credentials,
  listEvents,
  createEvent,
  deleteEvent,
  getAccessToken,
}