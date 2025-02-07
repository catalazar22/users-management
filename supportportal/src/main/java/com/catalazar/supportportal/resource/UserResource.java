package com.catalazar.supportportal.resource;

import com.catalazar.supportportal.HttpResponse;
import com.catalazar.supportportal.User;
import com.catalazar.supportportal.UserPrincipal;
import com.catalazar.supportportal.exception.domain.*;
import com.catalazar.supportportal.service.UserService;
import com.catalazar.supportportal.utility.JWTTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static com.catalazar.supportportal.constant.FileConstant.*;
import static com.catalazar.supportportal.constant.SecurityConstant.JWT_TOKEN_HEADER;
import static org.springframework.http.HttpStatus.*;
import static org.springframework.util.MimeTypeUtils.IMAGE_JPEG_VALUE;

@RestController
@RequestMapping(path = {"/" , "/user"})
public class UserResource extends ExceptionHandling {
    public static final String EMAIL_SENT = "An email with a new password was sent to: ";
    public static final String USER_DELETED_SICCESSFULLY = "User deleted siccessfully";
    private UserService userService;
    private AuthenticationManager authenticationManager;
    private JWTTokenProvider jwtTokenProvider;

    @Autowired
    public UserResource(UserService userService, AuthenticationManager authenticationManager, JWTTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }


    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        authenticate(user.getUsername(), user.getPassword());
        User loginUser = userService.findUserByUsername(user.getUsername());
        UserPrincipal userPrincipal = new UserPrincipal(loginUser);
        HttpHeaders jwtHeader = getLwtHeader(userPrincipal);
        return new ResponseEntity<>(loginUser , jwtHeader ,  OK);
    }


    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) throws UserNotFoundException, EmailExistException, UsernameExistException, MessagingException {
        User newUser = userService.register(user.getFirstName() , user.getLastName() , user.getUsername() , user.getEmail());
        return new ResponseEntity<>(newUser , OK);
    }

    @PostMapping("/add")
    public ResponseEntity<User> addNewUser(@RequestParam("firstName") String firstName,
                                           @RequestParam("lastName") String  lastName,
                                           @RequestParam("username") String username,
                                           @RequestParam("email") String email,
                                           @RequestParam("role") String role,
                                           @RequestParam("isActive") String isActive,
                                           @RequestParam("isNonLocked") String isNonLocked,
                                           @RequestParam(value = "profileImage" , required = false) MultipartFile profileImage)
                                            throws UserNotFoundException, EmailExistException, IOException, UsernameExistException {

    User newUser = userService.addNewUser(firstName , lastName , username , email , role ,
           Boolean.parseBoolean(isNonLocked) , Boolean.parseBoolean(isActive) , profileImage );

    return new ResponseEntity<>(newUser , OK);
    }

    @PostMapping("/update")
    public ResponseEntity<User> update(@RequestParam("currentUsername") String currentUsername,
                                       @RequestParam("firstName") String firstName,
                                           @RequestParam("lastName") String  lastName,
                                           @RequestParam("username") String username,
                                           @RequestParam("email") String email,
                                           @RequestParam("role") String role,
                                           @RequestParam("isActive") String isActive,
                                           @RequestParam("isNonLocked") String isNonLocked,
                                           @RequestParam(value = "profileImage" , required = false) MultipartFile profileImage)
            throws UserNotFoundException, EmailExistException, IOException, UsernameExistException {

        User updatedUser = userService.updateUser(currentUsername , firstName , lastName , username , email , role ,
                Boolean.parseBoolean(isNonLocked) , Boolean.parseBoolean(isActive) , profileImage );

        return new ResponseEntity<>(updatedUser , OK);
    }

    @GetMapping("/find/{username}")
    public ResponseEntity<User> getUser(@PathVariable("username") String username){
        User user = userService.findUserByUsername(username);
        return new ResponseEntity<>(user , OK);
    }

    @GetMapping("/list")
    public ResponseEntity<List<User>> getAllUsers (){
        List<User> users = userService.getUsers();
        return new ResponseEntity<>(users, OK);
    }

    @GetMapping("/resetPassword/{email}")
    public ResponseEntity<HttpResponse> resetPassword(@PathVariable("email") String email) throws EmailNotFoundException, MessagingException {
     userService.resetPassword(email);
     return response(OK , EMAIL_SENT + email);
    }

    @DeleteMapping("/delete/{username}")
    @PreAuthorize("hasAuthority('user:delete')")
    public ResponseEntity<HttpResponse> deleteUser(@PathVariable("username") String username) throws IOException {
        userService.deleteUser(username);
        return response(OK , USER_DELETED_SICCESSFULLY);
    }

    @PostMapping("/updadteProfileImage")
    public ResponseEntity<User> updateProfileImage(@RequestParam("username") String username, @RequestParam(value = "profileImage") MultipartFile profileImage)
            throws UserNotFoundException, EmailExistException, IOException, UsernameExistException {

        User user = userService.updateProfileImage(username , profileImage);
        return new ResponseEntity<>(user , OK);
    }

    private ResponseEntity<HttpResponse> response(HttpStatus httpStatus, String message) {
        return new ResponseEntity<>(new HttpResponse(httpStatus.value() , httpStatus , httpStatus.getReasonPhrase().toUpperCase() , message.toUpperCase()) , httpStatus);
    }

    @GetMapping(path = "/image/{username}/{fileName}" , produces = IMAGE_JPEG_VALUE)    //asta e pentru cand deja are o poza de profil in folder, nu cand trb sa ii generam noi una
    public byte[] getProfileImage(@PathVariable("username") String username , @PathVariable("fileName") String fileName) throws IOException {
        return Files.readAllBytes(Paths.get(USER_FOLDER + username + FORWARD_SLASH + fileName));
    }

    @GetMapping(path = "/image/profile/{username}" , produces = IMAGE_JPEG_VALUE)    //asta e pentru cand punem o poza random cu roboti
    public byte[] getTempProfileImage(@PathVariable("username") String username) throws IOException {
        URL url = new URL(TEMP_PROFILE_IMAGE_BASE_URL + username);//aici doar avem URL-ul
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();//aici stocam datele care vin de la stream(url)
        try (InputStream inputStream = url.openStream()){
            int bytesRead;
            byte[] chunk = new byte[1024];//cate caractere din stream url vrem sa citim(le citim pe rand)
            while((bytesRead = inputStream.read(chunk)) > 0 ){
                byteArrayOutputStream.write(chunk , 0 , bytesRead); // citim chunk, de la 0 pana la bytesread

            }
        }
        return byteArrayOutputStream.toByteArray();
    }

    private HttpHeaders getLwtHeader(UserPrincipal user) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(JWT_TOKEN_HEADER , jwtTokenProvider.generateJWTToken(user));
        return headers;
    }

    private void authenticate(String username , String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username , password));

    }

}



