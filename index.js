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

client.loopBlaze({
  async onMessage(msg) {
    console.log(msg);
    const rawData = msg.data.toString();
    const lang = await checkLanguage(rawData);
    let rawZhData = "";
    let rawEnData = "";

    if (lang === "chinese") {
      console.log("chinese");
      rawZhData = rawData;
      rawEnData = await translate(lang, rawData);
    } else if (lang === "english") {
      console.log("english");
      rawEnData = rawData;
      rawZhData = await translate(lang, rawData);
    } else if (lang === "unknown") {
      console.log("unknown");
      client.sendMessageText(msg.user_id, `Only English`);
    }

    const returnZhData = "您好";
    const returnEnData = "How are you";
    const rec = `>用户\n中文:${rawZhData}\n英文:${rawEnData}\n\n>助手\n中文:${returnZhData}\n英文:${returnEnData}`;

    await client.sendMessageText(msg.user_id, rec);
  },
  onAckReceipt() { }
});

function checkLanguage(text) {
  const firstCharCode = text.charCodeAt(0);
  let rec;
  if (firstCharCode >= 0x4e00 && firstCharCode <= 0x9fa5) {
    rec = "chinese";
  } else if (firstCharCode >= 0x00 && firstCharCode <= 0x7f) {
    rec = "english";
  } else {
    rec = "unknown";
  }
  console.log("checkLanguage(text)", rec);
  return rec;
}

async function translate(lang, text) {
  if (lang === "chinese") {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { "role": "system", "content": "You are a helpful assistant that transfers Chinese to English." },
        { "role": "user", "content": `Translate the following Chinese text to English: ${text}` },
      ],
    });

    console.log(completion.data.choices[0].message.content);
    return completion.data.choices[0].message.content;
  } else if (lang === "english") {
    const rec = "Hello " + text;
    return rec;
  }
}

function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}

function test() {
  console.log('111');
  sleep(2000);
  console.log('222');
}

test()




