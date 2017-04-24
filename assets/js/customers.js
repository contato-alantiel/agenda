$( document ).ready(function() {

	//var key = null;
   // Simply open the database once so that it is created with the required tables
   $.indexedDB("RodrigoFisio", {
   	"schema": {
   		"1": function(versionTransaction){
   			var customer = versionTransaction.createObjectStore("customer", {
					//"autoIncrement": false,
            	"keyPath": "customerEmail"
   			});
				
				customer.createIndex("customerName");
   			//customer.createIndex("customerEmail");
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
   	var header = table.getElementsByTagName("tr")[0];
   	table.innerHTML = "";
   	header && table.appendChild(header);
   }

	function addRowInHTMLTable(tableName, key, value){
   	var actions = {
   		"customer": {
   			"Add to cart": "editCustomer",
   			"Add to wishlist": "removeFromCustomer"
   		}
   	}
   	table = document.getElementById(tableName);
   	var row = document.createElement("tr");
   	var html = ["<tr>"];
   	html = html.concat(["<td class = 'key'>", key, "</td>"]);
   	html.push("<td class = 'action'>");
   	for (var action in actions[tableName]) {
   		html = html.concat("<a href = 'javascript:", actions[tableName][action], "(", key, ")'>", action, "</a>");
   	}
   	html.push("</td>");
		html = html.concat(["<td class = 'value'>", renderJSON(value), "</td>"]);
   	html.push("</tr>");
   	row.innerHTML = html.join("");
   	table.appendChild(row);
   }

	function renderJSON(val){
   	var result = [];
   	for (var key in val) {
   		result.push("<div class = 'keyval'>");
   		result.push("<span class = 'key'>", key, "</span>");
   		result.push("<span class = 'value'>", JSON.stringify(val[key]), "</span>");
   		result.push("</div>")
   	}
   	return result.join("");
   }

	

   function addToCustomer(customerOBJ){
		console.log(customerOBJ);
		
		var transaction = $.indexedDB("RodrigoFisio").transaction(['customer'], 'readwrite');

   	transaction.done(function(){
			console.log("yea");
   		loadFromDB("customer");
   	});

   	transaction.progress(function(transaction){
			transaction.objectStore("customer").count().then(function(result) {
				console.log("Transaction OK here");
				customerOBJ['customerId'] = result+1;

				transaction.objectStore("customer").add(customerOBJ).fail(function(e){
					alert("putz");
					console.log(e);
				}).done(function(){
					//_(customer.add(customerOBJ));
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

		  var bValid = true;

		  if (bValid) {
		     var customer = {};
		     
		     customer.customerName = $("#customer-name").val();
		     customer.customerEmail = $("#customer-email").val();
		     customer.customerDeleted = 0;
		     addToCustomer(customer);
		  }
	});

});
