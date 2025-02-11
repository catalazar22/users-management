package com.catalazar.supportportal.service;

import com.catalazar.supportportal.User;
import com.catalazar.supportportal.exception.domain.EmailExistException;
import com.catalazar.supportportal.exception.domain.EmailNotFoundException;
import com.catalazar.supportportal.exception.domain.UserNotFoundException;
import com.catalazar.supportportal.exception.domain.UsernameExistException;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.List;

public interface UserService {
    User register(String firstName, String lastName, String username, String email) throws UserNotFoundException, EmailExistException, UsernameExistException, MessagingException;

    List<User> getUsers();

    User findUserByUsername(String useername);

    User findUserByEmail(String email);

    User addNewUser(String firstName , String lastName , String username , String email , String role , boolean isNonLocked , boolean isActive , MultipartFile profileImage) throws UserNotFoundException, EmailExistException, UsernameExistException, IOException;

    User updateUser(String currentUsername , String newFirstName, String newLastName , String newUsername , String newEmail , String role , boolean isNonLocked , boolean isActive , MultipartFile profileImage) throws UserNotFoundException, EmailExistException, UsernameExistException, IOException;

    void deleteUser(String username) throws IOException;

    void resetPassword(String email) throws EmailNotFoundException, MessagingException;

    User updateProfileImage(String username , MultipartFile profileImage) throws UserNotFoundException, EmailExistException, UsernameExistException, IOException;
}
