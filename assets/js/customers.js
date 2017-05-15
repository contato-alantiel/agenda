$( document ).ready(function() {
	var key = null;
	// Simply open the database once so that it is created with the required tables
	$.indexedDB("RodrigoFisio", {
		"schema": {
			"1": function(versionTransaction){
				var customer = versionTransaction.createObjectStore("customer", {
					"keyPath": "customerId"
				});
				
				customer.createIndex("customerId");
			}
		}
	}).done(function(){
		// Once the DB is opened with the object stores set up, show data from all tables
		window.setTimeout(function(){
			//emptyDB("customer");
			loadFromDB("customer");
				//downloadCatalog();
			}, 200);
   });

	// Iterate over each record in a table and display it
   function loadFromDB(table){
		emptyTable(table);
		_($.indexedDB("RodrigoFisio").objectStore(table).each(function(elem){
			addRowInHTMLTable(table, elem.key, elem.value);
		}));
   }

	function emptyDB(table){
		_($.indexedDB("RodrigoFisio").objectStore(table).clear());
	}

	function emptyTable(tableName){
		var table = document.getElementById(tableName);
		table.getElementsByTagName("tbody")[0].innerHTML = "";
	}

	function addRowInHTMLTable(tableName, key, values){
		var actions = {
			"customer": {
   			"Editar": "editCustomer",
   			"Ver agenda": "seeCustomerSchedule"
		}
		}
   		var table = document.getElementById(tableName).getElementsByTagName("tbody")[0];
	   	var row = document.createElement("tr");
   		var html = ["<tr>"];

		html = html.concat([renderTD(values, 'customerId')]);
		html = html.concat([renderTD(values, 'customerName')]);
		html = html.concat([renderTD(values, 'customerEmail')]);

   		html.push("<td class = 'action'>");
	   	for (var action in actions[tableName]) {
   			html = html.concat("<a href = 'javascript:", actions[tableName][action], "(", key, ")'>", action, "</a> ");
	   	}
   		html.push("</td>");
	   	html.push("</tr>");
   		row.innerHTML = html.join("");
   		table.appendChild(row);
	}

	function renderTD(obj, key){
		var result = [];
		result.push("<td class='", key, "'>");
		result.push(obj[key]);
		result.push("</td>")

		return result.join("");
	}

	function addToCustomer(customerOBJ){
		console.log(customerOBJ);
		
		var transaction = $.indexedDB("RodrigoFisio").transaction(['customer'], 'readwrite');

		transaction.done(function(){
			loadFromDB("customer");
		});

		transaction.progress(function(transaction){
			transaction.objectStore("customer").count().then(function(result) {
				console.log("Transaction OK here");
				customerOBJ['customerId'] = result+1;

				transaction.objectStore("customer").add(customerOBJ).fail(function(e){
					alert('Ocorreu algum erro, por favor verifique os campos e tente novamente...');
				}).done(function(){
					alert('Cliente salvo com sucesso.');
					$("form:visible")[0].reset()
					console.log("finishing");
				});
			});
   			
		});
	}
   
	function removeFromCustomer(itemId){
		$.indexedDB("RodrigoFisio").objectStore("customer")["delete"](itemId).done(function(){
			loadFromDB("customer");
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

	/*Add Customer*/
	$('#add-customer').click(function (e) {
		e.stopPropagation();
		e.preventDefault();

		var isValid = true; //TODO validate

		if (isValid) {
			var customer = {};
		     
			customer.customerName = $("#customer-name").val();
			customer.customerEmail = $("#customer-email").val();
			addToCustomer(customer);
		}
	});

	/*See customer list/form*/
	$('#see-customer-list').click(function (e) {
		  e.stopPropagation();
		  e.preventDefault();
		
		  var objThis = $(e.target);
		  var objCustomerList = $("#customer-list");
		  objCustomerList.parent().find("form").toggleClass("hide");
		  objCustomerList.toggleClass("hide");
		  objThis.parent().find("span").toggleClass("hide");
	});

	/*See schedule daily/weekly*/
	$('.schedule-toggle-link').click(function (e) {
		  e.stopPropagation();
		  e.preventDefault();

		  var objThis = $(e.target);
		  if(objThis.is(".active")) return;
		
		  $(".schedule-toggle-link").toggleClass("active");
		  $(".schedule-toggle").toggleClass("hide");
	});


});
