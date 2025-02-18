console.log("account.js script loaded");
let userData = null;

async function getUserInfo () {
    document.getElementsByClassName("tab")[0].click();

    console.log("Fetching Token");

    // changed from const otherwise get errors
    let token = localStorage.getItem('token');

    console.log("User Token ", token);

    if (!token) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token');
        if (token) {
            token = decodeURIComponent(token);
            localStorage.setItem('token', token);
        } else {
            console.log("Cant get token at all");
            return;
        }
    }

    console.log("User Token ", token);

    console.log('Sending request to:', 'http://localhost:8081/users/user-info');

    const response = await fetch("http://localhost:8081/users/user-info", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    console.log("Fetch Request Received");
    
    if (response.ok) {
        userData = await response.json();
        console.log("Login with Token Success: ", userData);

        console.log("Parsing");
        checkForCards();
        let hasCard = JSON.parse(userData.hasCard);
        if (!hasCard) {
            const popUp = document.getElementById("displayEmpty");
            popUp.innerHTML = `<p> It appears you have no cards! </p>`;
            popUp.innerHTML += `<p> Would you like to create a card <a href="#" id="cardLink" style="color:dodgerblue"> here</a>? </p>`;

            const createCardLink = document.getElementById("cardLink");
            createCardLink.addEventListener("click", function(event) {
                event.preventDefault;
                openTab(event, 'accounts');
            });
        } else {
            addCards();
        }
        
        const userTitles = document.getElementsByClassName("userName");
        for (let userTitle of userTitles) {
            userTitle.innerHTML = `<h2> ${userData.name} </h2>`;
        }
    } else {
        console.error("Couldnt Login with Token: ", await response.text());
        window.location.href = 'http://localhost:8081/login.html';
    }
    showMesage();
}

function checkForCards () {
    fetch ('http://localhost:8081/Cards/Accounts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        console.log('Cards:', data);
        if (data.length == 0) {
            console.log("No longer has cards");
            updateHasCard(false);
        } else {
            updateHasCard(true);
        }

    })
    .catch(error => {
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
}

function showMesage () {
    const messageDiv = document.getElementById("message");

    messageDiv.classList.add("show");

    setTimeout(function() {
        messageDiv.classList.remove("show");
    }, 0); //TODO: CHANGE BACK TO 4000
}

function openTab (event, tabName) {
    var i, tabContent, tab;
    tabContent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tab = document.getElementsByClassName("tab");
    for (i = 0; i < tab.length; i++) {
        tab[i].className = tab[i].className.replace(" active", "")
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// CREATING CARD
document.getElementById('cardCreation').addEventListener('submit', function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const pin = parseInt(document.getElementById('pin').value, 10);
    const savings = document.getElementById('accountType').checked;

    if (pin.toString().length != 4) {
        console.error("PIN must be 4 digits!");
        return;
    }

    console.log("Form Data: ", {amount, pin});

    let account_type = "Credit Account";
    if(savings) {
        console.log("Savings Account");
        account_type = "Savings Account";
    } else {
        console.log("Credit Account");
    }

    const newCard = {
        accountName: userData.name,
        accountBalance: amount,
        email: userData.email,
        accountType: account_type,
        account_pin: pin
    };

    console.log("Sending Data: ", newCard, 'http://localhost:8081/Cards/CreateAccount');

    fetch ('http://localhost:8081/Cards/CreateAccount', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCard)
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        console.log('Card created:', data);

        console.log('Updating hasCard');
        updateHasCard(true);

        console.log('Redirecting');

        // refreshes page in order to show cards
        // TODO: add loading circle to indicate
        setTimeout(function() {
            window.location.reload();
        }, 1500);
    })
    .catch(error => {
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });

});

function updateHasCard (isTrue) {
    console.log("updating with email: ", userData.email);
    console.log("hasCard: ", String(isTrue));

    fetch ('http://localhost:8081/users/user-info', {

        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'hasCard_changed': String(isTrue),
            'userEmail': userData.email.trim()
        },
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

    })
    .then(data => {
        console.log('Card Updated');
    })
    .catch(error => {
        console.log("Card Couldnt be Updated");
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
}

function addCards () {
    fetch ('http://localhost:8081/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Cards Adding');
        console.log('Card Data: ', data);

        const cards = document.getElementsByClassName("displayCard");
        let userEmail = userData.email;
        cards.innerHTML = "";

        for (let cardContainer of cards) {
            cardContainer.innerHTML = "";
            for (let currCard of data) {
                let card = currCard.email;
                console.log("comparing: ", userEmail, " and ", card);
                if (card === userEmail) {
                    let cardString = currCard.id.toString();
                    let midPoint = Math.floor(cardString.length / 2);
                    let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);
    
                    cardContainer.innerHTML += 
                    `
    
                    <div 
                    style="background-color: rgb(205, 206, 207); 
                    border-radius: 5px; 
                    margin-right: auto; 
                    border: 1px solid black;
                    width: 80%;
                    padding: 5px;
                    "
                    >
                        <h4> ${currCard.accountType} </h4>
                        <h5> ${cardNumber} </h5>
                        <p> ${currCard.accountName} </p>
                        <div style="display: flex;"> 
                            <p> Balance:</p>
                            <p style="margin-left: auto"> $${currCard.accountBalance.toFixed(2)} </p>
                        </div>
    
                    </div>
    
                    `;
                }
            }
        }

    })
    .catch(error => {
        console.log("Cards Couldnt be Added");
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
}

// REMOVING CARDS
document.getElementById("removeCard").addEventListener("click", function() {
    const cards = document.getElementById("cardDeletion");
    cards.innerHTML = "";

    fetch ('http://localhost:8081/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Cards Adding');
        console.log('Card Data: ', data);

        let userEmail = userData.email;
        
        for (let currCard of data) {
            let card = currCard.email;
            console.log("comparing: ", userEmail, " and ", card);
            if (card === userEmail) {
                let cardString = currCard.id.toString();
                let midPoint = Math.floor(cardString.length / 2);
                let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);

                cards.innerHTML += 
                `
                <div 
                style="background-color: rgb(205, 206, 207); 
                display: inline;
                border-radius: 5px; 
                margin-right: auto; 
                border: 1px solid black;
                width: 100% !important;
                padding: 5px;
                "
                >
                    <input type="radio" name="currentCard" value="${currCard.id}|${currCard.account_pin}">
                    <p> 
                     ${currCard.accountType} 
                     ${cardNumber} 
                     ${currCard.accountName} 
                     </p>
                        <p> Balance: $${currCard.accountBalance.toFixed(2)} </p>

                </div>

                `;
            }
        }

    })
    .catch(error => {
        console.log("Cards Couldnt be Added");
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

document.getElementById("deletingForm").addEventListener("submit", function(event) {
    event.preventDefault();
    console.log("Deleting Card");
    let selectedAccount = document.querySelector('input[name="currentCard"]:checked');
    console.log(selectedAccount);
    if (selectedAccount) {
        const vals = selectedAccount.value.split('|');
        let userID = vals[0];
        let userPin = vals[1];
        let enteredPin = document.getElementById("deletePIN").value;
        console.log("Comparing ", userPin, " with entered: ", enteredPin);
        if (enteredPin != userPin) {
            console.log("INCORRECT PIN ENTERED");
            return;
        }

        fetch (`http://localhost:8081/Cards/Accounts/${userID}`, {

        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Card Deleted");
        checkForCards();
        // TODO: add loading circle to indicate
        setTimeout(function() {
            window.location.reload();
        }, 1500);
    })
    .catch(error => {
        console.log("Cards Couldnt be Deleted");
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
    } else console.log("Couldnt find user");
});

// UPDATING CARDS
document.getElementById("editCard").addEventListener("click", function() {
    const cards = document.getElementById("cardUpdating");
    cards.innerHTML = "";

    fetch ('http://localhost:8081/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Cards Adding');
        console.log('Card Data: ', data);

        let userEmail = userData.email;
        
        for (let currCard of data) {
            let card = currCard.email;
            console.log("comparing: ", userEmail, " and ", card);
            if (card === userEmail) {
                let cardString = currCard.id.toString();
                let midPoint = Math.floor(cardString.length / 2);
                let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);

                cards.innerHTML += 
                `
                <div 
                style="background-color: rgb(205, 206, 207); 
                display: inline;
                border-radius: 5px; 
                margin-right: auto; 
                border: 1px solid black;
                width: 100% !important;
                padding: 5px;
                "
                >
                    <input type="radio" name="currentCard" value="${encodeURIComponent(JSON.stringify(currCard))}">
                    <p> 
                     ${currCard.accountType} 
                     ${cardNumber} 
                     ${currCard.accountName} 
                     </p>
                        <p> Balance: $${currCard.accountBalance.toFixed(2)} </p>

                </div>

                `;
            }
        }

    })
    .catch(error => {
        console.log("Cards Couldnt be Added");
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

document.getElementById("updatingForm").addEventListener("submit", function(event) {
    event.preventDefault();
    console.log("Updating Chosen Card");
    let selectedAccount = document.querySelector('input[name="currentCard"]:checked');
    console.log(selectedAccount);

    if (selectedAccount) {
        let accountData = JSON.parse(decodeURIComponent(selectedAccount.value));
        let userPin = accountData.account_pin;
        let enteredPin = document.getElementById("updatingPIN").value;
        console.log("Comparing ", userPin, " with entered: ", enteredPin);
        if (enteredPin != userPin) {
            console.log("INCORRECT PIN ENTERED");
            return;
        }

        document.getElementById("changeDetails").style.display = "flex";
        document.getElementById("updatingForm").style.display= "none";

    } else console.log("Couldnt find user");
});

document.getElementById("changeDetails").addEventListener("submit", function(event){
    event.preventDefault();

    let selectedAccount = document.querySelector('input[name="currentCard"]:checked');
    const accountData = JSON.parse(decodeURIComponent(selectedAccount.value));

    let newAccName = accountData.accountName;
    let newAccEmail = accountData.email;
    let newAccPin = accountData.account_pin;
    if (document.getElementById("newName").value != "") {
        newAccName = document.getElementById("newName").value;
    }
    if (document.getElementById("newEmail").value != "") {
        newAccEmail = document.getElementById("newEmail").value;
    }
    if (document.getElementById("newPin").value != "") {
        newAccPin = document.getElementById("newPin").value;
    }

    const updatedDetails = {
        accountName: newAccName,
        email: newAccEmail,
        account_pin: newAccPin
    }

    console.log("Updating with details: ", updatedDetails);
    console.log("Updating on account: ", accountData.id);

    fetch (`http://localhost:8081/Cards/Accounts/${accountData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedDetails)
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        console.log('Card Updated');
        let timer = Math.floor(Math.random() * 2000 + 2000);
        setTimeout (function() {
            window.location.reload();
        }, timer)
    })
    .catch(error => {
        console.log('Error caught:', error.message);
        console.error('Error:', error);
        window.location.reload();
    });
});