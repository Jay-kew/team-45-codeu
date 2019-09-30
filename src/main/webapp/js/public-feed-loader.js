const urlParams = new URLSearchParams(window.location.search);
const locationId = urlParams.get('locationid');

// Fetch messages and add them to the page.
function fetchMessages(){
  var url = '/feed';
  if(locationId != null) {
    var location = document.getElementById("location");
    location.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + urlParams.get('name');
    url += '?locationid=' + locationId;
  }
  fetch(url).then((response) => {
  return response.json();
}).then((messages) => {
  const messageContainer = document.getElementById('message-container');
  if(messages.length == 0){
    messageContainer.innerHTML = '<p>There are no posts yet.</p>';
  }
  else{
    messageContainer.innerHTML = '';
  }
  messageContainer.appendChild(buildTimeline(messages, false));
});
}

// Fetch data and populate the UI of the page.
function buildUI(){
  fetchMessages();
}