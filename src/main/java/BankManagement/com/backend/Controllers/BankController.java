package BankManagement.com.backend.Controllers;

import BankManagement.com.backend.Entities.BankAccount;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import BankManagement.com.backend.Repositories.BankAccountRepository;
import jakarta.annotation.PostConstruct;

import java.util.HashMap;
import java.util.Optional;

// ! VERY IMPORTANT - IF U DO ANY CHANGES IN JAVA U HAVE TO RESTART THE SERVER FOR IT TO BE IN EFFECT

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

    @GetMapping("/Accounts/CheckExists/{id}")
    public ResponseEntity <BankAccount> checkAccountById (@PathVariable("id") Integer id) {
        Optional<BankAccount> accountOptional = this.bankAccountRepository.findById(id);

        if (!accountOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(accountOptional.get());
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

        accountToUpdate.setAccount_pin(account.getAccount_pin());

        if (account.getAccountType() != null) {
            accountToUpdate.setAccountType(account.getAccountType());
        }

        /*
        if (account.getEmail() != null) {
            accountToUpdate.setEmail(account.getEmail());
        }
        */

        BankAccount updatedAccount = this.bankAccountRepository.save(accountToUpdate);

        return updatedAccount;
    }

    // * for changing bank card amounts
    @CrossOrigin(origins = "*")
    @PutMapping("/Accounts/Pay/{id}")
    public BankAccount transferMoney (@PathVariable("id") Integer id, @RequestHeader("Amount") String amount) {
        System.out.println("Finding Account");
        Optional<BankAccount> bankAccountOptional = this.bankAccountRepository.findById(id);
        if (bankAccountOptional.isEmpty()) return null;
        System.out.println("Valid Account has been Found");

        float money = Float.parseFloat(amount);
        BankAccount accountToPay = bankAccountOptional.get();
        float newBalance = accountToPay.getAccountBalance() + money;

        System.out.println("Saving to account: " + accountToPay.getId());
        System.out.println("New Balance: " + newBalance);

        accountToPay.setAccountBalance(newBalance);
        BankAccount paidAccount = this.bankAccountRepository.save(accountToPay);

        return paidAccount;
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

    // ! LOGGING
    @PostConstruct
    public void showEndpoints() {
        System.out.println("Registered endpoint: /Cards/Accounts/Pay/{id}");
    }
}
