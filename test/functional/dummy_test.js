/* global browser, describe, it */
/* jshint node: true */

var should = require('should'); // jshint ignore:line
var url = require('url');

describe('Dummy', function () {
  it('should success on true===true', function () {
    browser.driver.get(url.resolve(browser.baseUrl, '/sandbox/index.html'));
    browser.driver.sleep(5000);

    (true).should.equal(true);

  });

});
