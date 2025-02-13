package BankManagement.com.backend.Controllers;

import BankManagement.com.backend.Entities.BankAccount;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import BankManagement.com.backend.Repositories.BankAccountRepository;

import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/Cards")
public class BankController {
    private final BankAccountRepository bankAccountRepository;

    // * dependency injection for BankAccountRepository bean
    public BankController (final BankAccountRepository bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }

    // ! Read
    @GetMapping("/Accounts")
    public Iterable <BankAccount> getAllAccounts () {
        return this.bankAccountRepository.findAll();
    }

    @GetMapping("/Accounts/{id}")
    public Optional <BankAccount> getAccountById (@PathVariable("id") Integer id) {
        return this.bankAccountRepository.findById(id);
    }

    // ! Create
    // * saving a new account
    @PostMapping("/CreateAccount")
    public ResponseEntity<?> createAccount (@RequestBody BankAccount newAccount) {
        HashMap<String, BankAccount> response = new HashMap<>();
        response.put("message", newAccount);

        this.bankAccountRepository.save(newAccount);

        return ResponseEntity.ok(response);
    }

    // ! Update
    // * updating an account
    @PutMapping("/Accounts/{id}")
    public BankAccount updateAccount (@PathVariable("id") Integer id, @RequestBody BankAccount account) {
        Optional<BankAccount> bankAccountOptional = this.bankAccountRepository.findById(id);
        if (bankAccountOptional.isEmpty()) return null;

        BankAccount accountToUpdate = bankAccountOptional.get();
        if (account.getAccountName() != null) {
            accountToUpdate.setAccountName(account.getAccountName());
        }

        Float nullfloat = null;
        if (account.getAccountBalance() != nullfloat) {
            accountToUpdate.setAccountBalance(account.getAccountBalance());
        }
        if (account.getAccountType() != null) {
            accountToUpdate.setAccountType(account.getAccountType());
        }
        if (account.getEmail() != null) {
            accountToUpdate.setEmail(account.getEmail());
        }
        BankAccount updatedAccount = this.bankAccountRepository.save(accountToUpdate);

        return updatedAccount;
    }

    // ! DELETE
    @DeleteMapping("/Accounts/{id}")
    public BankAccount deleteAccount (@PathVariable("id") Integer id) {
        Optional<BankAccount> accountToDeleteOptional = this.bankAccountRepository.findById(id);
        if (accountToDeleteOptional.isEmpty()) return null;

        BankAccount accountToDelete = accountToDeleteOptional.get();
        this.bankAccountRepository.delete(accountToDelete);

        return accountToDelete;
    }
}
