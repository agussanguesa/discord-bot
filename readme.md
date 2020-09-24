# Discord Calendar Bot

`discord-calendar-bot` A Node (Discord.js) based Discord bot for managing Google Calendar Events directly from Discord.

### Prerequisites:

* Node.js and NPM

### Install

* Clone the repository.
* `npm install` : Install the dependencies

### Config
* Follow this guide to create a Discord Bot [Creating a Discord Bot and getting a Token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
* Inside `/config/` create a new file `keys_dev.js` export and fill the following properties:
    ```js
    module.exports = {
        "token": "",
        "calendarId": "",
        "credentials": {
            "installed": {
            "client_id": "",
            "project_id": "",
            "auth_uri": "",
            "token_uri": "",
            "auth_provider_x509_cert_url": "",
            "client_secret": "",
            "redirect_uris": ["", ""]
            }
        }
    }
    ```

### Run the Bot Server:

* `npm start`

____

* The general prefix for the bot commands is `!`.

## Commands

* `!ping` : Tests if the bot is onboard. Bot replies `pong`.

### Listing Events:

* `!list-events` : Lists the upcoming 10 events (along with it's ID).

### Authenticating your calendar: 

* To connect your own Google Calendar with the bot, just type the command `!list-events` once.
* The bot will come up with an auth link, follow the link to get an Auth Token.
* Now use `!token-key _retrievedTokenKey_` to connect and authenticate your calendar.
