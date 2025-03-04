package BankManagement.com.backend.Entities;

import jakarta.persistence.*;

@Entity
@Table (name = "transactions")
public class Transactions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "transaction_id")
    private Integer transactionID;

    private Integer id;

    private String email;

    @Column (name = "transaction_amount")
    private float transactionAmount;

    @Column (name = "other_user")
    private Integer otherUser;

    // * methods

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public float getTransactionAmount() {
        return transactionAmount;
    }

    public void setTransactionAmount(float transactionAmount) {
        this.transactionAmount = transactionAmount;
    }

    public Integer getOtherUser() {
        return otherUser;
    }

    public void setOtherUser(Integer otherUser) {
        this.otherUser = otherUser;
    }
    
}
