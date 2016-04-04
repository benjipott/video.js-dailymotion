import videojs from 'video.js';
import chromecast from './videojs-dailymotion';

/**
 * The video.js Dailymotion plugin.
 *
 * @param {Object} options
 */
const plugin = function (options) {
  dailymotion(this, options);
};

videojs.plugin('dailymotion', plugin);

export default plugin;
