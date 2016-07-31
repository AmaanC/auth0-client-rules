var xhr = new XMLHttpRequest();
xhr.open('GET', '/api/v1/get_categories');
xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
	console.log(xhr.responseText);
    }
};
xhr.send();
