package com.google.codeu.data;

public class User {

  private String email;
  private String aboutMe;
  private String profilePicUrl;
  private String nickname;

  public User(String email, String aboutMe, String profilePicUrl, String nickname) {
    this.email = email;
    this.aboutMe = aboutMe;
    this.profilePicUrl = profilePicUrl;
    this.nickname = nickname;
  }

  public String getEmail(){
    return email;
  }

  public String getAboutMe() {
    return aboutMe;
  }

  public String getProfilePicUrl() {
    return profilePicUrl;
  }

  public String getNickname() {
    return nickname;
  }
}