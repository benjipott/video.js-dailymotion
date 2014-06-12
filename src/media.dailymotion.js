/**
 * @fileoverview Dailymotion Media Controller - Wrapper for Dailymotion Media API
 */

/**
 * Dailymotion Media Controller - Wrapper for Dailymotion Media API
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */
videojs.Dailymotion = videojs.MediaTechController.extend({
    init: function (player, options, ready) {
        videojs.MediaTechController.call(this, player, options, ready);

        this.features.fullscreenResize = true;

        this.player_ = player;
        this.player_el_ = document.getElementById(this.player_.id());

        if (typeof this.player_.options().dmControls != 'undefined') {
            var dmC = this.player_.options().dmControls = parseInt(this.player_.options().dmControls) && this.player_.controls_;

            if (dmC && this.player_.controls_)
                this.player_.controls(!dmC);
        }


        // Copy the Javascript options if they exist
        if (typeof options.source != 'undefined') {
            for (var key in options.source) {
                this.player_.options()[key] = options.source[key];
            }
        }

        this.videoId = videojs.Dailymotion.parseVideoId(this.player_.options().src);

        if (typeof this.videoId != 'undefined') {
            // Show the Dailymotion poster only if we don't use Dailymotion poster (otherwise the controls pop, it's not nice)
            if (!this.player_.options().dmControls) {
                // Set the Dailymotion poster only if none is specified
                if (typeof this.player_.poster() == 'undefined') {
                    this.player_.poster('https://api.dailymotion.com/video/' + this.videoId + '?fields=url');
                }

                // Cover the entire iframe to have the same poster than Dailymotion
                // Doesn't exist right away because the DOM hasn't created it
                var self = this;
                setTimeout(function () {
                    self.player_.posterImage.el().style.backgroundSize = 'cover';
                }, 50);
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

        this.player_el_.insertBefore(this.el_, this.player_el_.firstChild);

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

        if (typeof this.params.list == 'undefined') {
            delete this.params.list;
        }

        // Make autoplay work for iOS
        if (this.player_.options().autoplay) {
            this.player_.bigPlayButton.hide();
            this.playOnReady = true;
        }

        // If we are not on a server, don't specify the origin (it will crash)
        if (window.location.protocol != 'file:') {
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
                tag.src = 'http://api.dmcdn.net/all.js';
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                videojs.Dailymotion.apiLoading = true;
            }
        }
    }
});

videojs.Dailymotion.prototype.params = [];

videojs.Dailymotion.prototype.dispose = function () {
    if (this.el_) {
        this.el_.parentNode.removeChild(this.el_);
    }

    /*if (this.dmPlayer) {
     this.dmPlayer.destroy();
     }*/

    videojs.MediaTechController.prototype.dispose.call(this);
};

videojs.Dailymotion.prototype.src = function (src) {
    this.dmPlayer.load(videojs.Dailymotion.parseVideoId(src));
};

videojs.Dailymotion.prototype.currentSrc = function () {
    if (this.isReady_) {
        return this.params.url;
    }
    else {
        return null;
    }
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
        return stateId == 0;
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
    return this.dmPlayer.currentTime;
};

videojs.Dailymotion.prototype.setCurrentTime = function (seconds) {
    this.dmPlayer.seek(seconds, true);
    this.player_.trigger('timeupdate');
};

videojs.Dailymotion.prototype._duration;
videojs.Dailymotion.prototype.duration = function () {
    return this.dmPlayer.duration;
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
    if (percentAsDecimal && percentAsDecimal != this.volumeVal) {
        this.dmPlayer.volume = percentAsDecimal;
        this.volumeVal = percentAsDecimal;
        this.player_.trigger('volumechange');
    }
};

videojs.Dailymotion.prototype.muted = function () {
    return this.dmPlayer.muted;
};
videojs.Dailymotion.prototype.setMuted = function (muted) {
    this.dmPlayer.muted = muted;

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
    return (srcObj.type == 'video/dailymotion');
};

// All videos created before Dailymotion API is loaded
videojs.Dailymotion.loadingQueue = [];

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
    if (state != this.lastState) {
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
            case 'playing':
                break;

            case 'pause':
                break;
            case 'durationchange':
                break;

            case 'timeupdate':
                // Hide the waiting spinner since YouTube has its own
                this.player_.loadingSpinner.hide();
                break;
            case 'progress':
                break;

        }

        this.lastState = state;
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

videojs.Dailymotion.parseVideoId = function (src) {
    if(src) {
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

    if (match != null && match.length > 1) {
        return match[1];
    }
};

// Make video events trigger player events
// May seem verbose here, but makes other APIs possible.
videojs.Dailymotion.prototype.setupTriggers = function () {
    for (var i = videojs.Dailymotion.Events.length - 1; i >= 0; i--) {
        //videojs.on(this.dmPlayer, videojs.Dailymotion.Events[i], videojs.bind(this, this.eventHandler));
        this.dmPlayer.addEventListener(videojs.Dailymotion.Events[i], videojs.bind(this, this.eventHandler));
    }
};
// Triggers removed using this.off when disposed

videojs.Dailymotion.prototype.eventHandler = function (e) {
    this.onStateChange(e);
    this.trigger(e);
};

// List of all HTML5 events (various uses).
videojs.Dailymotion.Events = 'apiready,play,playing,pause,ended,canplay,canplaythrough,timeupdate,progress,seeking,seeked,volumechange,durationchange,fullscreenchange,error'.split(',');


// Called when Dailymotion API is ready to be used
window.dmAsyncInit = function () {

    var dm;
    while ((dm = videojs.Dailymotion.loadingQueue.shift())) {
        dm.loadApi();
    }
    videojs.Dailymotion.loadingQueue = [];
    videojs.Dailymotion.apiReady = true;
}

