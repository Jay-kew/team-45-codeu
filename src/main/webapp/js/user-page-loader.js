/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Get ?user=XYZ parameter value
const urlParams = new URLSearchParams(window.location.search);
const parameterUsername = urlParams.get('user');

// URL must include ?user=XYZ parameter. If not, redirect to homepage.
if (!parameterUsername) {
  window.location.replace('/');
}

/** Sets the page title based on the URL parameter username. */
function setPageTitle() {
  document.title = 'User Page - ' + parameterUsername;
}

function setAboutMe() {
  var form = document.createElement("form");
  var aboutMeText = document.createElement("input");
  var text = document.getElementById("about-me-text-logged-in").innerText;
  if (text==null) {text="This user has not entered self-introduction yet.";}

  form.method = "POST";
  form.action = "/about";

  aboutMeText.value=text;
  aboutMeText.name="about-me";
  form.appendChild(aboutMeText);
  document.body.appendChild(form);
  form.submit();
}

function setNickname() {
  var form = document.createElement("form");
  var nicknameText = document.createElement("input");
  var text = document.getElementById("nickname-text-logged-in").innerText;
  if (text==null) {text="This user has not entered a nickname yet.";}

  form.method = "POST";
  form.action = "/nickname";

  nicknameText.value=text;
  nicknameText.name="nickname";
  form.appendChild(nicknameText);
  document.body.appendChild(form);
  form.submit();
}

/**
 * Build message form and messages depending on the user's login status.
 */
function checkIfViewingSelf() {
  fetch('/login-status')
    .then((response) => {
        return response.json();
      })
    .then((loginStatus) => {
      if (loginStatus.isLoggedIn &&
          loginStatus.username == parameterUsername) {
        document.getElementById('new-post').classList.remove('hidden');
        document.getElementById('about-me-container-logged-in').classList.remove('hidden');
        fetchMessages(true);
        return '-logged-in';
      }
      else{
        document.getElementById('about-me-container-not-logged-in').classList.remove('hidden');
        fetchMessages(false);
        return '-not-logged-in';
      }
    })
    .then((statusId) => {

      //fetches nickname of user from server
      const nameUrl = '/nickname?user=' + parameterUsername;
      fetch(nameUrl).then((response) => {
        return response.text();
      }).then((nickname) => {
        const nicknameContainer = document.getElementById('nickname-text' + statusId);
        if (!/\S/.test(nickname)) {
          nickname = "This user has not entered a nickname yet.";
        }
        nicknameContainer.innerHTML = nickname;
      });

      //fetches about me information of user from server
      const aboutUrl = '/about?user=' + parameterUsername;
      fetch(aboutUrl).then((response) => {
        return response.text();
      }).then((aboutMe) => {
        const aboutMeContainer = document.getElementById('about-me-text' + statusId);
        if(!/\S/.test(aboutMe)){
          aboutMe = 'This user has not entered any information yet.';
        }
        aboutMeContainer.innerHTML = aboutMe;
      });

      //fetch profile picture of user from server
      fetchProfilePic(statusId);
  });
}

/**Fetches profile pic of user**/
function fetchProfilePic(statusId){
  const url = '/image-form-handler?user=' + parameterUsername;
  fetch(url).then((response) => {
    return response.text();
  }).then((profilePicUrl) => {
    const profilePicContainer = document.getElementById('profile-pic-container' + statusId);
    if(profilePicUrl == ''){
      profilePicUrl = 'This user has not uploaded any profile picture yet.';
    }else{
      profilePicUrl = '<img class=\"rounded-circle square\" style=\"object-fit: cover;\" src=\"' + profilePicUrl + '\" />';
    }
    profilePicContainer.innerHTML = profilePicUrl;

  });
}

function buildNoPostsDiv(viewingSelf) {
  var noPostsDiv = document.createElement('div');
  noPostsDiv.id = 'noPosts';
  var text = document.createTextNode('This user has no posts yet.');
  if(viewingSelf){
    text = document.createTextNode('You have no posts yet.');
  }
  var para = document.createElement('p');
  para.appendChild(text);
  noPostsDiv.appendChild(para);
  noPostsDiv.hidden = true;
  return noPostsDiv;
}

/** Fetches messages and add them to the page. */
function fetchMessages(viewingSelf) {
  const url = '/messages?user=' + parameterUsername;
  fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((messages) => {
        const messagesContainer = document.getElementById('message-container');
        messagesContainer.innerHTML = '';
        var noPostsDiv = buildNoPostsDiv(viewingSelf);
        messagesContainer.appendChild(noPostsDiv);
        if(messages.length == 0) noPostsDiv.hidden = false;
        messagesContainer.appendChild(buildTimeline(messages,viewingSelf));
      });
}

function loadMarkdownEditor() {
  let simplemde = new SimpleMDE({
    autoDownloadFontAwesome: true,
  	autosave: {
  		enabled: true,
  		uniqueId: "message "
  	},
  	element: document.getElementById("message-input"),
  	forceSync: true,
  	status: false
  });
}

/** Fetches Blobstore url then displays form that supports image upload. */
function fetchBlobstoreUrlAndShowForm() {
  fetch('/blobstore-upload-url')
    .then((response) => {
      return response.text();
    })
    .then((imageUploadUrl) => {
      const messageForm = document.getElementById('upload-dp');
      messageForm.action = imageUploadUrl;
      messageForm.classList.remove('hidden');
    });
}

function redirectToNewPost() {
  location.href = "new-post.html";
}

/** Fetches data and populates the UI of the page. */
function buildUI() {
  setPageTitle();
  checkIfViewingSelf();
  fetchBlobstoreUrlAndShowForm();
}