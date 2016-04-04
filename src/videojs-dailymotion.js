/**
 * @file Dailymotion.js
 * Dailymotion Media Controller - Wrapper for HTML5 Media API
 */
import videojs from 'video.js';

const Component = videojs.getComponent('Component');
const Tech = videojs.getComponent('Tech');

/**
 * Dailymotion Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Dailymotion
 */

class Dailymotion extends Tech {
  constructor(options, ready) {
    super(options, ready);

    this.params = {
      id: this.options_.techId,
      autoplay: (this.player_.options_.autoplay) ? 1 : 0,
      chromeless: (this.player_.options_.dmControls) ? 0 : 1,
      html: 1,
      info: 1,
      logo: 1,
      controls: 'html',
      wmode: 'opaque',
      format: 'json',
      url: options.source.src
    };

    // If we are not on a server, don't specify the origin (it will crash)
    if (window.location.protocol !== 'file:') {
      this.params.origin = window.location.protocol + '//' + window.location.hostname;
    }

    this.videoId = this.parseSrc(options.source.src);

    if (typeof this.videoId !== 'undefined') {
      this.setTimeout(() => {
        this.setPoster('//api.dailymotion.com/video/' + this.videoId + '?fields=poster_url&ads=false');
      }, 100);
    }

    if (Dailymotion.isApiReady) {
      this.loadApi();
    } else {
      // Add to the queue because the Dailymotion API is not ready
      Dailymotion.apiReadyQueue.push(this);
    }

  }

  createEl() {

    let el = videojs.createEl('iframe', {
      id: this.options_.techId,
      className: 'vjs-tech vjs-tech-dailymotion'
    });

    let iframeContainer = videojs.createEl('iframe', {
      scrolling: 'no',
      marginWidth: 0,
      marginHeight: 0,
      frameBorder: 0,
      webkitAllowFullScreen: '',
      mozallowfullscreen: '',
      allowFullScreen: '',
    });

    el.appendChild(iframeContainer);

    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || !/(iPad|iPhone|iPod|Android)/g.test(navigator.userAgent)) {
      let divBlocker = videojs.createEl('div',
        {
          className: 'vjs-iframe-blocker',
          style: 'position:absolute;top:0;left:0;width:100%;height:100%'
        });

      // In case the blocker is still there and we want to pause
      divBlocker.onclick = function () {
        this.pause();
      }.bind(this);

      el.appendChild(divBlocker);
    }

    return el;
  }

  loadApi() {
    this.dmPlayer = new DM.player(this.options_.techId, {
      video: this.videoId,
      width: this.options_.width,
      height: this.options_.height,
      params: this.params
    });

    this.setupTriggers();

    this.dmPlayer.vjsTech = this;
  }

  parseSrc(src) {
    if (src) {
      // Regex that parse the video ID for any Dailymotion URL
      var regExp = /^.+dailymotion.com\/((video|hub)\/([^_]+))?[^#]*(#video=([^_&]+))?/;
      var match = src.match(regExp);

      return match ? match[5] || match[3] : null;
    }
  }

  setupTriggers() {
    this.dmPlayer.listeners = [];
    for (var i = Dailymotion.Events.length - 1; i >= 0; i--) {
      //videojs.on(this.dmPlayer, Dailymotion.Events[i], videojs.bind(this, this.eventHandler));
      var listener = videojs.bind(this, this.eventHandler);
      this.dmPlayer.listeners.push({event: Dailymotion.Events[i], func: listener});
      this.dmPlayer.addEventListener(Dailymotion.Events[i], listener);
    }
  }

  eventHandler(e) {
    this.onStateChange(e);
    this.trigger(e);
  }

  onStateChange(event) {
    let state = event.type;
    if (state !== this.lastState) {
      switch (state) {
        case -1:
          break;

        case 'apiready':
          this.triggerReady();
          break;

        case 'video_end':
          this.trigger('ended');
          break;

        case 'ad_play':
          this.trigger('play');
          break;

        case 'video_start':
        case 'ad_start':
          this.trigger('playing');
          this.trigger('play');
          break;

        case 'play':
          break;

        case 'playing':
          break;

        case 'pause':
          break;
        case 'durationchange':
          break;

        case 'timeupdate':
          break;
        case 'progress':
          break;

      }

      this.lastState = state;
    }
  }

  poster() {
    return this.poster_;
  }

  setPoster(poster) {
    this.poster_ = poster;
    this.trigger('posterchange');
  }

  /**
   * Set video
   *
   * @param {Object=} src Source object
   * @method setSrc
   */
  src(src) {
    if (typeof src !== 'undefined') {
      this.src_ = this.parseSrc(src);
      this.dmPlayer.load(this.src_);
    }
    return this.src_;
  }

  currentSrc() {
    return this.src_;
  }

  play() {
    if (this.isReady_) {
      this.dmPlayer.play();
    } else {
      if (!this.player_.options_.dmControls) {
        // Keep the big play button until it plays for real
        this.player_.bigPlayButton.show();
      }
    }
  }

  ended() {

    if (this.isReady_) {
      var stateId = this.dmPlayer.getPlayerState();
      return stateId === 0;
    } else {
      // We will play it when the API will be ready
      return false;
    }
  }

  pause() {
    this.dmPlayer.pause(!this.dmPlayer.paused);
  }

  paused() {
    return this.dmPlayer.paused;
  }

  currentTime() {
    return (this.dmPlayer && this.dmPlayer.currentTime) ? this.dmPlayer.currentTime : 0;
  }

  setCurrentTime(position) {
    this.dmPlayer.seek(position);
  }

  duration() {
    return (this.dmPlayer && this.dmPlayer.duration) ? this.dmPlayer.duration : 0;
  }

  volume() {
    if (isNaN(this.volume_)) {
      this.volume_ = this.dmPlayer.volume;
    }

    return this.volume_;
  }

  /**
   * Request to enter fullscreen
   *
   * @method enterFullScreen
   */
  enterFullScreen() {
    this.dmPlayer.setFullscreen(true);
  }

  /**
   * Request to exit fullscreen
   *
   * @method exitFullScreen
   */
  exitFullScreen() {
    this.dmPlayer.setFullscreen(false);
  }


  setVolume(percentAsDecimal) {
    if (typeof(percentAsDecimal) !== 'undefined' && percentAsDecimal !== this.volume_) {
      this.dmPlayer.setVolume(percentAsDecimal);
      this.volume_ = percentAsDecimal;
      this.player_.trigger('volumechange');
    }
  }

  buffered() {
    return [];
  }

  controls() {
    return false;
  }

  muted() {
    return this.dmPlayer.muted;
  }

  setMuted(muted) {
    this.dmPlayer.setMuted(muted);

    this.setTimeout(function () {
      this.player_.trigger('volumechange');
    });
  }

  supportsFullScreen() {
    return true;
  }


  resetSrc_(callback) {
    callback();
  }

  dispose() {
    this.resetSrc_(Function.prototype);
    super.dispose(this);
  }

}

Dailymotion.prototype.options_ = {};

Dailymotion.apiReadyQueue = [];

Dailymotion.makeQueryString = function (args) {
  let querys = [];
  for (var key in args) {
    if (args.hasOwnProperty(key)) {
      querys.push(encodeURIComponent(key) + '=' + encodeURIComponent(args[key]));
    }
  }

  return querys.join('&');
};

const injectJs = function () {
  let tag = document.createElement('script');
  tag.src = '//api.dmcdn.net/all.js';
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

/* Dailymotion Support Testing -------------------------------------------------------- */

Dailymotion.isSupported = function () {
  return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Dailymotion);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Dailymotion.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Dailymotion.nativeSourceHandler.canPlayType = function (source) {

  const dashExtRE = /^video\/(dailymotion)/i;

  if (dashExtRE.test(source)) {
    return 'maybe';
  } else {
    return '';
  }

};

/*
 * Check Flash can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Dailymotion.nativeSourceHandler.canHandleSource = function (source) {

  // If a type was provided we should rely on that
  if (source.type) {
    return Dailymotion.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return Dailymotion.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

/*
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 *
 * @param  {Object} source    The source object
 * @param  {Flash} tech   The instance of the Flash tech
 */
Dailymotion.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Dailymotion.nativeSourceHandler.dispose = function () {
};

// Register the native source handler
Dailymotion.registerSourceHandler(Dailymotion.nativeSourceHandler);


/*
 * Set the tech's volume control support status
 *
 * @type {Boolean}
 */
Dailymotion.prototype['featuresVolumeControl'] = true;

/*
 * Set the tech's playbackRate support status
 *
 * @type {Boolean}
 */
Dailymotion.prototype['featuresPlaybackRate'] = false;

/*
 * Set the tech's status on moving the video element.
 * In iOS, if you move a video element in the DOM, it breaks video playback.
 *
 * @type {Boolean}
 */
Dailymotion.prototype['movingMediaElementInDOM'] = false;

/*
 * Set the the tech's fullscreen resize support status.
 * HTML video is able to automatically resize when going to fullscreen.
 * (No longer appears to be used. Can probably be removed.)
 */
Dailymotion.prototype['featuresFullscreenResize'] = false;

/*
 * Set the tech's timeupdate event support status
 * (this disables the manual timeupdate events of the Tech)
 */
Dailymotion.prototype['featuresTimeupdateEvents'] = false;

/*
 * Set the tech's progress event support status
 * (this disables the manual progress events of the Tech)
 */
Dailymotion.prototype['featuresProgressEvents'] = false;

/*
 * Sets the tech's status on native text track support
 *
 * @type {Boolean}
 */
Dailymotion.prototype['featuresNativeTextTracks'] = true;

/*
 * Sets the tech's status on native audio track support
 *
 * @type {Boolean}
 */
Dailymotion.prototype['featuresNativeAudioTracks'] = true;

/*
 * Sets the tech's status on native video track support
 *
 * @type {Boolean}
 */
Dailymotion.prototype['featuresNativeVideoTracks'] = false;

Dailymotion.Events = 'apiready,ad_play,ad_start,ad_timeupdate,ad_pause,ad_end,video_start,video_end,play,playing,pause,ended,canplay,canplaythrough,timeupdate,progress,seeking,seeked,volumechange,durationchange,fullscreenchange,error'.split(',');

videojs.options.Dailymotion = {};

Component.registerComponent('Dailymotion', Dailymotion);
Tech.registerTech('Dailymotion', Dailymotion);

injectJs();

// Called when Dailymotion API is ready to be used
window.dmAsyncInit = function () {
  var dm;
  while ((dm = Dailymotion.apiReadyQueue.shift())) {
    dm.loadApi();
  }
  Dailymotion.apiReadyQueue = [];
  Dailymotion.isApiReady = true;
};

export default Dailymotion;
