/* global videojs, DM */
/**
 * @fileoverview Dailymotion Media Controller - Wrapper for Dailymotion Media API
 */


(function () {
  /**
   * Dailymotion Media Controller - Wrapper for Dailymotion Media API
   * @param {videojs.Player|Object} player
   * @param {Object=} options
   * @param {Function=} ready
   * @constructor
   */

  function addEventListener(element, event, cb) {
    if (!element.addEventListener) {
      element.attachEvent(event, cb);
    } else {
      element.addEventListener(event, cb, true);
    }
  }

  videojs.Dailymotion = videojs.MediaTechController.extend({
    /** @constructor */
    init: function (player, options, ready) {
      videojs.MediaTechController.call(this, player, options, ready);

      this.player_ = player;
      this.playerEl_ = this.player_.el();

      if (typeof this.player_.options().dmControls !== 'undefined') {
        var dmC = this.player_.options().dmControls = parseInt(this.player_.options().dmControls) &&
        this.player_.controls();

        if (dmC && this.player_.controls()) {
          this.player_.controls(!dmC);
        }
      }


      // Copy the Javascript options if they exist
      if (typeof options.source !== 'undefined') {
        for (var key in options.source) {
          if (options['source'].hasOwnProperty(key)) {
            this.player_.options()[key] = options.source[key];
          }
        }
      }

      var self = this;


      this.bindedWaiting = function () {
        self.onWaiting();
      };
      this.player_.on('waiting', this.bindedWaiting);

      player.ready(function () {
        if (self.playOnReady && !self.player_.options()['dmControls']) {
          if (typeof self.player_.loadingSpinner !== 'undefined') {
            self.player_.loadingSpinner.show();
          }
          if (typeof self.player_.bigPlayButton !== 'undefined') {
            self.player_.bigPlayButton.hide();
          }
        }

        player.trigger('loadstart');
      });

      this.videoId = this.parseSrc(this.player_.options().src);

      if (typeof this.videoId !== 'undefined') {
        // Show the Dailymotion poster only if we don't use Dailymotion poster
        // (otherwise the controls pop, it's not nice)
        if (!this.player_.options().dmControls) {
          // Set the Dailymotion poster only if none is specified
          if (typeof this.player_.poster() === 'undefined') {
            // Don't use player.poster(), it will fail here because the tech is still null in constructor
            this.player_.poster();
            // Cover the entire iframe to have the same poster than Dailymotion
            // Doesn't exist right away because the DOM hasn't created it
            setTimeout(function () {
              var posterEl = self.playerEl_.querySelectorAll('.vjs-poster')[0];
              posterEl.style.backgroundImage = 'url(https://api.dailymotion.com/video/' + self.videoId + '?fields=url&ads=false)';
              posterEl.style.display = '';
              posterEl.style.backgroundSize = 'cover';
            }, 100);
          }
        }
      }

      this.id_ = this.player_.id() + '_dailymotion_api';

      this.el_ = videojs.Component.prototype.createEl('iframe', {
        id: this.id_,
        className: 'vjs-tech',
        scrolling: 'no',
        marginWidth: 0,
        marginHeight: 0,
        frameBorder: 0,
        webkitAllowFullScreen: '',
        mozallowfullscreen: '',
        allowFullScreen: ''
      });

      this.playerEl_.insertBefore(this.el_, this.playerEl_.firstChild);

      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var ieVersion = Number(RegExp.$1);
        this.addIframeBlocker(ieVersion);
      } else if (!/(iPad|iPhone|iPod|Android)/g.test(navigator.userAgent)) {
        // the pointer-events: none block the mobile player
        this.el_.className += ' onDesktop';
        this.addIframeBlocker();
      }

      this.params = {
        id: this.id_,
        autoplay: (this.player_.options().autoplay) ? 1 : 0,
        chromeless: (this.player_.options().dmControls) ? 0 : 1,
        html: 1,
        info: 1,
        logo: 1,
        controls: 'html',
        wmode: 'opaque',
        format: 'json',
        url: this.player_.options().src
      };

      if (typeof this.params.list === 'undefined') {
        delete this.params.list;
      }

      // Make autoplay work for iOS
      if (this.player_.options().autoplay) {
        this.player_.bigPlayButton.hide();
        this.playOnReady = true;
      }

      // If we are not on a server, don't specify the origin (it will crash)
      if (window.location.protocol !== 'file:') {
        this.params.origin = window.location.protocol + '//' + window.location.hostname;
      }


      this.el_.src = 'http://www.dailymotion.com/services/oembed?' + videojs.Dailymotion.makeQueryString(this.params);

      if (videojs.Dailymotion.apiReady) {
        this.loadApi();
      } else {
        // Add to the queue because the Dailymotion API is not ready
        videojs.Dailymotion.loadingQueue.push(this);

        // Load the Dailymotion API if it is the first Dailymotion video
        if (!videojs.Dailymotion.apiLoading) {
          var tag = document.createElement('script');
          tag.onerror = function (e) {
            self.onError(e);
          };
          tag.src = 'http://api.dmcdn.net/all.js';
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          videojs.Dailymotion.apiLoading = true;
        }
      }

    }
  });

  videojs.Dailymotion.prototype.params = [];


  videojs.Dailymotion.prototype.onWaiting = function (/*e*/) {
    // Make sure to hide the play button while the spinner is there
    if (typeof this.player_.bigPlayButton !== 'undefined') {
      this.player_.bigPlayButton.hide();
    }
  };

  videojs.Dailymotion.prototype.addIframeBlocker = function (ieVersion) {

    if (this.player_.options().dmControls) {
      return false;
    }

    this.iframeblocker = videojs.Component.prototype.createEl('div');

    this.iframeblocker.className = 'iframeblocker';

    this.iframeblocker.style.position = 'absolute';
    this.iframeblocker.style.left = 0;
    this.iframeblocker.style.right = 0;
    this.iframeblocker.style.top = 0;
    this.iframeblocker.style.bottom = 0;

    // Odd quirk for IE8 (doesn't support rgba)
    if (ieVersion && ieVersion < 9) {
      this.iframeblocker.style.opacity = 0.01;
    } else {
      this.iframeblocker.style.background = 'rgba(255, 255, 255, 0.01)';
    }

    var self = this;

    addEventListener(this.iframeblocker, 'mousemove', function (e) {
      if (!self.player_.userActive()) {
        self.player_.userActive(true);
      }

      e.stopPropagation();
      e.preventDefault();
    });

    addEventListener(this.iframeblocker, 'click', function (/*e*/) {
      if (self.paused()) {
        self.play();
      } else {
        self.pause();
      }
    });

    this.playerEl_.insertBefore(this.iframeblocker, this.el_.nextSibling);
  };

  videojs.Dailymotion.prototype.dispose = function () {
    if (this.dmPlayer) {
      this.pause();
      for (var i = 0; i < this.dmPlayer.listeners.length; i++) {
        var listener = this.dmPlayer.listeners[i];
        this.dmPlayer.removeEventListener(listener.event, listener.func);
      }
      this.dmPlayer = null;
    }

    // Remove the poster
    this.playerEl_.querySelectorAll('.vjs-poster')[0].style.backgroundImage = 'none';

    // If still connected to the DOM, remove it.
    var el = document.getElementById(this.id_);
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }

    if (typeof this.player_.loadingSpinner !== 'undefined') {
      this.player_.loadingSpinner.hide();
    }
    if (typeof this.player_.bigPlayButton !== 'undefined') {
      this.player_.bigPlayButton.hide();
    }

    videojs.MediaTechController.prototype.dispose.call(this);
  };

  videojs.Dailymotion.prototype.src = function (src) {
    if (typeof src !== 'undefined') {
      this.dmPlayer.load(this.parseSrc(src));
    }
    return this.srcVal;
  };

  videojs.Dailymotion.prototype.currentSrc = function () {
    return this.srcVal;
  };

  videojs.Dailymotion.prototype.play = function () {
    if (this.isReady_) {
      this.dmPlayer.play();
    } else {
      // We will play it when the API will be ready
      this.playOnReady = true;

      if (!this.player_.options.dmControls) {
        // Keep the big play button until it plays for real
        this.player_.bigPlayButton.show();
      }
    }
  };

  videojs.Dailymotion.prototype.ended = function () {

    if (this.isReady_) {
      var stateId = this.dmPlayer.getPlayerState();
      return stateId === 0;
    } else {
      // We will play it when the API will be ready
      return false;
    }
  };

  videojs.Dailymotion.prototype.pause = function () {
    this.dmPlayer.pause(!this.dmPlayer.paused);
  };

  videojs.Dailymotion.prototype.paused = function () {
    return this.dmPlayer.paused;
  };

  videojs.Dailymotion.prototype.currentTime = function () {
    return (this.dmPlayer && this.dmPlayer.currentTime) ? this.dmPlayer.currentTime : 0;
  };

  videojs.Dailymotion.prototype.setCurrentTime = function (seconds) {
    this.dmPlayer.seek(seconds, true);
    this.player_.trigger('timeupdate');
  };

  videojs.Dailymotion.prototype.duration = function () {
    return (this.dmPlayer && this.dmPlayer.duration) ? this.dmPlayer.duration : 0;
  };

  videojs.Dailymotion.prototype.buffered = function () {
    /*var loadedBytes = this.dmPlayer.getVideoBytesLoaded();
     var totalBytes = this.dmPlayer.getVideoBytesTotal();
     if (!loadedBytes || !totalBytes) return 0;

     var duration = this.dmPlayer.getDuration();
     var secondsBuffered = (loadedBytes / totalBytes) * duration;
     var secondsOffset = (this.dmPlayer.getCurrentTime() / totalBytes) * duration;
     return videojs.createTimeRange(secondsOffset, secondsOffset + secondsBuffered);*/
    return [];
  };

  videojs.Dailymotion.prototype.volume = function () {
    if (isNaN(this.volumeVal)) {
      this.volumeVal = this.dmPlayer.volume;
    }

    return this.volumeVal;
  };

  videojs.Dailymotion.prototype.setVolume = function (percentAsDecimal) {
    if (typeof(percentAsDecimal) !== 'undefined' && percentAsDecimal !== this.volumeVal) {
      this.dmPlayer.setVolume(percentAsDecimal);
      this.volumeVal = percentAsDecimal;
      this.player_.trigger('volumechange');
    }
  };

  videojs.Dailymotion.prototype.muted = function () {
    return this.dmPlayer.muted;
  };
  videojs.Dailymotion.prototype.setMuted = function (muted) {
    this.dmPlayer.setMuted(muted);

    var self = this;
    setTimeout(function () {
      self.player_.trigger('volumechange');
    }, 50);
  };

  videojs.Dailymotion.prototype.onReady = function () {
    this.isReady_ = true;
    this.player_.trigger('techready');

    // Hide the poster when ready because Dailymotion has it's own
    this.triggerReady();
    this.player_.trigger('durationchange');

    // Play right away if we clicked before ready
    if (this.playOnReady) {
      this.dmPlayer.play();
    }
  };


  videojs.Dailymotion.isSupported = function () {
    return true;
  };

  videojs.Dailymotion.prototype.supportsFullScreen = function () {
    return false;
  };

  videojs.Dailymotion.canPlaySource = function (srcObj) {
    return (srcObj.type === 'video/dailymotion');
  };

// All videos created before Dailymotion API is loaded
  videojs.Dailymotion.loadingQueue = [];


  videojs.Dailymotion.prototype.load = function () {
  };

  // Create the Dailymotion player
  videojs.Dailymotion.prototype.loadApi = function () {

    this.dmPlayer = new DM.player(this.id_, {
      video: this.videoId,
      width: this.options.width,
      height: this.options.height,
      params: this.params
    });


    this.setupTriggers();

    this.dmPlayer.vjsTech = this;
  };

  videojs.Dailymotion.prototype.onStateChange = function (event) {
    var state = event.type;
    if (state !== this.lastState) {
      switch (state) {
        case -1:
          this.player_.trigger('durationchange');
          break;

        case 'apiready':
          this.onReady();
          break;

        case 'ended':

          if (!this.player_.options().dmControls) {
            this.player_.bigPlayButton.show();
          }
          break;

        case 'play':
          this.player_.trigger('play');
          break;

        case 'playing':
          break;

        case 'pause':
          break;
        case 'durationchange':
          break;

        case 'timeupdate':
          // Hide the waiting spinner since Dailymotion has its own
          this.player_.loadingSpinner.hide();
          break;
        case 'progress':
          break;

      }

      this.lastState = state;
    }
  };

  videojs.Dailymotion.prototype.onError = function (error) {
    this.player_.error(error);

    if (error === 100 || error === 101 || error === 150) {
      this.player_.bigPlayButton.hide();
      this.player_.loadingSpinner.hide();
      this.player_.posterImage.hide();
    }
  };

  videojs.Dailymotion.makeQueryString = function (args) {
    var array = [];
    for (var key in args) {
      if (args.hasOwnProperty(key)) {
        array.push(encodeURIComponent(key) + '=' + encodeURIComponent(args[key]));
      }
    }

    return array.join('&');
  };

  videojs.Dailymotion.prototype.parseSrc = function (src) {
    this.srcVal = src;

    if (src) {
      // Regex that parse the video ID for any Dailymotion URL
      var regExp = /^.+dailymotion.com\/((video|hub)\/([^_]+))?[^#]*(#video=([^_&]+))?/;
      var match = src.match(regExp);

      return match ? match[5] || match[3] : null;
    }
  };

  videojs.Dailymotion.parsePlaylist = function (src) {
    // Check if we have a playlist
    var regExp = /[?&]list=([^#\&\?]+)/;
    var match = src.match(regExp);

    if (match !== null && match.length > 1) {
      return match[1];
    }
  };

// Make video events trigger player events
// May seem verbose here, but makes other APIs possible.
  videojs.Dailymotion.prototype.setupTriggers = function () {
    this.dmPlayer.listeners = [];
    for (var i = videojs.Dailymotion.Events.length - 1; i >= 0; i--) {
      //videojs.on(this.dmPlayer, videojs.Dailymotion.Events[i], videojs.bind(this, this.eventHandler));
      var listener = videojs.bind(this, this.eventHandler);
      this.dmPlayer.listeners.push({event: videojs.Dailymotion.Events[i], func: listener});
      this.dmPlayer.addEventListener(videojs.Dailymotion.Events[i], listener);
    }
  };
// Triggers removed using this.off when disposed

  videojs.Dailymotion.prototype.eventHandler = function (e) {
    this.onStateChange(e);
    this.trigger(e);
  };

// List of all HTML5 events (various uses).
  videojs.Dailymotion.Events = ('apiready,play,playing,pause,ended,canplay,' +
  'canplaythrough,timeupdate,progress,seeking,seeked,volumechange,durationchange,fullscreenchange,error').split(',');


// Called when Dailymotion API is ready to be used
  window.dmAsyncInit = function () {
    var dm;
    while ((dm = videojs.Dailymotion.loadingQueue.shift())) {
      dm.loadApi();
    }
    videojs.Dailymotion.loadingQueue = [];
    videojs.Dailymotion.apiReady = true;
  };
})();
