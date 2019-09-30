/**
 * Builds an element that displays the message.
 * @param {Message} message
 * @return {Element}
 */
function buildMessageDiv(message){
  const usernameDiv = document.createElement('div');
  usernameDiv.classList.add("left-align");
  usernameDiv.appendChild(document.createTextNode(message.user));

  const timeDiv = document.createElement('div');
  timeDiv.classList.add('right-align');
  timeDiv.appendChild(document.createTextNode(new Date(message.timestamp)));

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('message-header');
  headerDiv.appendChild(usernameDiv);
  headerDiv.appendChild(timeDiv);

  if (message.location_name){
    const locationDiv = document.createElement('div');
    locationDiv.classList.add('message-body');
    locationDiv.appendChild(document.createTextNode(message.location_name));
    headerDiv.appendChild(locationDiv);
  }
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('message-body');
  var renderedHtml = SimpleMDE.prototype.markdown(message.text.replace('&gt;', '>')); // Allow quotes
  renderedHtml = renderedHtml.replace(/<img /g, '<img class="w-100 p-1" ');
  bodyDiv.innerHTML = renderedHtml;

  const messageDiv = document.createElement('div');
  messageDiv.classList.add("message-div");
  messageDiv.appendChild(headerDiv);
  messageDiv.appendChild(bodyDiv);

  return messageDiv;
}

function createLocationLink(locationId, locationName) {
    var locationLink = document.createElement("a");
    if(typeof locationId == 'undefined') {
      location.href = "#";
    } else {
      locationLink.href = "/feed.html?locationid="+locationId+"&name="+locationName;
    }
    locationLink.classList.add('locationLink');
    locationLink.innerHTML = locationName;
    return locationLink;
}

function formatTimestamp(messageTime){
  var timestamp = new Date(messageTime);
  return timestamp.getFullYear()+"."+timestamp.getMonth()+"."+timestamp.getDate()
          +" "+
          timestamp.getHours()+":"+timestamp.getMinutes()+":"+timestamp.getSeconds();
}

function createDeleteButton(deleteConfirmationDiv){
  var deleteBtn = document.createElement('button');
  deleteBtn.type='button';
  deleteBtn.classList.add('delete');
  var icon = document.createElement('i');
  icon.classList.add('fa','fa-trash');
  deleteBtn.appendChild(icon);
  deleteBtn.onclick = function(){
    deleteConfirmationDiv.classList.remove('hide');
    deleteConfirmationDiv.classList.add('show');
  };
  return deleteBtn;
}

function deletePost(messageBlock) {
  messageBlock.style.minHeight = '0';
  messageBlock.style.margin = '0';
  messageBlock.style.height = messageBlock.scrollHeight + 'px';
  window.setTimeout(function(){messageBlock.style.height='0';}, 1);
  window.setTimeout(function(){
    var parent = messageBlock.parentNode;
    var next = messageBlock.nextSibling;
    parent.removeChild(messageBlock);
    if(!parent.hasChildNodes()) {
      document.getElementById('noPosts').hidden = false;
    } else {
      while(next != null) {
        if(next.classList.contains('timeline-inverted')) {
          next.classList.remove('timeline-inverted');
        } else {
          next.classList.add('timeline-inverted');
        }
        next = next.nextSibling;
      }
    }
  }, 200);
}

function createDeleteConfirmationDiv(message_id, location_id){
  var div = document.createElement('div');
  div.classList.add('deleteConfirmation','alert','alert-warning','hide');
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.classList.add('close');
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = function(){
    div.classList.remove('show');
    div.classList.add('hide');
  };
  var text = document.createTextNode('Are you sure you want to delete this post? ');
  var delLink = document.createElement('a');
  delLink.href = '#';
  delLink.appendChild(document.createTextNode('Delete'));
  delLink.onclick = function() {
    var xhttp = new XMLHttpRequest();
    var params = 'messageid='+message_id+'&locationid='+location_id;
    xhttp.open('POST', '/messages?'+params,true);
    xhttp.send();
    deletePost(div.parentNode.parentNode);
    return false;
  };
  div.appendChild(closeBtn);
  div.appendChild(text);
  div.appendChild(delLink);
  return div;
}


function buildMessageInTimeline(message, flip, viewingSelf){
  const messageDiv = document.createElement('div');
  messageDiv.classList.add("timeline-panel");

  const imageDiv = document.createElement('div');
  imageDiv.classList.add("timeline-image");

  const image = document.createElement('img');
  image.classList.add("rounded-circle");
  image.classList.add("img-fluid");

  const url = '/image-form-handler?user=' + message.user;
    fetch(url).then((response) => {
      return response.text();
    }).then((profilePicUrl) => {
      if(profilePicUrl == ''){
        image.src = "/img/default-profile-pic.jpeg";
      }else{
        image.src = profilePicUrl;
      }
    });

  image.style = "object-fit: cover; height: 100%; width: 100%;";
  image.alt ="";
  imageDiv.appendChild(image);

  const usernameDiv = document.createElement('div');
  usernameDiv.classList.add('timeline-heading');
  const usernameText = document.createElement('h4');

  var nicknameText = '';
  const nameUrl = '/nickname?user=' + message.user;
    fetch(nameUrl).then((response) => {
      return response.text();
    }).then((nickname) => {
      nicknameText = nickname;
      if (!/\S/.test(nickname)) {
        nicknameText = message.user;
      }

      usernameText.appendChild(document.createTextNode(nicknameText));
      usernameDiv.appendChild(usernameText);
    });

  const timeDiv = document.createElement('div');
  timeDiv.classList.add('timeline-body');
  timeText = document.createElement('p');
  timeText.classList.add('text-muted');
  timeText.appendChild(document.createTextNode(formatTimestamp(message.timestamp)));
  timeDiv.appendChild(timeText);

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('timeline-body');
  var renderedHtml = SimpleMDE.prototype.markdown(message.text.replace('&gt;', '>')); // Allow quotes
  renderedHtml = renderedHtml.replace(/<img /g, '<img class="w-100 p-1" ');
  bodyDiv.innerHTML = renderedHtml;

  if(viewingSelf) {
    const deleteConfirmationDiv = createDeleteConfirmationDiv(message.id, message.location_id);
    messageDiv.appendChild(deleteConfirmationDiv);
    messageDiv.appendChild(createDeleteButton(deleteConfirmationDiv));
  }

  messageDiv.appendChild(usernameDiv);
  messageDiv.appendChild(timeDiv);
  if (message.location_name){
      const locDiv = document.createElement('div');
      locDiv.classList.add('timeline-body');
      locText = document.createElement('p');
      locText.classList.add('text-muted');
      locText.appendChild(createLocationLink(message.location_id, message.location_name));
      locDiv.appendChild(locText);
      messageDiv.appendChild(locDiv);
  }
  messageDiv.appendChild(bodyDiv);

  const messageBlock = document.createElement('li');
  if(flip%2 == 1){
    messageBlock.classList.add('timeline-inverted');
  }
  messageBlock.appendChild(imageDiv);
  messageBlock.appendChild(messageDiv);

  return messageBlock;
}


function buildTimeline(messages, viewingSelf){
  const timeline = document.createElement('ul');
  timeline.classList.add("timeline");

  //When flip is odd, create "timeline-inverted"
  var flip = 0;
  for (message of messages){
    const messageDiv = buildMessageInTimeline(message, flip, viewingSelf);
    timeline.appendChild(messageDiv);
    flip++;
  }
  return timeline;
}
