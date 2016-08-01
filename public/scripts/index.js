(function() {
    var loadingHeader = document.getElementById('loading');
    /* This function parses the API's response to build a div which will
     * contain a list of clients.
     * Every li element for a client will contain a sublist of rules
     * which apply to it.
     */
    var buildUI = function(categorizedJSON) {
	var divContainer = document.createElement('div');
	var clientList = document.createElement('ul');
	var ruleList, clientElem, curClientObj;
	var i;
	// First we build up the list of clients and insert
	// placeholder sublists into them
	for (i = 0; i < categorizedJSON.clients.length; i++) {
	    curClientObj = categorizedJSON.clients[i];

	    // This is the list element, such as for 'Foo App'
	    clientElem = document.createElement('li');
	    clientElem.appendChild(
		document.createTextNode(curClientObj.name)
	    );
	    // This is the sublist which will contain the rules that apply
	    // to 'Foo App'
	    ruleList = document.createElement('ol');
	    // Use the client's ID so we can reference it easily later
	    ruleList.id = curClientObj.client_id + '-Sublist';
	    clientElem.appendChild(ruleList);
	    clientList.appendChild(clientElem);
	}
	divContainer.appendChild(clientList);
	// We're appending it to the body now so we can use the ID and
	// append to the appropriate ruleLists later
	document.body.appendChild(divContainer);

	var curCatObj;
	var ruleElem;
	// Now we'll go through the categorized array of rules and
	// build and append ruleElems to their apt clients
	for (i = 0; i < categorizedJSON.categorized.length; i++) {
	    curCatObj = categorizedJSON.categorized[i];
	    for (var j = 0; j < curCatObj.clients.length; j++) {
		ruleElem = document.createElement('li');
		ruleElem.appendChild(
		    document.createTextNode(curCatObj.ruleName)
		);

		document.getElementById(
		    curCatObj.clients[j].clientID + '-Sublist'
		).appendChild(ruleElem);
	    }
	}
    };

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/v1/get_categories');
    xhr.onreadystatechange = function() {
	if (xhr.readyState === 4) {
	    console.log(xhr.responseText);
	    document.body.removeChild(loadingHeader);
	    buildUI(JSON.parse(xhr.responseText));
	}
	// TODO: Handle error
    };
    xhr.send();

})();
