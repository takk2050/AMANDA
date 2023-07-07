const { BlazeClient } = require('mixin-node-sdk');
const config = require("./config");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: config.openai_key,
});
const openai = new OpenAIApi(configuration);

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

const RATE_LIMIT_DELAY = 25000; // Delay between API requests

client.loopBlaze({
  async onMessage(msg) {
    console.log(msg);
    if (msg.category === "PLAIN_TEXT") {
      const rawData = msg.data.toString();
      const lang = checkLanguage(rawData);
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
        client.sendMessageText(msg.user_id, "Only English is supported");
        return;
      }

      try {
        const returnEnData = await conversation(rawEnData); // English
        const returnZhData = await translate("english", returnEnData); // Chinese

        const rec = `>用户\n中文:${rawZhData}\n英文:${rawEnData}\n\>助手\n英文:${returnEnData}\n中文:${returnZhData}`;
        await delay(RATE_LIMIT_DELAY);
        await client.sendMessageText(msg.user_id, rec);
      } catch (error) {
        if (error.message.includes("Rate limit reached")) {
          console.log("Rate limit reached. Retrying after delay...");
          await delay(RATE_LIMIT_DELAY);
          return await this.onMessage(msg);
        } else {
          console.log("Error:", error.message);
          client.sendMessageText(msg.user_id, "An error occurred while processing your request.");
        }
      }
    } else {
      client.sendMessageText(msg.user_id, "Only text is supported");
    }
  },
  onAckReceipt() {},
});

function checkLanguage(text) {
  const firstCharCode = text.charCodeAt(0);
  if (firstCharCode >= 0x4e00 && firstCharCode <= 0x9fa5) {
    return "chinese";
  } else if (firstCharCode >= 0x00 && firstCharCode <= 0x7f) {
    return "english";
  } else {
    return "unknown";
  }
}

async function translate(lang, text) {
  if (lang === "chinese") {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant that transfers Chinese to English.' },
      { role: 'user', content: `Translate the following Chinese text to English: ${text}` }
    ];
    const completion = await createChatCompletion(messages);
    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content.replace(/^"(.*)"$/, '$1');
  }else if (lang === "english") {
        const messages = [
          { role: 'system', content: 'You are a helpful assistant that transfers English to Chinese.' },
          { role: 'user', content: `Translate the following English text to Chinese: ${text}` }
        ];
        const completion = await createChatCompletion(messages);
        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content.replace(/^"(.*)"$/, '$1');
      }
  }
  
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  async function conversation(text) {
    const messages = [
      { role: 'system', content: 'I want you to act as a spoken English teacher and improver. I will speak to you in English, and you will reply to me in English to practice my spoken English. Limit the reply to 150 words.I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply.' },
      { role: 'user', content: text }
    ];
    const completion = await createChatCompletion(messages);
    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content.replace(/^"(.*)"$/, '$1');
  }
  
  async function createChatCompletion(messages) {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    return completion.data;
  }
  
  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  