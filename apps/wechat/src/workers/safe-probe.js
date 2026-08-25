/* global worker */

worker.onMessage(function (event) {
	var message = event && event.message ? event.message : event;
	worker.postMessage({
		ready: Boolean(message && message.payload === 'ping'),
		requestId: message && message.requestId
	});
});
