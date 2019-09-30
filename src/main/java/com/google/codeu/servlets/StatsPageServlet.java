package com.google.codeu.servlets;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.codeu.data.Datastore;
import com.google.gson.JsonObject;
import com.google.gson.Gson;

/**
 * Handles fetching site statistics.
 */
@WebServlet("/stats")
public class StatsPageServlet extends HttpServlet{

  private Datastore datastore;

  @Override
  public void init() {
    datastore = new Datastore();
  }

  /**
   * Responds with site statistics in JSON.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {

    response.setContentType("application/json");

    String user = request.getParameter("user");
    String all = request.getParameter("all");

    if (all != null) {
      HashMap userMessageCounts = datastore.getAllUserMessageCount();
      Gson gson = new Gson();
      String json = gson.toJson(userMessageCounts);
      response.getOutputStream().println(json);
    }
    else if (user != null) {
      int userMessageCount = datastore.getUserMessageCount(user);
      JsonObject jsonObject = new JsonObject();
      jsonObject.addProperty("userMessageCount", userMessageCount);
      response.getOutputStream().println(jsonObject.toString());
    }
    else {
      int messageCount = datastore.getTotalMessageCount();
      int userCount = datastore.getTotalUserCount();
      double averageMessageLength = datastore.getAverageMessageLength();

      JsonObject jsonObject = new JsonObject();
      jsonObject.addProperty("messageCount", messageCount);
      jsonObject.addProperty("userCount", userCount);
      jsonObject.addProperty("averageMessageLength", averageMessageLength);
      response.getOutputStream().println(jsonObject.toString());
    }
  }
}
