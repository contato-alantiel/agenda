$( document ).ready(function() {

	window.setTimeout(function(){
		comboboxUI();

		// TODO retirar
		emptyDB("scheduledTime");
		emptyDB("freeTime");
		var d = new Date();
		var prefixNow = d.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd
		//console.log(prefixNow);

		//past
		var obj = {'id': '2017050104', 'date': "20170501", 'time': '04-05', 'customer': $("#combobox").val()};
		addToScheduledTime(obj);

		obj = {'date': prefixNow+'09', 'time': '09-10', 'customer': 1};
		addToScheduledTime(obj);
		obj = {'date': prefixNow+'08', 'time': '08-09', 'customer': 2};
		addToScheduledTime(obj);

		obj = {'date': prefixNow+'06', 'time': '06-07'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'07', 'time': '07-08'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'11', 'time': '11-12'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'14', 'time': '14-15'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'15', 'time': '15-16'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'16', 'time': '16-17'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'17', 'time': '17-18'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'18', 'time': '18-19'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'19', 'time': '19-20'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'21', 'time': '21-22'};
		addToFreeTime(obj);
		obj = {'date': prefixNow+'20', 'time': '20-21'};
		addToFreeTime(obj);

		obj = {'date': prefixNow+'12', 'time': '12-13', 'reason': 'Almoço'};
		addToBlockedTime(obj);
		obj = {'date': prefixNow+'13', 'time': '13-14', 'reason': 'Almoço + levando cachorro para passear'};
		addToBlockedTime(obj);
		obj = {'date': prefixNow+'22', 'time': '22-23', 'reason': 'Problema é meu'};
		addToBlockedTime(obj);

		loadFromDB("scheduledTime", prefixNow);
		loadFromDB("freeTime", prefixNow);
		loadFromDB("blockedTime", prefixNow);
	}, 400);

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

	// Iterate over each record in a table and display it
	function loadFromDB(tableName, date){
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

	function removeFromDB(tableName, itemId){
		var request = db.transaction([tableName], "readwrite")
                .objectStore(tableName)
                .delete(itemId);
        request.onsuccess = function(event) {
		  var d = new Date();
		  var prefixNow = d.toISOString().slice(0,10).replace(/-/g,""); //yyyymmdd
		  loadFromDB(tableName, prefixNow);
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
					  loadFromDB("scheduledTime", prefixNow);
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
					  loadFromDB("freeTime", prefixNow);
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
