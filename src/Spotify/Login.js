export default {
  logInWithSpotify: (() => {
    let client_id      = "a5e9439fc1e44fd79f7f2ff00c6a0bc2";
    let redirect_uri   = "https://localhost:3000";
    let scopes         = "streaming user-read-birthdate user-read-email user-read-private user-modify-playback-state";
    let scopes_encoded = scopes.replace(" ", "%20");

    window.location = [
      "https://accounts.spotify.com/authorize",
      `?client_id=${client_id}`,
      `&redirect_uri=${redirect_uri}`,
      `&scope=${scopes_encoded}`,
      "&response_type=code",
      "&show_dialog=true"
    ].join('');
  })
};