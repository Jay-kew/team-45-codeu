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

package com.google.codeu.data;

import com.google.appengine.api.datastore.*;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Set;
import java.util.HashSet;
import java.util.HashMap;

/** Provides access to the data stored in Datastore. */
public class Datastore {

  private DatastoreService datastore;

  public Datastore() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  /** Stores the Location in Datastore. */
  public void storeLocation(Location location){
    Entity locationEntity = new Entity("Location", location.getId());
    locationEntity.setProperty("id", location.getId());
    locationEntity.setProperty("name", location.getName());
    locationEntity.setProperty("lat", location.getLat());
    locationEntity.setProperty("lng", location.getLng());
    locationEntity.setProperty("count", 1);

    datastore.put(locationEntity);
  }

  /** Stores the Message in Datastore. */
  public void storeMessage(Message message) {
    Entity messageEntity = new Entity("Message", message.getId().toString());
    messageEntity.setProperty("user", message.getUser());
    messageEntity.setProperty("text", message.getText());
    messageEntity.setProperty("timestamp", message.getTimestamp());
    messageEntity.setProperty("location_id", message.getLocationId());
    messageEntity.setProperty("location_name", message.getLocationName());

    datastore.put(messageEntity);
  }

  public void deleteMessage(String messageId, String locationId) {
    Key messageKey = KeyFactory.createKey("Message", messageId);
    Key locationKey = KeyFactory.createKey("Location", locationId);
    try{
      datastore.delete(messageKey);
      if(locationId.length() > 0){
        Entity locationEntity = retrieveLocationEntity(locationId);
        if(locationEntity != null) {
          updateLocationCount(locationEntity, -1);
        }
      }
    } catch(Exception e) {
      System.err.println(e);
    }
  }

  /**
   * Gets messages posted by a specific user.
   *
   * @return a list of messages posted by the user, or empty list if user has never posted a
   *     message. List is sorted by time descending.
   */
  public List<Message> getMessages(String user) {
    Query query = new Query("Message")
            .setFilter(new Query.FilterPredicate("user", FilterOperator.EQUAL, user))
            .addSort("timestamp", SortDirection.DESCENDING);

    return prepareMessages(query);

  }
  /**
   * Gets all messages in database.
   *
   * @return a list of messages, or empty list if there is no message.
   * List is sorted by time descending.
   */
  public List<Message> getAllMessages(){
    Query query = new Query("Message")
            .addSort("timestamp", SortDirection.DESCENDING);

    return prepareMessages(query);
  }

  /** Return a list of messages for a location. */ 
  public List<Message> getMessagesForLocation(String locationId) {
    Query query = new Query("Message")
              .setFilter(new Query.FilterPredicate("location_id", FilterOperator.EQUAL, locationId))
              .addSort("timestamp", SortDirection.DESCENDING);

    return prepareMessages(query);
  }
  
  public Entity retrieveLocationEntity(String id){
    Key key = KeyFactory.createKey("Location", id);
    try{
      return datastore.get(key);
    }
    catch (EntityNotFoundException e){
      return null;
    }
  }

  public void updateLocationCount(Entity locationEntity, int increment) {
    int count = (int)(long)locationEntity.getProperty("count");
    if(count + increment == 0) {
      datastore.delete(locationEntity.getKey());
    } else {
      locationEntity.setProperty("count", count + increment);

      datastore.put(locationEntity);
    }
  }

  /**
   * Gets a specific location.
   *
   * @return a location object.
   */
  public Location getLocation(Entity locationEntity){
    String id = (String) locationEntity.getProperty("id");
    String name = (String) locationEntity.getProperty("name");
    double lat = (double) locationEntity.getProperty("lat");
    double lng = (double) locationEntity.getProperty("lng");
    Location location = new Location(id, name, lat, lng);
    return location;
  }

  /**
   * Gets all locations in database.
   *
   * @return a list of locations, or empty list if there is no location.
   * List is sorted by count.
   */
  public List<Location> getAllLocations(){
    Query query = new Query("Location")
            .addSort("count", SortDirection.DESCENDING);

    return prepareLocations(query);
  }

  /**
   * Prepare messages from retrieved data.
   *
   * @return a list of messages, or empty list if there is no message.
   * List is sorted by time descending.
   */
  public List<Message> prepareMessages(Query query){
    List<Message> messages = new ArrayList<>();

    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      try {
        String idString = entity.getKey().getName();
        UUID id = UUID.fromString(idString);
        String user = (String) entity.getProperty("user");
        String text = (String) entity.getProperty("text");
        long timestamp = (long) entity.getProperty("timestamp");
        String location_id = (String) entity.getProperty("location_id");
        String location_name = (String) entity.getProperty("location_name");
        Message message = new Message(id, user, text, timestamp, location_id, location_name);
        messages.add(message);
      } catch (Exception e) {
        System.err.println("Error reading message.");
        System.err.println(entity.toString());
        e.printStackTrace();
      }
    }

    return messages;
  }

  /**
   * Prepare locations from retrieved data.
   *
   * @return a list of locations, or empty list if there is no location.
   * List is sorted by count.
   */
  public List<Location> prepareLocations(Query query){
    List<Location> locations = new ArrayList<>();

    PreparedQuery results = datastore.prepare(query);

    for (Entity locationEntity : results.asIterable()) {
      try {
        String id = (String) locationEntity.getProperty("id");
        String name = (String) locationEntity.getProperty("name");
        double lat = (double) locationEntity.getProperty("lat");
        double lng = (double) locationEntity.getProperty("lng");
        int count = (int)(long)locationEntity.getProperty("count");
        Location location = new Location(id, name, lat, lng);
        location.setCount(count);
        locations.add(location);
      } catch (Exception e) {
        System.err.println("Error reading message.");
        System.err.println(locationEntity.toString());
        e.printStackTrace();
      }
    }

    return locations;
  }

  /** Stores the User in Datastore. */
  public void storeUser(User user) {
    Entity userEntity = new Entity("User", user.getEmail());
    userEntity.setProperty("email", user.getEmail());
    userEntity.setProperty("aboutMe", user.getAboutMe());
    userEntity.setProperty("profilePicUrl", user.getProfilePicUrl());
    userEntity.setProperty("nickname", user.getNickname());
    datastore.put(userEntity);
  }

  /**
   * Returns the User owned by the email address, or
   * null if no matching User was found.
   */
  public User getUser(String email) {

    Query query = new Query("User")
        .setFilter(new Query.FilterPredicate("email", FilterOperator.EQUAL, email));
    PreparedQuery results = datastore.prepare(query);
    Entity userEntity = results.asSingleEntity();
    if(userEntity == null) {
      return null;
    }

    String aboutMe = (String) userEntity.getProperty("aboutMe");
    String profilePicUrl = (String) userEntity.getProperty("profilePicUrl");
    String nickname = (String) userEntity.getProperty("nickname");
    User user = new User(email, aboutMe, profilePicUrl, nickname);

    return user;
  }

  public Set<String> getUsers(){
    Set<String> users = new HashSet<>();
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    for(Entity entity : results.asIterable()) {
        users.add((String) entity.getProperty("user"));
    }
    return users;
  }

  /** Returns the total number of messages for all users. */
  public int getTotalMessageCount(){
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    return results.countEntities(FetchOptions.Builder.withDefaults());
  }

  public HashMap<String, Integer> getAllUserMessageCount() {
    HashMap<String, Integer>  userCounts = new HashMap();
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    for (Entity entity : results.asIterable()) {
      userCounts.putIfAbsent((String) entity.getProperty("user"), 0);
      userCounts.replace((String) entity.getProperty("user"),userCounts.getOrDefault((String) entity.getProperty("user"),0) + 1);
    }
    return userCounts;
  }

  public int getUserMessageCount(String email) {
    Query query = new Query("User")
        .setFilter(new Query.FilterPredicate("email", FilterOperator.EQUAL, email));
    PreparedQuery results = datastore.prepare(query);
    return results.countEntities(FetchOptions.Builder.withDefaults());
  }

  /** Returns the total number of users with messages. */
  public int getTotalUserCount(){
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    Set users = new HashSet();
    for (Entity message : results.asList(FetchOptions.Builder.withDefaults())){
      users.add(message.getProperty("user"));
    }
    return users.size();
  }

  /** Returns the average message length. */
  public double getAverageMessageLength(){
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    List<Entity> resultsList = results.asList(FetchOptions.Builder.withDefaults());
    Integer sum = 0;
    for (Entity message : resultsList){
      sum += message.getProperty("text").toString().length();
    }
    return (resultsList.size() == 0) ? 0 : sum.doubleValue()/resultsList.size();
  }

}
