var db;
var request = window.indexedDB.open("RodrigoFisio", 1);

$( document ).ready(function() {
	//TODO retirar
	var DBDeleteRequest = window.indexedDB.deleteDatabase("RodrigoFisio");

	//prefixes of implementation that we want to test
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	 
	//prefixes of window.IDB objects
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
	 
	if (!window.indexedDB) {
		window.alert("Your browser doesn't support a stable version of IndexedDB.")
	}
	 
	request.onerror = function(event) {
	  console.log("error: ", event);
	};
	 
	request.onsuccess = function(event) {
	  db = request.result;
	  console.log("success: "+ db);
	};
	 
	request.onupgradeneeded = function(event) {
		    var db = event.target.result;
		    var customertStore = db.createObjectStore("customer", {keyPath: "id", autoIncrement: true});
			customertStore.createIndex("customerEmail", "customerEmail");

			var scheduledTimeStore = db.createObjectStore("scheduledTime", {keyPath: "id", autoIncrement: true});
			scheduledTimeStore.createIndex("date", "date", { unique: false });
			scheduledTimeStore.createIndex("time", "time", { unique: false });

			var freeTimeStore = db.createObjectStore("freeTime", {keyPath: "id", autoIncrement: true});
			freeTimeStore.createIndex("date", "date", { unique: false });
			freeTimeStore.createIndex("time", "time", { unique: false });

			var blockedTimeStore = db.createObjectStore("blockedTime", {keyPath: "id", autoIncrement: true});
			blockedTimeStore.createIndex("date", "date", { unique: false });
			blockedTimeStore.createIndex("time", "time", { unique: false });
	}

});
