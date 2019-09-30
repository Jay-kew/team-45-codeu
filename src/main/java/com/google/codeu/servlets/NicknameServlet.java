package com.google.codeu.servlets;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.codeu.data.Datastore;
import com.google.codeu.data.User;
import java.util.Arrays;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;

/**
 * Handles fetching and saving nickname of user.
 */
@WebServlet("/nickname")
public class NicknameServlet extends HttpServlet {

  private Datastore datastore;

  @Override
  public void init() {
    datastore = new Datastore();
  }

  /**
   * Responds with the nickname for a particular user.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {

    response.setContentType("text/html");

    String user = request.getParameter("user");

    if(user == null || user.equals("")) {
      // Request is invalid, return empty response
      return;
    }

    User userData = datastore.getUser(user);

    if(userData == null || userData.getNickname() == null) {
      return;
    }

    response.getOutputStream().println(userData.getNickname());
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {

    UserService userService = UserServiceFactory.getUserService();
    if (!userService.isUserLoggedIn()) {
      response.sendRedirect("/index.html");
      return;
    }

    String userEmail = userService.getCurrentUser().getEmail();

    User userData = datastore.getUser(userEmail);
    String aboutMe = "";

    if (userData != null && userData.getAboutMe() != null) {
      aboutMe = userData.getAboutMe();
    }

    String profilePicUrl = "";

    if (userData != null && userData.getProfilePicUrl() != null) {
      profilePicUrl = userData.getProfilePicUrl();
    }

    String nickname = Jsoup.clean(request.getParameter("nickname"), Whitelist.none());

    User user = new User(userEmail, aboutMe, profilePicUrl, nickname);
    datastore.storeUser(user);

    response.sendRedirect("/user-page.html?user=" + userEmail);
  }
}