package BankManagement.com.backend.Entities;
import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // * use from users data
    @Column (name = "account_name")
    private String accountName;

    @Column (name = "account_balance")
    private Integer accountBalance;

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

    public Integer getAccountBalance() {
        return accountBalance;
    }

    public void setAccountBalance(Integer accountBalance) {
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
