package BankManagement.com.backend.Controllers;

import java.util.HashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import BankManagement.com.backend.Entities.User;
import BankManagement.com.backend.Repositories.UserRepository;
import BankManagement.com.backend.Services.JwtService;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository UserRepository;
    private final JwtService jwtService;

    public UserController(UserRepository UserRepository, JwtService jwtService) {
        this.UserRepository = UserRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User newUser) {
        User userFromDb = UserRepository.findByEmail(newUser.getEmail());

        // if email hasnt been registered
        if (userFromDb != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }
        
        UserRepository.save(newUser);

        return ResponseEntity.ok(new HashMap<String, String>() {{put 
            ("message", "SignUp successful");
        }});
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User currUser) {

        User userFromDb = UserRepository.findByEmail(currUser.getEmail());

        // TODO: fix these json responses to be same syntax as the ok response
        if (userFromDb == null) {
            return ResponseEntity.status(401).body("Invalid Email");
        }

        if (!currUser.getPassword().equals(userFromDb.getPassword())) {
            return ResponseEntity.status(401).body("Invalid Password");
        }

        String token = jwtService.generateToken(currUser.getEmail());
        
        HashMap<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/user-info")
    public ResponseEntity<?> getUserInfo (@RequestHeader("Authorization") String token) { 
        if (token.startsWith("Bearer ")) token = token.substring(7);

        String email = jwtService.extractEmail(token);
        User user = UserRepository.findByEmail(email);

        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User Not Found!");

        HashMap<String, String> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("hasCard", String.valueOf(user.isHasCard()));

        return ResponseEntity.ok(response);
    }

    @CrossOrigin(origins = "*")
    @PutMapping("/user-info")
    public ResponseEntity<?> updateInfo (@RequestHeader("hasCard_changed") String isTrue,
    @RequestHeader("userEmail") String email) {

        User currUser = this.UserRepository.findByEmail(email);
        if (currUser == null) {
            return ResponseEntity.status(401).body("Invalid Email");
        }

        System.out.println("Found Valid Account");

        boolean hasCard = Boolean.parseBoolean(isTrue);
        currUser.setHasCard(hasCard);
        UserRepository.save(currUser);

        return ResponseEntity.ok().body(null);
    }
}
