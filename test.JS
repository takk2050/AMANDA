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
    console.log("checkLanguage(text)",rec);
    return rec;
}
console.log(checkLanguage("你好"))