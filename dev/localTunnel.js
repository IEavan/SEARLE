/**
 * Tunnel requests through a public facing IP for local development testing.
 */

const ngrok = require('ngrok');

ngrok.connect({
    proto: 'http', // http|tcp|tls
    addr: (process.env.PORT ? process.env.PORT : 3001), // port or network address
    region: 'us',
    authtoken: '7C8SsTK56HoxsDNmzLnoo_7kCczkpqSKtdmSF4xb6W6'
}, function (err, url) {
  console.log(`NGROK | ${err}`);
  console.log(`NGROK | Tunnel loaded. ${url}`);
});
