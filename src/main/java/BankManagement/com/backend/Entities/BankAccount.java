package BankManagement.com.backend.Entities;
import jakarta.persistence.*;
import java.util.Random;

// import org.springframework.beans.factory.annotation.Value;

@Entity
@Table(name = "accounts")
public class BankAccount {

    @Id
    private Integer id;

    @PrePersist
    void generateId () {
        if (this.id == null)
        this.id = randomGeneratedId();
    }

    int randomGeneratedId () {
        Random generator = new Random();
        return 10000000 + generator.nextInt(90000000);
    }

    // * use from users data
    @Column (name = "account_name")
    private String accountName;

    @Column (name = "account_balance")
    private float accountBalance;

    // * use from users data
    @Column (name = "email")
    private String email;

    @Column (name = "account_type")
    private String accountType;

    private int account_pin;

    public int getAccount_pin() {
        return account_pin;
    }

    public void setAccount_pin(int account_pin) {
        this.account_pin = account_pin;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public float getAccountBalance() {
        return accountBalance;
    }

    public void setAccountBalance(float accountBalance) {
        this.accountBalance = accountBalance;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
}
