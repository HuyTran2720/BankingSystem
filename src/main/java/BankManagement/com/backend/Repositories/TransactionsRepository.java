package BankManagement.com.backend.Repositories;

import org.springframework.data.repository.CrudRepository;
import BankManagement.com.backend.Entities.Transactions;

public interface TransactionsRepository extends CrudRepository <Transactions, Integer> {

}
