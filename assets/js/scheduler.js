$( document ).ready(function() {

	window.setTimeout(function(){
		comboboxUI();
		scheculerSlider();

		// TODO retirar
		emptyDB("scheduledTime");
		emptyDB("freeTime");
		var d = new Date();
		d.setHours(0);
		var prefixNow = d.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd
		console.log(prefixNow, d.toISOString(), d);

		var d_1 = (function(){this.setDate(this.getDate()-1); return this}).call(new Date)
		var d_2 = (function(){this.setDate(this.getDate()-2); return this}).call(new Date)
		var d1 = (function(){this.setDate(this.getDate()+1); return this}).call(new Date)

		var prefixD_1 = d_1.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd
		var prefixD_2 = d_2.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd
		var prefixD1 = d1.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd

		//past
		var obj = {'id': '2017050104', 'date': "20170501", 'time': '04-05', 'customer': $("#combobox").val()};
		addToScheduledTime(obj);

		fillSample(prefixNow);
		//fillSample(prefixD_1);
		//fillSample(prefixD_2);
		//fillSample(prefixD1);

		loadDaySchedule(prefixNow);
		loadWeekSchedule(prefixNow);
	}, 1000);

	function loadCustomers() {
		$("#combobox").find("option:gt(0)").remove();
		$('#combobox option:eq(0)').prop('selected', true)

		var objectStore = db.transaction("customer").objectStore("customer");  
        objectStore.openCursor().onsuccess = function(event) {
		    var cursor = event.target.result;
		    if (cursor) {
				$("#combobox").append("<option value='" + cursor.key + "'>" + cursor.value['customerName'] + "</option>");
		        cursor.continue();
		    }
        };
	}

	function loadDaySchedule(prefix) {
		console.log(prefix);
		
		$(".schedule-day .period-schedule").data("prefix", prefix).text("Data: " + prefix.slice(6, 8) + "/" + prefix.slice(4, 6) + "/" + prefix.slice(0,4));
		loadFromDBToDailyTable("scheduledTime", prefix);
		loadFromDBToDailyTable("freeTime", prefix);
		loadFromDBToDailyTable("blockedTime", prefix);
	}

	function loadWeekSchedule(prefix) {
		function getMonday(d) {
		  d = new Date(d);
		  var day = d.getDay(),
				diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
		  return new Date(d.setDate(diff));
		}

		var d = new Date(prefix.slice(0,4), parseInt(prefix.slice(4, 6))-1, parseInt(prefix.slice(6, 8)) );

		var firstDay = getMonday(d);
		var lastDay = new Date(firstDay.getTime());
		lastDay.setDate(firstDay.getDate() + 5);

		var prefixStart = firstDay.toISOString().slice(0,10).replace(/-/g,"");
		var prefixEnd = lastDay.toISOString().slice(0,10).replace(/-/g,"");
		$(".schedule-week .period-schedule").data("prefix", prefixStart).text("Semana: " + prefixStart.slice(6, 8) + "/" + prefixStart.slice(4, 6) + "/" + prefixStart.slice(0,4) + " - " + prefixEnd.slice(6, 8) + "/" + prefixEnd.slice(4, 6) + "/" + prefixEnd.slice(0,4));

		var dateIteration = new Date(firstDay.getTime());
		for(i = 0; i < 6; i++) {
			dateIteration.setDate(firstDay.getDate() + i);
			loadFromDBToWeeklyTable((i+1), dateIteration.toISOString().slice(0,10).replace(/-/g,""));
		}
	}

	function emptyDB(table){
		var request = db.transaction([table], "readwrite")
             .objectStore(table)
             .clear();
                                 
        request.onsuccess = function(event) {
             console.log(table + ' limpa com sucesso');
        };
         
        request.onerror = function(event) {
             alert("Ocorreu algum erro! ");       
        }
	}

	function loadFromDBToDailyTable(tableName, date){
		emptyDiv(tableName);
		var objectStore = db.transaction(tableName).objectStore(tableName);
  
        objectStore.index('date').openCursor(IDBKeyRange.bound(date+"00", date+"23"), 'next').onsuccess = function(event) {
		    var cursor = event.target.result;
		    if (cursor) {
				addRowInHTMLDiv(tableName, cursor.key, cursor.value);
		      cursor.continue();
		    }
        }; 
	}

	function loadFromDBToWeeklyTable(columnNumber, date){
		console.log("before..." ,columnNumber, date);
		var objectStore = db.transaction("freeTime").objectStore("freeTime");
  
      objectStore.index('date').openCursor(IDBKeyRange.bound(date+"00", date+"23"), 'next').onsuccess = function(event) {
	     var cursor = event.target.result;
	     if (cursor) {
			 console.log(columnNumber + "-" + cursor.key.slice(8,10) + " - " + cursor.value);
			 $("tbody tr td."+cursor.key.slice(8,10)+"hrs:nth-child("+(columnNumber)+")", $("#week-schedule")).removeClass("filled").addClass("not-filled");
	       cursor.continue();
	     }
      }; 
	}

	function removeFromDB(tableName, itemId){
		var request = db.transaction([tableName], "readwrite")
                .objectStore(tableName)
                .delete(itemId);
        request.onsuccess = function(event) {
		  var d = new Date();
		  var prefixNow = d.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd
		  loadFromDBToDailyTable(tableName, prefixNow);
        };		
	}

	function emptyDiv(tableName){
		var div = document.getElementById(tableName);
		div.innerHTML = "";
	}

	function addRowInHTMLDiv(tableName, key, values){
		var div = document.getElementById(tableName);
		var row = document.createElement("p");
		var html = [];

		html = html.concat(["<a class='"+tableName+" time' href='#' data-reason='"+values['reason']+"' data-customer='"+values['customer']+"' data-date="+values['date']+" data-time="+values['time']+" data-id="+values['id'] + ">"+values['time']+"hrs</a>"]);
			
		row.innerHTML = html.join("");
		div.appendChild(row);

		$(".scheduledTime.time").unbind("click").click(
			function(e){
				var objThis = $(e.target);

				var transaction = db.transaction(["customer"]);
				var objectStore = transaction.objectStore("customer");
				var request = objectStore.get(objThis.data("customer"));
				request.onerror = function(event) {
				  alert("Erro - objeto inexistente");
				};
				request.onsuccess = function(event) {
				  if(request.result) {
						$( "#dialog-scheduled" ).attr("title", "Agendamento - horário: " + objThis.text());
						$( "#dialog-scheduled" ).find("p").html("Paciente: " + request.result.customerName + "<br>" + "Email: " + request.result.customerEmail);
						$( "#dialog-scheduled" ).dialog();
				  } else {
				        alert("Erro - objeto inexistente!"); 
				  }
				};
			}
		);

		$(".freeTime.time").unbind("click").click(
			function(e){
				var objThis = $(e.target);

				loadCustomers();

				$( "#dialog-free" ).find(".confirm-time").text(objThis.text());

				$( "#dialog-free" ).dialog({
				  resizable: true,
				  height: "auto",
				  width: "auto",
				  modal: true,
				  buttons: {
					"Agendar": function() {
					  var toSave = {'date': ""+objThis.data("date"), 'time': objThis.data("time"), 'customer': $("#combobox").val()};
					  addToScheduledTime(toSave);
					  removeFromDB("freeTime", objThis.data("id"));
                      var d = new Date();
				   	  var prefixNow = d.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd					  
					  loadFromDBToDailyTable("scheduledTime", prefixNow);
					  $(".custom-combobox-input").val("");
					  $( this ).dialog( "close" );
					},
					"Cancelar": function() {
					  $(".custom-combobox-input").val("");
					  $( this ).dialog( "close" );
					}
				  }
				});
				$( "#combobox" ).combobox();
				$( "#toggle" ).on( "click", function() {
					$( "#combobox" ).toggle();
				});
			}
		);

		$(".blockedTime.time").unbind("click").click(
			function(e){
				var objThis = $(e.target);

				$( "#dialog-blocked" ).find(".confirm-time").text(objThis.text());
				$( "#dialog-blocked" ).find(".block-reason").text(objThis.data("reason"));

				$( "#dialog-blocked" ).dialog({
				  resizable: true,
				  height: "auto",
				  width: "auto",
				  modal: true,
				  buttons: {
					"Sim": function() {
					  var toSave = {'date': ""+objThis.data("date"), 'time': objThis.data("time")};
					  addToFreeTime(toSave);
					  removeFromDB("blockedTime", objThis.data("id"));
                      var d = new Date();
				   	  var prefixNow = d.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd					  
					  loadFromDBToDailyTable("freeTime", prefixNow);
					  $( this ).dialog( "close" );
					},
					"Manter bloqueado": function() {
					  $( this ).dialog( "close" );
					}
				  }
				});
			}
		);
	}

	function addToScheduledTime(schedulerOBJ){
		console.log(schedulerOBJ);


		var request = db.transaction(["scheduledTime"], "readwrite")
                .objectStore("scheduledTime")
                .add(schedulerOBJ);
                                 
        request.onsuccess = function(event) {
                console.log('Agendamento salvo com sucesso.');
        };
         
        request.onerror = function(event) {
                alert("Ocorreu algum erro! ");       
        }
	}

	function addToFreeTime(schedulerOBJ){
		console.log(schedulerOBJ);


		var request = db.transaction(["freeTime"], "readwrite")
                .objectStore("freeTime")
                .add(schedulerOBJ);
                                 
        request.onsuccess = function(event) {
                console.log('Tempo livre salvo com sucesso.');
        };
         
        request.onerror = function(event) {
                alert("Ocorreu algum erro! ");       
        }
	}


	function addToBlockedTime(schedulerOBJ){
		console.log(schedulerOBJ);


		var request = db.transaction(["blockedTime"], "readwrite")
                .objectStore("blockedTime")
                .add(schedulerOBJ);
                                 
        request.onsuccess = function(event) {
                console.log('Tempo bloqueado salvo com sucesso.');
        };
         
        request.onerror = function(event) {
                alert("Ocorreu algum erro! ");       
        }
	}

	function fillSample(prefix) {
		//if( (prefix % 2) == 0 ) {
			obj = {'date': prefix+'09', 'time': '09-10', 'customer': 1};
			addToScheduledTime(obj);
			console.log("par " + prefix);
		/*} else {
			obj = {'date': prefix+'09', 'time': '09-10'};
			addToFreeTime(obj);
			console.log("impar " + prefix);
		}*/


		obj = {'date': prefix+'08', 'time': '08-09', 'customer': 2};
		addToScheduledTime(obj);

		obj = {'date': prefix+'06', 'time': '06-07'};
		addToFreeTime(obj);
		obj = {'date': prefix+'07', 'time': '07-08'};
		addToFreeTime(obj);
		obj = {'date': prefix+'10', 'time': '10-11'};
		addToFreeTime(obj);
		obj = {'date': prefix+'11', 'time': '11-12'};
		addToFreeTime(obj);
		obj = {'date': prefix+'14', 'time': '14-15'};
		addToFreeTime(obj);
		obj = {'date': prefix+'15', 'time': '15-16'};
		addToFreeTime(obj);
		obj = {'date': prefix+'16', 'time': '16-17'};
		addToFreeTime(obj);
		obj = {'date': prefix+'17', 'time': '17-18'};
		addToFreeTime(obj);
		obj = {'date': prefix+'18', 'time': '18-19'};
		addToFreeTime(obj);
		obj = {'date': prefix+'19', 'time': '19-20'};
		addToFreeTime(obj);
		obj = {'date': prefix+'21', 'time': '21-22'};
		addToFreeTime(obj);
		obj = {'date': prefix+'20', 'time': '20-21'};
		addToFreeTime(obj);

		obj = {'date': prefix+'12', 'time': '12-13', 'reason': 'Almoço'};
		addToBlockedTime(obj);
		obj = {'date': prefix+'13', 'time': '13-14', 'reason': 'Almoço + levando cachorro para passear '};
		addToBlockedTime(obj);

		//if( (prefix % 2) == 0 ) {
			obj = {'date': prefix+'22', 'time': '22-23', 'reason': 'Problema é meu'};
			addToBlockedTime(obj);
		/*}
		else {
			obj = {'date': prefix+'22', 'time': '22-23'};
			addToFreeTime(obj);
		}*/
	}

	function scheculerSlider() {
		$('.slider--prev, .slider--next', $(".schedule-day")).click(function(e) {
			var objThis = $(e.target);
			var increment = 1;
			if(objThis.is(".slider--prev") || objThis.parents(".slider--prev").length > 0) {
				increment = -1;
			}
			var objPeriod = $(".period-schedule", $(".schedule-day"));
			var prefix = String(objPeriod.data("prefix"));

			var toDate = new Date(prefix.slice(0,4), parseInt(prefix.slice(4, 6))-1, parseInt(prefix.slice(6, 8)) + increment );

			loadDaySchedule(toDate.toISOString().slice(0,10).replace(/-/g,""));
		});

		$('.slider--prev, .slider--next', $(".schedule-week")).click(function(e) {
			var objThis = $(e.target);
			var increment = 7;
			if(objThis.is(".slider--prev") || objThis.parents(".slider--prev").length > 0) {
				increment = -7;
			}
			var objPeriod = $(".period-schedule", $(".schedule-week"));
			var prefix = String(objPeriod.data("prefix"));

			var toDate = new Date(prefix.slice(0,4), parseInt(prefix.slice(4, 6))-1, parseInt(prefix.slice(6, 8)) + increment );

			loadWeekSchedule(toDate.toISOString().slice(0,10).replace(/-/g,""));
		});
	}

	/*See schedule daily/weekly*/
	$('.schedule-toggle-link').click(function (e) {
		  e.stopPropagation();
		  e.preventDefault();

		  var objThis = $(e.target);
		  if(objThis.is(".active")) return;
		
		  $(".schedule-toggle-link").toggleClass("active");
		  $(".schedule-toggle").toggleClass("hide");
	});

	function comboboxUI() {
		loadCustomers();

		$.widget( "custom.combobox", {
			_create: function() {
			this.wrapper = $( "<span>" )
			  .addClass( "custom-combobox" )
			  .insertAfter( this.element );

			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
			},

			_createAutocomplete: function() {
			var selected = this.element.children( ":selected" ),
			  value = selected.val() ? selected.text() : "";

			this.input = $( "<input>" )
			  .appendTo( this.wrapper )
			  .val( value )
			  .attr( "title", "" )
			  .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
			  .autocomplete({
				delay: 0,
				minLength: 0,
				source: $.proxy( this, "_source" )
			  })
			  .tooltip({
				classes: {
				  "ui-tooltip": "ui-state-highlight"
				}
			  });

			this._on( this.input, {
			  autocompleteselect: function( event, ui ) {
				ui.item.option.selected = true;
				this._trigger( "select", event, {
				  item: ui.item.option
				});
			  },

			  autocompletechange: "_removeIfInvalid"
			});
			},

			_createShowAllButton: function() {
			var input = this.input,
			  wasOpen = false;

			$( "<a>" )
			  .attr( "tabIndex", -1 )
			  .attr( "title", "Todos" )
			  .tooltip()
			  .appendTo( this.wrapper )
			  .button({
				icons: {
				  primary: "ui-icon-triangle-1-s"
				},
				text: false
			  })
			  .removeClass( "ui-corner-all" )
			  .addClass( "custom-combobox-toggle ui-corner-right" )
			  .on( "mousedown", function() {
				wasOpen = input.autocomplete( "widget" ).is( ":visible" );
			  })
			  .on( "click", function() {
				input.trigger( "focus" );

				// Close if already visible
				if ( wasOpen ) {
				  return;
				}

				// Pass empty string as value to search for, displaying all results
				input.autocomplete( "search", "" );
			  });
			},

			_source: function( request, response ) {
			var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
			response( this.element.children( "option" ).map(function() {
			  var text = $( this ).text();
			  if ( this.value && ( !request.term || matcher.test(text) ) )
				return {
				  label: text,
				  value: text,
				  option: this
				};
			}) );
			},

			_removeIfInvalid: function( event, ui ) {

			// Selected an item, nothing to do
			if ( ui.item ) {
			  return;
			}

			// Search for a match (case-insensitive)
			var value = this.input.val(),
			  valueLowerCase = value.toLowerCase(),
			  valid = false;
			this.element.children( "option" ).each(function() {
			  if ( $( this ).text().toLowerCase() === valueLowerCase ) {
				this.selected = valid = true;
				return false;
			  }
			});

			// Found a match, nothing to do
			if ( valid ) {
			  return;
			}

			// Remove invalid value
			this.input
			  .val( "" )
			  .attr( "title", value + " didn't match any item" )
			  .tooltip( "open" );
			this.element.val( "" );
			this._delay(function() {
			  this.input.tooltip( "close" ).attr( "title", "" );
			}, 2500 );
			this.input.autocomplete( "instance" ).term = "";
			},

			_destroy: function() {
			this.wrapper.remove();
			this.element.show();
			}
		});
	}

});
