package BankManagement.com.backend.Repositories;

import BankManagement.com.backend.Entities.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository <User, Integer> {
    User findByEmail(String email);
}
