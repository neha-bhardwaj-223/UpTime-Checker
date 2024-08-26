import express, { json } from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
const port = process.env.PORT || 8080;

app.use(
  express.urlencoded({
    extended: true,
  })
);

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

async function fetchURLStatus(urlJSON, linksData, callback) {
  var id, ssl, statusCode, statusText;
  let i = 0;
  const date = new Date().toLocaleString("en-US", { timeZone: 'Asia/Kolkata' });
  var jsonString = {};
  urlJSON = JSON.parse(urlJSON);
  // for (let pos in urlJSON) {
  //   // console.log(urlJSON[`${pos}`])
  //   console.log(typeof (pos))
  // }
  for (let urlLink in urlJSON) {
    if (isValidHttpUrl(urlLink)) {
      await fetch(urlLink, { method: "GET" })
        .then((res) => {
          id = urlLink;
          ssl = "OK";
          statusCode = res.status;
          statusText = res.statusText;
          if (statusCode === 404) {
            ssl = "Not Found";
          }
        })
        .catch((error) => {

          if (error.code === 'CERT_INVALID') {
            ssl = "Invalid";
          }
          else if (error.code === 'CERT_HAS_EXPIRED') {
            ssl = "Expired";
          }
          id = urlLink;
          statusCode = "Invalid URL";
          statusText = "Invalid / Not Found";
        });
      jsonString = {
        ...jsonString,
        [id]: {
          ssl: ssl,
          status: statusCode,
          statusText: statusText,
          date: date,
          category: urlJSON[`${urlLink}`].category,
          title: urlJSON[`${urlLink}`].title
        },
      };
    }
  }

  saveOutput(jsonString);
  callback(linksData);
}

function saveOutput(jsonString) {
  fs.writeFile("result.json", JSON.stringify(jsonString), function (err) {
    if (err) throw err;
    console.log("File Saved");
  });
}

const readData = async (callback) => {
  var linksData = "",
    listOfLinks = "";
  try {
    console.log(5);
    let rawdata = fs.readFileSync("result.json");
    linksData = JSON.parse(rawdata) || "";
  } catch (err) {
    linksData = "";
    console.log("File not found or insufficient read/write permissions");
  } finally {
    await fs.readFile("listOfLinks.json", "utf8", function (err, data) {
      if (err) throw err;
      listOfLinks = data;
      // console.log(typeof (listOfLinks))
      console.log(4);
      callback(listOfLinks, linksData);
    });
  }
  console.log(2);
  console.log(listOfLinks)
};

app.post("/read", (req, res) => {
  // console.log("HEHE");
  const callbackNo2 = (linksData) => {
    console.log(3);

    res.send(linksData);
    res.end();
  };
  const callback = (listOfLinks, linksData) => {
    console.log(1);
    fetchURLStatus(listOfLinks, linksData, callbackNo2);
  };
  readData(callback);
});
app.get("/", function (req, res) {
  // res.send('<script>window.location.replace("./read");</script>');
  res.sendFile("index.html", { root: "." });
});
app.use(express.static("./"));
app.listen(port);
console.log("Server started at http://localhost:" + port);
