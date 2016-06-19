<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Video.js - Dailymotion Source Support](#videojs---dailymotion-source-support)
  - [How does it work?](#how-does-it-work)
  - [Additional Informations](#additional-informations)
  - [Special Thank You](#special-thank-you)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Video.js - Dailymotion Source Support
Allows you to use Dailymotion URL as source with [Video.js](https://github.com/zencoder/video-js/).

## How does it work?
Including the script vjs.dailymotion.js will add the Dailymotion as a tech. You just have to add it to your techOrder option. Then, you add the option src with your Dailymotion URL.

It supports:
- dailymotion.com/
- Regular URLs: http://www.dailymotion.com/video/xxxasl_fail-compilation-february-2013-tnl_fun

**You must use the last version of VideoJS available in the folder lib, the current version on CDN will not work until it is updated**

Here is an example:

	<link href="video-js.css" rel="stylesheet">
	<script src="video.js"></script>
	<script src="vjs.dailymotion.js"></script>
	<video id="vid1" class="video-js vjs-default-skin" controls preload="auto" width="640" height="360" data-setup='{ "techOrder": ["dailymotion"], "src": "http://www.dailymotion.com/video/xxxasl_fail-compilation-february-2013-tnl_fun" }'></video>

## Additional Informations
dmControls: Display the Dailymotion controls instead of Video.js.

##Special Thank You
Thanks to Benoit Tremblay for the original code https://github.com/eXon/videojs-youtube
