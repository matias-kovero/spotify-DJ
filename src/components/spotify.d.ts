declare interface Markets {
  market: string
}

declare interface ExternalUrl {
  /**
   * The [Spotify URL](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the object.
   */
  spotify: String
}

declare interface ImageObject {
  /**
   * The image height in pixels. If unknown: null or not returned.
   */
  height: Number,
  /**
   * 	The source URL of the image.
   */
  url: String,
  /**
   * The image width in pixels. If unknown: null or not returned.
   */
  width: Number
}

declare interface AlbumObject {
  /**
   * The field is present when getting an artist’s albums.  
   * Possible values are “album”, “single”, “compilation”,  
   * “appears_on”. Compare to album_type this field represents  
   * relationship between the artist and the album.
   */
  album_group?: String,
  /**
   * The type of the album: one of “album”, “single”, or  
   * “compilation”.
   */
  album_type: String,
  /**
   * The artists of the album. Each artist object includes a link  
   * in `href` to more detailed information about the artist.
   */
  artists: ArtistObject[],
  /**
   * The markets in which the album is available: ISO 3166-1  
   * alpha-2 country codes. Note that an album is considered  
   * available in a market when at least 1 of its tracks is  
   * available in that market.
   */
  available_markets: String[],
  /**
   * Known external URLs for this album.
   */
  external_urls: ExternalUrl
  /**
   * A link to the Web API endpoint providing full details of the  
   * album.
   */
  href: String,
  /**
   * The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the album.
   */
  id: String,
  /**
   * The cover art for the album in various sizes, widest first.
   */
  images: ImageObject[],
  /**
   * The name of the album. In case of an album takedown, the value may be an empty string.
   */
  name: String,
  /**
   * The date the album was first released, for example 1981.  
   * Depending on the precision, it might be shown as `1981-`  
   * `12` or `1981-12-15`.
   */
  release_date: String,
  /**
   * The precision with which release_date value is known:  
   * `year` , `month` , or `day`.
   */
  release_date_precision: String,
  /**
   * The object type: "album"
   */
  type: String,
  /**
   * The [Spotify URI](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the album.
   */
  uri: String,
}

declare interface ArtistObject {
  /**
   * Known external URLs for this artist.
   */
  external_urls: ExternalUrl,
  /**
   * A link to the Web API endpoint providing full details of the artist.
   */
  href: String,
  /**
   * The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the artist.
   */
  id: String,
  /**
   * The name of the artist.
   */
  name: String,
  /**
   * The object type: "artist"
   */
  type: String,
  /**
   * The [Spotify URI](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the artist.
   */
  uri: String,
}

declare interface TrackObject {
  /**
   * The album on which the track appears. The album object includes  
   * a link in href to full information about the album.
   */
  album: AlbumObject,
  /**
   * The artists who performed the track. Each artist object includes  
   * a link in href to more detailed information about the artist.
   */
  artists: ArtistObject[],
  /**
   * A list of the countries in which the track can be played,  
   * identified by their ISO 3166-1 alpha-2 code.
   */
  available_markets: String[],
  /**
   * The disc number (usually `1` unless the album consists of more  
   * than one disc).
   */
  disc_number: Number,
  /**
   * The track length in milliseconds.
   */
  duration_ms: Number,
  /**
   * Whether or not the track has explicit lyrics (`true` = yes it does;  
   * `false` = no it does not OR unknown).
   */
  explicit: Boolean,
  /**
   * Known external IDs for the track.
   */
  external_ids: {
    /**
     * [International Standard Recording Code](http://en.wikipedia.org/wiki/International_Standard_Recording_Code)
     */
    isrc: String,
    ean: String,
    upc: String,
  },
  /**
   * Known external URLs for this track.
   */
  external_urls: ExternalUrl,
  /**
   * A link to the Web API endpoint providing full details of the track.
   */
  href: String,
  /**
   * The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the track.
   */
  id: String,
  /**
   * Whether or not the track is from a local file.
   */
  is_local: Boolean,
  /**
   * Part of the response when Track Relinking is applied.
   * If `true`, the track is playable in the given market. Otherwise `false`.
   */
  is_playable: Boolean,
  /**
   * The name of the track.
   */
  name: String,
  /**
   * The popularity of the track.  
   * The value will be between 0 and 100, with 100 being the most popular.
   */
  popularity: Number,
  /**
   * The number of the track. If an album has several discs, the track  
   * number is the number on the specific disc.
   */
  track_number: Number,
  /**
   * The object type: "track".
   */
  type: String,
  /**
   * The [Spotify URI](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the track.
   */
  uri: String
}

declare interface AudioAnalysisObject {
  duration: Number,
  sample_md5: String,
  offset_secons: Number,
  window_seconds: Number,
  analysis_sample_rate: Number,
  analysis_channels: Number,
  end_of_fade_in: Number,
  start_of_fade_out: Number,
  loudness: Number,
  tempo: Number,
  tempo_confidence: Number,
  time_signature: Number,
  time_signature_confidence: Number,
  key: Number,
  key_confidence: Number,
  mode: Number,
  mode_confidence: Number,
  codestring: String,
  code_version: Number,
  echoprintstring: String,
  echoprint_version: Number,
  synchstring: String,
  synch_version: Number,
  rhytmstring: String,
  rhythm_version: Number
}

declare interface AudioFeatures {
  duration_ms: String,
  key: Number,
  mode: Number,
  time_signature: Number,
  acousticness: Number,
  danceability: Number,
  energy: Number,
  instrumentalness: Number,
  liveness: Number,
  loudness: Number,
  speechiness: Number,
  valence: Number,
  tempo: Number,
  id: String,
  uri: String,
  track_href: String,
  analysis_url: String,
  type: String
}