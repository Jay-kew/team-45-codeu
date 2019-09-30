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

 /**
  * Adds the default navigation links to the navigation bar.
  * (home, about, feed, statistics)
  */
function addDefaultNavigation() {
  const navigationElement = document.getElementById('navigation');
  if (!navigationElement) {
    console.warn('Navigation element not found!');
    return;
  }
  navigationElement.appendChild(
      createListItem(createLink('/', 'Home')));
  navigationElement.appendChild(
      createListItem(createLink('/feed.html', 'Feed')));
  navigationElement.appendChild(
      createListItem(createLink('/community.html', 'Community')));
  navigationElement.appendChild(
      createListItem(createLink('/stats.html', 'Statistics')));
  navigationElement.appendChild(
      createListItem(createLink('/aboutus.html', 'About Our Team')));
}

/**
 * Adds a login or logout link to the page, depending on whether the user is
 * already logged in.
 */
function addLoginOrLogoutLinkToNavigation() {
  const navigationElement = document.getElementById('navigation');
  if (!navigationElement) {
    console.warn('Navigation element not found!');
    return;
  }

  const navListElements = document.getElementsByClassName("nav-item px-lg-4");
  fetch('/login-status')
      .then((response) => {
        return response.json();
      })
      .then((loginStatus) => {
        if (loginStatus.isLoggedIn) {
          navigationElement.insertBefore(createListItem(createLink(
              '/user-page.html?user=' + loginStatus.username, 'Your Page')),
              navListElements[2]);

          navigationElement.appendChild(
              createListItem(createLink('/logout', 'Logout')));
        } else {
          navigationElement.appendChild(
              createListItem(createLink('/login', 'Login')));
        }
      });
}

function highlightCurrent() {
  const path = window.location.pathname.replace(/\.html.*/, "");
  const navAElements = document.getElementsByClassName("nav-link text-uppercased text-expanded");
  const navListElements = document.getElementsByClassName("nav-item px-lg-4");
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('user');
  
  fetch('/login-status')
  .then((response) => {
    return response.json();
  })
  .then((loginStatus) => {
    let index = {
      "home" : 0,
      "feed" : 1,
      "user-page" : 2,
      "community" : loginStatus.isLoggedIn ? 3 : 2,
      "stats" : loginStatus.isLoggedIn ? 4 : 3,
      "aboutus" : loginStatus.isLoggedIn ? 5 : 4
    };

    if (path.includes("feed")) {
      navAElements[index["feed"]].appendChild(createSpan());
      navListElements[index["feed"]].classList.add("active");
    } else if (path.includes("user-page")) {
      if(loginStatus.isLoggedIn && loginStatus.username == username) {
        navAElements[index["user-page"]].appendChild(createSpan());
        navListElements[index["user-page"]].classList.add("active");
      } else {
        navAElements[index["community"]].appendChild(createSpan());
        navListElements[index["community"]].classList.add("active");
      }
    } else if (path.includes("community")) {
      navAElements[index["community"]].appendChild(createSpan());
      navListElements[index["community"]].classList.add("active");
    } else if (path.includes("stats")) {
      navAElements[index["stats"]].appendChild(createSpan());
      navListElements[index["stats"]].classList.add("active");
    } else if (path.includes("aboutus")) {
      navAElements[index["aboutus"]].appendChild(createSpan());
      navListElements[index["aboutus"]].classList.add("active");
    } else {
      navAElements[index["home"]].appendChild(createSpan());
      navListElements[index["home"]].classList.add("active");
    }
  });
}

function createSpan() {
  const spanElement = document.createElement('span');
  spanElement.appendChild(document.createTextNode("(current)"));
  spanElement.classList.add("sr-only");
  return spanElement;
}

/**
 * Creates an li element.
 * @param {Element} childElement
 * @return {Element} li element
 */

function createListItem(childElement) {
  const listItemElement = document.createElement('li');
  listItemElement.appendChild(childElement);
  listItemElement.classList.add("nav-item");
  listItemElement.classList.add("px-lg-4");
  return listItemElement;
}

/**
 * Creates an anchor element.
 * @param {string} url
 * @param {string} text
 * @return {Element} Anchor element
 */
function createLink(url, text) {
  const linkElement = document.createElement('a');
  linkElement.appendChild(document.createTextNode(text));
  linkElement.href = url;
  linkElement.classList.add("nav-link")
  linkElement.classList.add("text-uppercased")
  linkElement.classList.add("text-expanded")
  return linkElement;
}

// Constructs navigation bar
function buildNavigation(){
  addDefaultNavigation();
  addLoginOrLogoutLinkToNavigation();
  highlightCurrent();
}

// Constructs navigation bar and builds UI
function initiateUI(){
  buildNavigation();
  if (typeof buildUI === "function"){ // check that buildUI() exists
    buildUI();
  } else {
    console.info("INFO: buildUI() is not defined");
  }
}
