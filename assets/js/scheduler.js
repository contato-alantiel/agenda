$( document ).ready(function() {
	var key = null;
	// Simply open the database once so that it is created with the required tables
	$.indexedDB("RodrigoFisio", {
		"schema": {
			"2": function(versionTransaction){
				var scheduledTime = versionTransaction.createObjectStore("scheduledTime", {
					"keyPath": "scheduledTimeId"
				});
			},

			"3": function(versionTransaction){
				var freeTime = versionTransaction.createObjectStore("freeTime", {
					"keyPath": "freeTimeId"
				});
				
				//freeTime.createIndex("time",{unique:false});
				//freeTime.createIndex("date",{unique:false});
			}, 
			"4": function(versionTransaction){
				versionTransaction.objectStore("scheduledTime").createIndex("date");
				versionTransaction.objectStore("scheduledTime").createIndex("time");
			}, 
			"5": function(versionTransaction){
				versionTransaction.objectStore("freeTime").createIndex("date");
				versionTransaction.objectStore("freeTime").createIndex("time");
			}
		}
	}).done(function(){

		// Once the DB is opened with the object stores set up, show data from all tables
		window.setTimeout(function(){
				// TODO retirar
				emptyDB("scheduledTime");
				emptyDB("freeTime");
				var d = new Date();
				var prefixNow = d.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd
				console.log(prefixNow);

				//past
				var obj = {'scheduledTimeId': '2017050104', 'date': "20170501", 'time': '04-05'};
				addToScheduledTime(obj);

				var obj = {'scheduledTimeId': prefixNow+'09', 'date': prefixNow, 'time': '09-10'};
				addToScheduledTime(obj);
				obj = {'scheduledTimeId': prefixNow+'08', 'date': prefixNow, 'time': '08-09'};
				addToScheduledTime(obj);
				obj = {'freeTimeId': prefixNow+'06', 'date': prefixNow, 'time': '06-07'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'07', 'date': prefixNow, 'time': '07-08'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'08', 'date': prefixNow, 'time': '08-09'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'11', 'date': prefixNow, 'time': '11-12'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'14', 'date': prefixNow, 'time': '14-15'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'15', 'date': prefixNow, 'time': '15-16'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'16', 'date': prefixNow, 'time': '16-17'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'17', 'date': prefixNow, 'time': '17-18'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'18', 'date': prefixNow, 'time': '18-19'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'19', 'date': prefixNow, 'time': '19-20'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'20', 'date': prefixNow, 'time': '20-21'};
				addToFreeTime(obj);
				obj = {'freeTimeId': prefixNow+'21', 'date': prefixNow, 'time': '21-22'};
				addToFreeTime(obj);

				emptyDiv("scheduledTime");
				emptyDiv("freeTime");
				loadFromDB("scheduledTime", prefixNow);
				loadFromDB("freeTime", prefixNow);
			}, 200);
	});

	function emptyDB(table){
		_($.indexedDB("RodrigoFisio").objectStore(table).clear());
	}

	// Iterate over each record in a table and display it
	function loadFromDB(tableName, date){
		emptyDiv(tableName);

		var objectStore = $.indexedDB("RodrigoFisio").objectStore(tableName);
      objectStore.index("date").each(function(elem){
   		addRowInHTMLDiv(tableName, elem.key, elem.value);
   	}, [date]).then(function(res, e){
        			console.log("then");
      }, function(err, e){
        			console.log("err", err, e);
      });

		/*_($.indexedDB("RodrigoFisio").objectStore(tableName).index("date").each(function(elem){
			console.log(elem);
			addRowInHTMLDiv(tableName, elem.key, elem.value);
		}, [date]));*/
	}

	function emptyDiv(tableName){
		var div = document.getElementById(tableName);
		div.innerHTML = "";
	}

	function addRowInHTMLDiv(tableName, key, values){
		var div = document.getElementById(tableName);
		var row = document.createElement("p");
		var html = [];

		html = html.concat(["<a href='#0'>"+values['time']+"hrs</a>"]);
			
		row.innerHTML = html.join("");
		div.appendChild(row);
	}

	function addToScheduledTime(schedulerOBJ){
		console.log(schedulerOBJ);
		
		var transaction = $.indexedDB("RodrigoFisio").transaction(['scheduledTime'], 'readwrite');

		transaction.progress(function(transaction){
			
			transaction.objectStore("scheduledTime").add(schedulerOBJ).fail(function(e){
				alert('Ocorreu algum erro, por favor verifique os campos e tente novamente...');
			}).done(function(){
				//alert('Agendamento salvo com sucesso.');
				//TODO deixar alert
				console.log('Agendamento salvo com sucesso.');
			});
   			
		});
	}

	function addToFreeTime(schedulerOBJ){
		console.log(schedulerOBJ);
		
		var transaction = $.indexedDB("RodrigoFisio").transaction(['freeTime'], 'readwrite');

		transaction.progress(function(transaction){
			
			transaction.objectStore("freeTime").add(schedulerOBJ).fail(function(e){
				alert('Ocorreu algum erro, por favor verifique os campos e tente novamente...');
			}).done(function(){
				console.log('Tempo livre salvo com sucesso.');
			});
   			
		});
	}

	function _(promise){
			promise.then(function(a, e){
   			console.log("Action completed", e.type, a, e);
		}, function(a, e){
   			console.log("Action completed", a, e);
		}, function(a, e){
			console.log("Action completed", a, e);
		})
	}

});
