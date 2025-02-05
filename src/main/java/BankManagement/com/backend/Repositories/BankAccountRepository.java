package BankManagement.com.backend.Repositories;

import org.springframework.data.repository.CrudRepository;
import BankManagement.com.backend.Entities.BankAccount;
public interface BankAccountRepository extends CrudRepository <BankAccount, Integer> {

}
