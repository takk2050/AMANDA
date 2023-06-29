const { BlazeClient } = require("mixin-node-sdk");
const config = require("./config");

const client = new BlazeClient(
  {
    pin: config.pin,
    client_id: config.client_id,
    session_id: config.session_id,
    pin_token: config.pin_token,
    private_key: config.private_key,
  },
  { parse: true, syncAck: true }
);

client.loopBlaze({
  onMessage(msg){
    console.log (msg);
    const rawData = msg.data.toString();

    const lang = checkLanguage(rawData);

    rawZhData = "";
    rawEnData = "";

    if (lang === "chinese") {
      console.log("chinese");
      rawZhData = rawData; //中文
      rawEnData = translate(lang,rawData);//英文
    } else if (lang === "english") {
      console.log("english");
      rawEnData = rawData; //英文
      rawZhData = translate (lang,rawData);//中文
    } else if (lang === "unknown") {
      console.log("unknown");
      client.sendMessageText(
        msg.user_id,
       `Only English and Chinese are supported. \n仅支持英文或中文。`
      );
    }
    //处理收到的消息

    //处理返回的消息
    const returnZhData = "您好";//中文
    const returnEnData = "How are you."; //英文

    const rec = `> 用户\n中文：${rawZhData}\n英文：${rawEnData}\n\n< 助手\n中文：${returnZhData}\n英文：${returnEnData}`;
    client.sendMessageText(msg.user_id, rec);
  },
  onAckReceipt() {},
});

function checkLanguage(text) {
  //判断第一个字符的编码范围来确定语言
  const firstCharCode = text.charCodeAt(0);
  if (firstCharCode >= 0x4e00 && firstCharCode <= 0x9fa5) {
    return "chinese";
  } else if (firstCharCode >= 0x00 && firstCharCode <= 0x7f) {
    return "english";
  } else {
    //其他言语，暂不处理
    return "unknown";
  }
}

function translate(lang,text) {
  if (lang === "chinese") {
	  rec = "Hello" + text; //翻译
	} else if (lang === "english") {
	  rec = "你好" + text;//翻译
  }
  return rec;
}