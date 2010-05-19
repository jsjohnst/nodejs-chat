
var chat = function() {
	var submitRef;
	var entryRef;
	var chatRef;
	var debugRef;
	var clientId = Math.random();
	var latestId = -1;
	
	
	function init() {		
		submitRef = document.getElementById("sendBtn");
		entryRef = document.getElementById("entry");
		chatRef = document.getElementById("chatMessages");
		debugRef = document.getElementById("debug");
	}
	
	function sendHandler() {
		var message = entryRef.value;
		
		submitRef.value = "Send...";
		submitRef.disabled = true;
		entryRef.disabled = true;
		
		var node = document.createElement("script");
		node.src = "/api/send/?clientId=" + clientId + "&content=" + message + "&rand=" + Math.random();
		document.body.appendChild(node);
	}
	
	function bindHandlers() {
		submitRef.onclick = sendHandler;
		entryRef.onkeyup = function(e) {
			if(e.keyCode == 13) {
				sendHandler();
			}
		};
	}
	
	function processMessages(jsonString) {
		var messages = json_parse(jsonString).response;
		for(var i=0; i < messages.length; i++) {
			var message = messages[i];
			var prefix = "<font color='" + (message.clientId == clientId ? 'red' : 'green') + "'>" + (message.clientId == clientId ? 'You' : 'Other') + "</font>";
			var markup = "<div><span>" + prefix + "</span>: " + message.content + "</div>";
			chatRef.innerHTML += markup;
			latestId = message.sequence;
		}
		chatRef.scrollTop = chatRef.scrollHeight;
	}
	
	function handleXHRResponse() {
		if(this.readyState != 4) { return; }
		if(this.status == 200) {
			processMessages(this.responseText);
			startPuller();
		} else {
			startPuller();
		}
	}
	
	function startPuller() {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = handleXHRResponse;
		xhr.open("GET", "/api/poll/" + latestId);
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
				entryRef.value = "";
				entryRef.disabled = false;
				submitRef.value = "Send";
				submitRef.disabled = false;
			}
		},
	};
}();

