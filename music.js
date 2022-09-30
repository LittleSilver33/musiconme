var token;
var id;

window.onSpotifyWebPlaybackSDKReady = () => {
  // $.get({
  //   url: "https://musicsonofabitch.glitch.me/auth/token",
  //   complete: data => {
  //     token = data.responseText;
  //     console.log("token: " + token);
  //   }
  // });
  let params = new URL(document.location).searchParams;
  token = params.get("access_token");
  window.history.pushState({}, document.title, window.location.pathname);
  console.log("token = " + token);
  const player = new Spotify.Player({
    name: "Soon Co.",
    getOAuthToken: cb => {
      cb(token);
    },
    volume: 0.05
  });
  window.player = player;
  // Ready
  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    id = device_id;
  });
  player.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });
  player.addListener("initialization_error", ({ message }) => {
    console.error(message);
  });
  player.addListener("authentication_error", ({ message }) => {
    console.error(message);
  });
  player.addListener("account_error", ({ message }) => {
    console.error(message);
  });

  document.getElementById("togglePlay").onclick = function() {
    playRandTrack(getRandPlaylist());
  };

  player.connect();
};

function getRandPlaylist() {
  var playlist_id;
  let rand = Math.floor(Math.random() * 3); //gets random number from 0 - 10
  switch (rand) {
    case 0:
      playlist_id = "4pYcGMMjiqSst3Zw63apXe"; //happy playlist
      break;
    case 1:
      playlist_id = "3gEuz48FkAHADFlq8lR6vr"; //nostagia playlist
      break;
    case 2:
      playlist_id = "0kcfGv8YQjWlprT6VQkzTL"; //depression playlist
      break;
    case 3:
      playlist_id = "4ZfnGA7KRzov4LDGhhue57"; //gamer playlist
      break;
    default:
      console.log("Error: default case run on randPlaylist switch case");
      break;
  }
  return playlist_id;
}

async function playRandTrack(playlist_id) {
  let data = await fetch(
    "https://musiconme.glitch.me/api/playlist/" + playlist_id
  ) //does a get request on the playlist
    .then(data => {
      console.log("test");
      return data.text();
    });
  let rand2 = Math.floor(Math.random() * JSON.parse(data).tracks.items.length); 
  fetch("https://api.spotify.com/v1/me/player/play?device_id=" + id, {
    //this whole thing just plays a song
    mode: "cors",
    headers: {
      authorization: "Bearer " + token, //authorization token
      accept: "application/json"
    },
    body: JSON.stringify({
      context_uri: "spotify:playlist:" + playlist_id, //what playlist to play i hope
      offset: { position: rand2 } //what position in the playlist to play
    }),
    method: "PUT",
    credentials: "same-origin"
  });

  var song_length = JSON.parse(data).tracks.items[rand2].track.duration_ms;
  console.log(song_length)

  setTimeout(playRandTrack, song_length, playlist_id); //wait for the amount of time that a song lasts before running this function again
}
