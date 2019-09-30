/** Fetches users and adds them to the page. */
function fetchUserList(){
  const url = '/stats?all=true';
  fetch(url).then((response) => {
    return response.json();
  }).then((userMessageCounts) => {
    const list = document.getElementById('list');
    list.innerHTML = '';
    for (var user in userMessageCounts) {
      if (userMessageCounts.hasOwnProperty(user)) {
          list.appendChild(buildUserListItem(user, userMessageCounts[user]));
      }
    }
  });
}

/**
 * Builds a link element that contains a link to a user page, e.g.
 * <a href="/user-page.html?user=test@example.com" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">test@example.com<span class="badge badge-pill badge-secondary">1</span></a>
 */
function buildUserListItem(user, count){
  const countBadge = document.createElement('span');
  countBadge.appendChild(document.createTextNode(count));
  countBadge.classList.add('badge');
  countBadge.classList.add('badge-pill');
  countBadge.classList.add('badge-secondary');

  const userLink = document.createElement('a');
  userLink.setAttribute('href', '/user-page.html?user=' + user);
  userLink.appendChild(document.createTextNode(user));
  userLink.classList.add('list-group-item');
  userLink.classList.add('list-group-item-action');
  userLink.classList.add('d-flex');
  userLink.classList.add('justify-content-between');
  userLink.classList.add('align-items-center');
  userLink.appendChild(countBadge);
  return userLink;
}

/** Fetches data and populates the UI of the page. */
function buildUI(){
 fetchUserList();
}
