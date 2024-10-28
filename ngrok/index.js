const ngrok = require("ngrok");
const fs = require("fs");
const PORT = 3000;

const startNgrok = async () => {
  // start ngrok tunnel and write the url to the backend .env to bind the backend server with this tunnel

  const url = await ngrok.connect(PORT);
  const URL = `URL=${url}`;

  if (!fs.existsSync("../backend/.env")) fs.writeFileSync("../backend/.env", "");

  const variables = fs.readFileSync("../backend/.env").toString();
  const varArr = variables.split("\n");
  let flag = false;
  const resArr = [];
  for (let i = 0; i < varArr.length; i++) {
    let element = varArr[i];
    if (element.startsWith("URL")) {
      element = URL;
      flag = true;
    }
    if (element) resArr.push(element);
  }

  if (!flag) resArr.push(URL);

  const envVariable = resArr.join("\n");
  fs.writeFileSync("../backend/.env", envVariable);
  console.log(`Ngrok tunnel ---> ${url} to port: ${PORT}`);
};

startNgrok();
