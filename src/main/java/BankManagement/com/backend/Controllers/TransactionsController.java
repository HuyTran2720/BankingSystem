package BankManagement.com.backend.Controllers;

import BankManagement.com.backend.Entities.BankAccount;
import BankManagement.com.backend.Entities.Transactions;
import BankManagement.com.backend.Repositories.TransactionsRepository;

import jakarta.annotation.PostConstruct;

import java.util.HashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Transactions")
public class TransactionsController {
    private final TransactionsRepository transactionsRepository;

    // depdnency injection
    public TransactionsController (final TransactionsRepository transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }

    // ! this may benefit better by finding some way to transactions for specific id, rather than all of them and sorting
    @GetMapping("/History")
    public Iterable<Transactions> findAllTransactions () {
        return this.transactionsRepository.findAll();
    }

    // TODO: implememnt proper checks
    @PostMapping("/CreateTransaction")
    public ResponseEntity<?> createTransaction (@RequestBody Transactions newTransaction) {
        
        this.transactionsRepository.save(newTransaction);

        HashMap<String, Transactions> response = new HashMap<>();
        response.put("message", newTransaction);

        return ResponseEntity.ok(response);
    }
}
