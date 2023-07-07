//function checkLanguage(text) {
    //const firstCharCode = text.charCodeAt(0);
   // let rec;
    //if (firstCharCode >= 0x4e00 && firstCharCode <= 0x9fa5) {
   //   rec = "chinese";
    //} else if (firstCharCode >= 0x00 && firstCharCode <= 0x7f) {
   //   rec = "english";
    //} else {
   //   rec = "unknown";
   // }
  //  console.log("checkLanguage(text)",rec);
   // return rec;
//}
//console.log(checkLanguage("你好"))


const { BlazeClient } = require('mixin-node-sdk');
const config = require("./config")
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: config.openai_key,
});
const openai = new OpenAIApi(configuration)
const client = new BlazeClient(
  {
    "pin": config.pin,
    "client_id": config.client_id,
    "session_id": config.session_id,
    "pin_token": config.pin_token,
    "private_key": config.private_key,
  },
  { parse: true, syncAck: true }
);

async function conversation(text) {
  const messages = [
    { "role": "system", "content": "I want you to act as a spoken English teacher and improver. I will speak to you in English, and you will reply to me in English to practice my spoken English. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply." },
    { "role": "user", "content": text },
  ];

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  console.log(completion.data.choices[0].message.content);
  return completion.data.choices[0].message.content.replace(/^"(.*)"$/, '$1');
}

conversation("Hello, do you like movies?"); // Call the function with a text argument
