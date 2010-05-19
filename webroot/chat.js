
var chat = function() {
	var submitRef;
	var entryRef;
	var chatRef;
	var debugRef;
	var clientId = Math.random();
	var latestId = -1;
	
	function debugMessage(message) {
		var markup = "<div>" + message + "</div>";
		debugRef.innerHTML += markup;
		debugRef.scrollTop = debugRef.scrollHeight;
	}
	
	function init() {
		submitRef = document.getElementById("sendBtn");
		entryRef = document.getElementById("entry");
		chatRef = document.getElementById("chatMessages");
		debugRef = document.getElementById("debug");
		debugMessage("Initialized!");
	}
	
	function sendHandler() {
		var message = entryRef.value;
		
		debugMessage("Sending message");
		
		submitRef.value = "Send...";
		submitRef.disabled = true;
		entryRef.disabled = true;
		
		var node = document.createElement("script");
		node.src = "/api/send/?clientId=" + clientId + "&content=" + message + "&rand=" + Math.random();
		document.body.appendChild(node);
		debugMessage("Script node appended");
	}
	
	function bindHandlers() {
		debugMessage("Binding handlers");
		submitRef.onclick = sendHandler;
		entryRef.onkeyup = function(e) {
			if(e.keyCode == 13) {
				sendHandler();
			}
		};
	}
	
	function processMessages(jsonString) {
		debugMessage("Processing messages");
		var messages = json_parse(jsonString).response;
		for(var i=0; i < messages.length; i++) {
			var message = messages[i];
			var prefix = "<font color='" + (message.clientId == clientId ? 'red' : 'green') + "'>" + (message.clientId == clientId ? 'You' : 'Other') + "</font>";
			var markup = "<div><span>" + prefix + "</span>: " + message.content + "</div>";
			chatRef.innerHTML += markup;
			latestId = message.sequence;
		}
		chatRef.scrollTop = chatRef.scrollHeight;
		debugMessage("Finished processing messages");
	}
	
	function handleXHRResponse() {
		if(this.readyState != 4) { return; }
		if(this.status == 200) {
			debugMessage("Got 200 response"); 
			processMessages(this.responseText);
			startPuller();
		} else {
			debugMessage("Error or timeout, restarting");
			startPuller();
		}
	}
	
	function startPuller() {
		debugMessage("Starting new XHR"); 
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = handleXHRResponse;
		xhr.open("GET", "/api/poll/" + latestId, true);
		xhr.send();
	}
	
	return {
		start: function() {
			init();
			bindHandlers();
			startPuller();
		},
		receiveSendResponse: function(response) {
			if(response.status == 200) {
				debugMessage("Message sent successfully"); 
				entryRef.value = "";
				entryRef.disabled = false;
				submitRef.value = "Send";
				submitRef.disabled = false;
			} else {
				debugMessage("Message sending failed"); 
				entryRef.disabled = false;
				submitRef.value = "Send";
				submitRef.disabled = false;
			}
		},
	};
}();

