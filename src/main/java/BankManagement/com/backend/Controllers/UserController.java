package BankManagement.com.backend.Controllers;

import java.util.HashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import BankManagement.com.backend.Entities.User;
import BankManagement.com.backend.Repositories.UserRepository;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository UserRepository;

    public UserController(UserRepository UserRepository) {
        this.UserRepository = UserRepository;
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

        return ResponseEntity.ok(new HashMap<String, String>() {{put 
            ("message", "Login successful");
        }});
    }
}
