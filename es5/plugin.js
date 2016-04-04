'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _videojsDailymotion = require('./videojs-dailymotion');

var _videojsDailymotion2 = _interopRequireDefault(_videojsDailymotion);

/**
 * The video.js Dailymotion plugin.
 *
 * @param {Object} options
 */
var plugin = function plugin(options) {
  dailymotion(this, options);
};

_videoJs2['default'].plugin('dailymotion', plugin);

exports['default'] = plugin;
module.exports = exports['default'];