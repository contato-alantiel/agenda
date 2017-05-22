$( document ).ready(function() {

	 window.setTimeout(function(){
		loadCustomers();
	 }, 400);


     function loadCustomers(){
		var objectStore = db.transaction("customer").objectStore("customer");
		emptyCustomerTable();
  
        objectStore.openCursor().onsuccess = function(event) {
		    var cursor = event.target.result;
		    if (cursor) {
				addRowInHTMLTable("customer", cursor.key, cursor.value);
		        cursor.continue();
		    }
        }; 
     }


	 function emptyCustomerTable(){
		$("#customer tbody").html("");
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

		html = html.concat([renderTD(values, 'id')]);
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

		var request = db.transaction(["customer"], "readwrite")
                .objectStore("customer")
                .add(customerOBJ);
                                 
        request.onsuccess = function(event) {
                alert("Paciente adicionado com sucesso");
				$("form:visible")[0].reset();
				loadCustomers();
        };
         
        request.onerror = function(event) {
                alert("Ocorreu algum erro! ");       
        }

		console.log(customerOBJ);
	}
   
	function removeFromCustomer(itemId){
		var request = db.transaction(["customer"], "readwrite")
                .objectStore("customer")
                .delete(itemId);
        request.onsuccess = function(event) {
          alert("Paciente removido com sucesso!");
		  loadCustomers();
        };
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
