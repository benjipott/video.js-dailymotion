/* global browser, describe, it, xit */
/* jshint node: true */

var should = require('should'); // jshint ignore:line
var url = require('url');


describe('Test basic API commands for Dailymotion tech', function () {
  xit('should play and pause', function () {
    browser.driver.get(url.resolve(browser.baseUrl, '/sandbox/index.html'));
    browser.driver.sleep(5000);

    browser.driver.executeScript('videojs("vid1").play()');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").paused()').then(function (paused) {
      paused.should.be.false; // jshint ignore:line
    });

    browser.driver.executeScript('videojs("vid1").pause();');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").paused()').then(function (paused) {
      paused.should.be.true; // jshint ignore:line
    });
  });

  xit('should change the source with regular URL', function () {
    browser.driver.get(url.resolve(browser.baseUrl, '/sandbox/index.html'));
    browser.driver.sleep(5000);

    browser.driver.executeScript('videojs("vid1").src("http://www.dailymotion.com/video/' +
      'xtzbl_pizzicato-five-tout-va-bien_music");');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").src()').then(function (src) {
      src.should.equal('http://www.dailymotion.com/video/xtzbl_pizzicato-five-tout-va-bien_music');
    });
  });

  xit('should seek at a specific time', function () {
    browser.driver.get(url.resolve(browser.baseUrl, '/sandbox/index.html'));
    browser.driver.sleep(5000);

    browser.driver.executeAsyncScript(
        'var callback = arguments[arguments.length - 1];' +
        'videojs("vid1").on("play", function(){' +
        '  videojs("vid1").currentTime(10);' +
        '  callback()' +
        '});' +
        'videojs("vid1").play();').then(function () {
        console.log('seek done');
      });

     browser.driver.executeScript('return videojs("vid1").currentTime()').then(function(currentTime) {
     currentTime.should.be.within(10, 11);
     });
  });

  xit('should know duration', function () {
    browser.driver.get(url.resolve(browser.baseUrl, '/sandbox/index.html'));
    browser.driver.sleep(5000);

    browser.driver.executeScript('videojs("vid1").play()');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").duration()').then(function (duration) {
      duration.should.be.within(263, 264);
    });
  });

  xit('should set the volume, mute and unmute', function () {
    browser.driver.get(url.resolve(browser.baseUrl, '/sandbox/index.html'));
    browser.driver.sleep(5000);

    browser.driver.executeScript('videojs("vid1").play()');
    browser.driver.sleep(5000);

    browser.driver.executeScript('videojs("vid1").volume(0.5)');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").volume()').then(function (volume) {
      volume.should.equal(0.5);
    });

    browser.driver.executeScript('return videojs("vid1").muted()').then(function (muted) {
      muted.should.be.false; // jshint ignore:line
    });

    browser.driver.executeScript('videojs("vid1").play();videojs("vid1").muted(true);');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").muted()').then(function (muted) {
      muted.should.be.true; // jshint ignore:line
    });

    browser.driver.executeScript('videojs("vid1").play();videojs("vid1").muted(false);');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").muted()').then(function (muted) {
      muted.should.be.false; // jshint ignore:line
    });
  });

  it('should switch technologies', function () {
    browser.driver.get(url.resolve(browser.baseUrl, '/sandbox/index.html'));
    browser.driver.sleep(5000);
    browser.driver.executeScript('videojs("vid1").play()');

    browser.driver.executeScript('videojs("vid1").src({ src: "http://vjs.zencdn.net/v/oceans.mp4", ' +
      'type: "video/mp4" });');
    browser.driver.sleep(1000);

    browser.driver.executeScript('videojs("vid1").play()');
    browser.driver.sleep(5000);

    browser.driver.executeScript('videojs("vid1").src({src:"http://www.dailymotion.com/video/' +
      'xtzbl_pizzicato-five-tout-va-bien_music", ' +
      'type: "video/dailymotion" });');
    browser.driver.sleep(5000);

    browser.driver.executeScript('videojs("vid1").play()');
    browser.driver.sleep(5000);

    browser.driver.executeScript('return videojs("vid1").src()').then(function (src) {
      src.should.equal('http://www.dailymotion.com/video/xtzbl_pizzicato-five-tout-va-bien_music');
    });
  });
});
