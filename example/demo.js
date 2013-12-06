window.addEvent('domready', function() {
	new Request.HTML({
		//url: 'http://jsfiddle.net/gh/get/benjipott/video.js-dailymotion/tree/master/example/',
		url: 'http://jsfiddle.net/gh/get/benjipott/video.js-dailymotion/tree/master/lib/video.js',
		data: {'delay': 1},
		method: 'post',
		update: 'demo',
		onSuccess: function(response) {
			$('demo').highlight();
		}
	}).send();
})
