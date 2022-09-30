const express = require("express");
const app = express();
var ipa = require("ip");
const fetch = require("node-fetch");
const SpotifyWebApi = require("spotify-web-api-node");
var access_token;
var refresh_token;
const getToken = async () => {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_ID + ":" + process.env.SPOTIFY_SECRET
        ).toString("base64")
    },
    body: "grant_type=client_credentials"
  });
  return await result.json().access_token;
};

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
  redirectUrl: "https://musiconme.glitch.me/music"
});

  spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log("The access token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"]);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body["access_token"]);
  },
  function(err) {
    console.log("Something went wrong when retrieving an access token", err);
  }
);
//aa
setInterval(() => {
  spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log("The access token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"]);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body["access_token"]);
  },
  function(err) {
    console.log("Something went wrong when retrieving an access token", err);
  }
);
}, 3600000)



//express **************************************************************************
app.use(express.static("public"));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

app.get("/login", function(req, res) {
  var scopes =
    "streaming user-read-email user-read-private user-modify-playback-state app-remote-control";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      process.env.SPOTIFY_ID +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent("https://musiconme.glitch.me/auth/code")
  );
});

var code;
app.get("/music", (req, res) => {
  res.sendFile(__dirname + "/public/music.html");
  // console.log("code: " + req.url.substring(12));
  code = req.url.substring(12);
});

app.get("/api/song/:id", (req, res) => {
  if (req.params.id) {
    spotifyApi.getAudioFeaturesForTrack(req.params.id).then(
      function(data) {
        res.send(data.body);
      },
      function(err) {
        console.log(err);
        res.status(500).json({ error: 500, cause: err.message });
      }
    );
  }
});

app.get("/api/playlist/:id", (req, res) => {
  if (req.params.id) {
    spotifyApi.getPlaylist(req.params.id).then(
      function(data) {
        res.send(data.body);
      },
      function(err) {
        console.log(err);
        res.status(500).json({ error: 500, cause: err.message });
      }
    );
  }
});
//gamers
app.get("/api/info/:id", (req, res) => {// useless
  if (req.params.id) {
    spotifyApi.getTrack(req.params.id).then(
      function(data) {
        // res.send("Track Name: " + data.body.name + "<br>Album Name: " + data.body.album.name);
        res.send(data.body);
      },
      function(err) {
        console.log(err);
        res.status(500).json({ error: 500, cause: err.message });
      }
    );
  }
});

app.get("/auth/code", (req, res) => {
  // res.send("gamer");

  console.log("/auth/code accessed");
  var auth = Buffer.from(
    process.env.SPOTIFY_ID + ":" + process.env.SPOTIFY_SECRET
  ).toString("base64");
  // console.log(req.query.code);
  const code = req.query.code;

  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "https://musiconme.glitch.me/auth/code"
    })
  })
    .then(async response => {
      // handle success
      const resp = await response.json();
      access_token = resp.access_token;
      refresh_token = resp.refresh_token;
      // console.log(resp);
      res.redirect("/music?access_token=" + access_token);
    })
    .catch(async error => {
      // handle error
      console.log(await error);
      res.redirect("/?error=auth");
    });
});

app.get("/auth/token", (req, res) => {
  res.send(access_token);
});
//gamer moment
// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
