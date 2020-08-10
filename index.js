const readLine = require("readLine-sync");
const robots = {
  // input: require("./robots/input.js"),
  // text: require("./robots/text.js"),
  state: require("./robots/state.js"),
  image: require("./robots/image.js"),
  image_bing: require("./robots/image_bing.js"),
  image_pinterest: require("./robots/image_pinterest.js"),
};
async function start() {
  const prefixes = ["google", "bing", "pinterest"];
  const selectPrefixIndex = readLine.keyInSelect(
    prefixes,
    "Escolhe uma Opcao:"
  );
  switch (selectPrefixIndex) {
    case 0:
      await robots.image();
      break;
    case 1:
      await robots.image_bing();
      break;
    case 2:
      await robots.image_pinterest();
      break;
  }
  //  robots.input();
  //  await robots.text();

  const content = robots.state.load();
  //console.dir(content, { depth: null });
}
start();
