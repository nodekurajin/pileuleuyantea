const { google } = require('googleapis');

// Replace with your Client ID and Client Secret from OAuth credentials
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

// Redirect URI used during OAuth flow (replace with your app's URI)
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

// Scopes required for calendar access
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * Creates an OAuth2 client
 * @returns {OAuth2Client} The OAuth2 client object
 */
function authorize() {
  const { OAuth2Client } = google.auth;
  const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  return oAuth2Client;
}

/**
 * Generates a URL for user authorization
 * @param {OAuth2Client} oAuth2Client The OAuth2 client object
 * @returns {string} The authorization URL
 */
function generateAuthUrl(oAuth2Client) {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  return url;
}

/**
 * Exchanges authorization code for access and refresh tokens
 * (**This step should be handled on your server-side**)
 * @param {OAuth2Client} oAuth2Client The OAuth2 client object
 * @param {string} code The authorization code received from Google
 * @returns {Promise<object>} An object containing access and refresh tokens
 */
async function exchangeCodeForTokens(oAuth2Client, code) {
  const tokens = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * Creates a calendar event with reminder
 * @param {OAuth2Client} oAuth2Client The authorized OAuth2 client object
 * @param {string} title The event title
 * @param {string} description The event description
 * @param {string} startTime The start time of the event in ISO 8601 format (e.g., 2024-05-17T09:00:00Z)
 * @returns {Promise<object>} The created event object
 */
async function createReminder(oAuth2Client, title, description, startTime) {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: startTime,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 }, // Adjust minutes as needed
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary', // Replace with specific calendar ID if needed
    resource: event,
  });

  return response.data;
}

// Example usage (**requires user interaction for authorization**)
async function main() {
  const oAuth2Client = authorize();
  const authUrl = generateAuthUrl(oAuth2Client);

  // User needs to visit this URL and grant access to your application
  console.log('Open the following URL in your browser and grant access:');
  console.log(authUrl);

  // **Handle user authorization flow and retrieve authorization code**
  // (This part is omitted for brevity)

  // Replace 'authorizationCode' with the actual code received from Google
  const { tokens } = await exchangeCodeForTokens(oAuth2Client, 'authorizationCode');

  // Now you have the access token stored in 'tokens'

  const event = await createReminder(oAuth2Client, 'Buy Milk', 'Don\'t forget to buy milk!', new Date().toISOString());
  console.log('Event created:', event);
}

main().catch((error) => console.error(error));
