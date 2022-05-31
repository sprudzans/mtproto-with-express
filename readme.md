Simple example for working with [Telegram's API methods](https://core.telegram.org/methods)  

Used library:

- [mtproto-core](https://mtproto-core.js.org/)
- [express](https://github.com/expressjs/expressjs.com)

Request examples:

POST https://localhost:3000/
Content-Type: application/json

{
  "client": "ID",
  "method": "help.getCountriesList",
  "params": {
    "lang_code": "en"
  }
}

POST https://localhost:3000/
Content-Type: application/json

{
  "client": "ID",
  "method": "auth.sendCode",
  "params": {
    "phone_number": "+79999999999",
    "settings": {
        "_": "codeSettings"
     }
  }
}
