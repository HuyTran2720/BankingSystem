// // console.log("account.js script loaded");
let userData = null;

async function getUserInfo () {
    document.getElementsByClassName("tab")[1].click();

    // actual tab switching to
    setTimeout (function() {
        document.getElementsByClassName("tab")[0].click();
    }, 2000)

    // console.log("Fetching Token");

    // changed from const otherwise get errors
    let token = localStorage.getItem('token');

    // console.log("User Token ", token);

    if (!token) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token');
        if (token) {
            token = decodeURIComponent(token);
            localStorage.setItem('token', token);
        } else {
            // console.log("Cant get token at all");
            return;
        }
    }

    // console.log("User Token ", token);

    // console.log('Sending request to:', 'https://bankingsystem-production-3cb0.up.railway.app/users/user-info');

    const response = await fetch("https://bankingsystem-production-3cb0.up.railway.app/users/user-info", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    // console.log("Fetch Request Received");
    
    if (response.ok) {
        userData = await response.json();
        // console.log("Login with Token Success: ", userData);

        // console.log("Parsing");
        checkForCards();
        let hasCard = JSON.parse(userData.hasCard);
        if (!hasCard) {
            const popUps = document.getElementsByClassName("displayEmpty");
            let currentIndex = 0;
            for (let popUp of popUps) {
                popUp.innerHTML = 
            `
                <div id="emptyCardsMessage" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 80vh;
                width: 100%;
                ">   
                    <p style="margin-bottom: 10px;"> 
                        It appears you have no cards!
                    </p>    
                    <p style="margin-top: 0px;">
                        Would you like to create a card <a href="#" id="cardLink${currentIndex}" style="color:dodgerblue"> here</a>? 
                    </p>
                </div>
            `;

                const createCardLink = document.getElementById(`cardLink${currentIndex}`);
                createCardLink.addEventListener("click", function(event) {
                    event.preventDefault;
                    openTab(event, 'createCard');
                });
                currentIndex++;
            }

        } else {
            var tab = document.getElementsByClassName("emptyContainer");
            for (i = 0; i < tab.length; i++) {
                tab[i].classList.add('active');
            }
            addCards();
        }
        
        const userTitles = document.getElementsByClassName("userName");
        for (let userTitle of userTitles) {
            userTitle.innerHTML = `<h2> ${userData.name} </h2>`;
        }
    } else {
        console.error("Couldnt Login with Token: ", await response.text());
        window.location.href = 'https://bankingsystem-production-3cb0.up.railway.app/login.html';
    }
    showMesage();
}

// CHECK IF USER HAS MAX AMOUNT OF CARDS (5)
async function maxLimitCards () {
    try {
        const response = await fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // console.log("Card Info - ", data);
        // console.log("Cards: ", data.length);

        return data.length === 5;
    } catch (error) {
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
        return false;
    }
}

// observer checks everytime a new tab is switched, change the mainPage height depending on what tab
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        const element = mutation.target;
        const isDisplayed = window.getComputedStyle(element).display !== 'none';
        checkForCards();
        const hasCard = JSON.parse(userData.hasCard);
        // console.log("User has Card: ", hasCard);
        if (isDisplayed && hasCard) {
            document.getElementById("mainPage").style.height = 'fit-content';
        } else {
            document.getElementById("mainPage").style.height = '80vh';
        }
    });
});

// specifies what the observer is checking for
const homeDiv = document.getElementById("home");
observer.observe(homeDiv, {
    attributes: true,
    attributeFilter: ['style', 'class']
});

function unsetMainFit () {
    document.getElementById("mainPage").style.height = '80vh';
}

// CHECKING FOR CARDS
function checkForCards () {
    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        // console.log('Cards:', data);
        if (data.length == 0) {
            // console.log("No longer has cards");
            updateHasCard(false);
        } else {
            updateHasCard(true);
        }

    })
    .catch(error => {
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
}

// SHOW MESSAGE
function showMesage () {
    const messageDiv = document.getElementById("message");

    messageDiv.classList.add("show");

    setTimeout(function() {
        messageDiv.classList.remove("show");
    }, 4000); //TODO: CHANGE BACK TO 4000
}

function loadingReset() {
    let timer = Math.floor(Math.random() * 2000);
    document.getElementById("signupLoader").style.display = 'flex';
    setTimeout (function() {
        window.location.reload();
    }, timer)
}


// OPEN INVISIBLE TAB
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
    document.getElementById(tabName).style.display = "flex";
    event.currentTarget.className += " active";

    // TODO: eventually add transactions when done
    const flexDisplays = ["transfer", "paySomeone", "depositMoney", "updateCard", "deleteCard"];
    for (let currDisplay of flexDisplays) {
        if (tabName === currDisplay) {
            document.getElementById("mainPage").style.height = 'fit-content';
            document.getElementById(`${currDisplay}`).style.marginTop = "5%";
            break;
        } else {
            document.getElementById("mainPage").style.height = '80vh';
            document.getElementById(`${currDisplay}`).style.marginTop = "0%";
        }
    }
}

// WHEN USER CLICKS ON CREATE CARD
document.getElementById("addCard").addEventListener('click', async function(e) {
    const isMax = await maxLimitCards();
    if (isMax) {
        // console.log("MAX REACHED");
        let message = document.getElementById("maxErrorMessage");
        message.classList.add("show");

        setTimeout(function() {
            message.classList.remove("show");
        }, 10000);
    }
});

// CREATING CARD
document.getElementById('cardCreation').addEventListener('submit', async function (e) {
    e.preventDefault();

    const isMax = await maxLimitCards();
    if (isMax) {
        // console.log("Max Card Limit reached!");
        let message = document.getElementById("maxErrorMessage");
        message.classList.add("show");

        setTimeout(function() {
            message.classList.remove("show");
        }, 5000);
    } else {
    const amount = parseFloat(document.getElementById('amount').value);
    const pin = parseInt(document.getElementById('pin').value, 10);
    const savings = document.getElementById('accountType').checked;

    if (pin.toString().length != 4) {
        console.error("PIN must be 4 digits!");
        return;
    }

    // console.log("Form Data: ", {amount, pin});

    let account_type = "Checkings Account";
    if(savings) {
        // console.log("Savings Account");
        account_type = "Savings Account";
    } else {
        // console.log("Checkings Account");
    }

    const newCard = {
        accountName: userData.name,
        accountBalance: amount,
        email: userData.email,
        accountType: account_type,
        account_pin: pin
    };

    // console.log("Sending Data: ", newCard, 'https://bankingsystem-production-3cb0.up.railway.app/Cards/CreateAccount');

    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/CreateAccount', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCard)
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        // console.log('Card created:', data);

        // console.log('Updating hasCard');
        updateHasCard(true);

        // console.log('Redirecting');

        // refreshes page in order to show cards
        loadingReset()
    })
    .catch(error => {
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
    }

});

// UPDATE HAS CARD
function updateHasCard (isTrue) {
    // console.log("updating with email: ", userData.email);
    // console.log("hasCard: ", String(isTrue));

    fetch ('https://bankingsystem-production-3cb0.up.railway.app/users/user-info', {

        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'hasCard_changed': String(isTrue),
            'userEmail': userData.email.trim()
        },
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

    })
    .then(data => {
        // console.log('Card Updated');
    })
    .catch(error => {
        // console.log("Card Couldnt be Updated");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
}

// ADD CARDS TO SCREEN
function addCards () {
    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Cards Adding');
        // console.log('Card Data: ', data);

        let totalBalance = 0;
        const cards = document.getElementById("displayCard");
        let userEmail = userData.email;
        cards.innerHTML = "";

            for (let currCard of data) {
                let card = currCard.email;
                // console.log("comparing: ", userEmail, " and ", card);
                if (card === userEmail) {
                    totalBalance = totalBalance + currCard.accountBalance;
                    let cardString = currCard.id.toString();
                    let midPoint = Math.floor(cardString.length / 2);
                    let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);
    
                    cards.innerHTML += 
                    `
    
                    <div class="card">
                        <div>
                            <h4> ${currCard.accountType} </h4>
                            <h5> ${cardNumber} (${currCard.accountName}) </h5>
                        </div>
                        <div style="display: flex; margin-left: auto;"> 
                            <p> Balance: </br> </br>
                                $${currCard.accountBalance.toFixed(2)}
                            </p>
                        </div>
                    </div>
    
                    `;
                }
            }

        cards.innerHTML += 
        `
            <div id="cardsInfo">
                <h5>
                    Total Balance:
                </h5>
                <p>
                    $${totalBalance.toFixed(2)}
                    </br>
                </p>
            </div>
        `

    })
    .catch(error => {
        // console.log("Cards Couldnt be Added");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
}

// GENERATE CARDS FOR DIVS
function generateCards(cards, currCard, values, cardName, inputName) {
    // console.log("Using generateCards()");

    let cardString = currCard.id.toString();
    let midPoint = Math.floor(cardString.length / 2);
    let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);

    cards.innerHTML +=
    `
        <div 
        style=" background-color: whitesmoke;
        display: flex;
        border: 1px solid black;
        width: 100% !important;
        padding: 5px;">
        
            <input type="radio" name=${inputName} value=${values}>
            <p> 
                &nbsp;
                ${currCard.accountType} 
                ${cardNumber} 
                ${cardName} 
            </p>
            <p> &nbsp;&nbsp;|&nbsp; Balance: $${currCard.accountBalance.toFixed(2)} </p>

        </div>

    `;
}

// REMOVING CARDS
document.getElementById("removeCard").addEventListener("click", function() {
    const cards = document.getElementById("cardDeletion");
    cards.innerHTML = "";

    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Cards Adding');
        // console.log('Card Data: ', data);

        let userEmail = userData.email;
        
        for (let currCard of data) {
            let card = currCard.email;
            // console.log("comparing: ", userEmail, " and ", card);
            if (card === userEmail) {
                const values = encodeURIComponent(JSON.stringify(currCard));
                const inputName = "currentCard";
                generateCards(cards, currCard, values, currCard.accountName, inputName);
            }
        }

    })
    .catch(error => {
        // console.log("Cards Couldnt be Added");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

document.getElementById("deletingForm").addEventListener("submit", function(event) {
    event.preventDefault();
    // console.log("Deleting Card");
    let selectedAccount = document.querySelector('input[name="currentCard"]:checked');
    // console.log(selectedAccount);
    if (selectedAccount) {
        let accountData = JSON.parse(decodeURIComponent(selectedAccount.value));
        let userID = accountData.id;
        let userPin = accountData.account_pin;
        let enteredPin = document.getElementById("deletePIN").value;
        // console.log("User ID: ", userID);
        // console.log("Comparing ", userPin, " with entered: ", enteredPin);
        if (enteredPin != userPin) {
            // console.log("INCORRECT PIN ENTERED");
            return;
        }

        fetch (`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/${userID}`, {

        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log("Card Deleted");
        checkForCards();
        loadingReset()
    })
    .catch(error => {
        // console.log("Cards Couldnt be Deleted");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
    } else  console.log("Couldnt find user");
});

// UPDATING CARDS
document.getElementById("editCard").addEventListener("click", function() {
    const cards = document.getElementById("cardUpdating");
    cards.innerHTML = "";

    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Cards Adding');
        // console.log('Card Data: ', data);

        let userEmail = userData.email;
        
        for (let currCard of data) {
            let card = currCard.email;
            // console.log("comparing: ", userEmail, " and ", card);
            if (card === userEmail) {
                const values = encodeURIComponent(JSON.stringify(currCard));
                let accName = "(" + currCard.accountName + ")";
                const inputName = "currentCard";
                generateCards(cards, currCard, values, accName, inputName);
            }
        }

    })
    .catch(error => {
        // console.log("Cards Couldnt be Added");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

document.getElementById("updatingForm").addEventListener("submit", function(event) {
    event.preventDefault();
    // console.log("Updating Chosen Card");
    let selectedAccount = document.querySelector('input[name="currentCard"]:checked');
    // console.log(selectedAccount);

    if (selectedAccount) {
        let accountData = JSON.parse(decodeURIComponent(selectedAccount.value));
        let userPin = accountData.account_pin;
        let enteredPin = document.getElementById("updatingPIN").value;
        // console.log("Comparing ", userPin, " with entered: ", enteredPin);
        if (enteredPin != userPin) {
            // console.log("INCORRECT PIN ENTERED");
            return;
        }

        document.getElementById("changeDetails").style.display = "flex";
        document.getElementById("updatingForm").style.display= "none";

    } else  console.log("Couldnt find user");
});

document.getElementById("changeDetails").addEventListener("submit", function(event){
    event.preventDefault();

    let selectedAccount = document.querySelector('input[name="currentCard"]:checked');
    const accountData = JSON.parse(decodeURIComponent(selectedAccount.value));

    let newAccName = accountData.accountName;
    let newAccPin = accountData.account_pin;
    let isSavings = document.getElementById("isSavingAccount").checked;
    let newAccType = "Checkings Account";
    if (isSavings) {
        newAccType = "Savings Account";
    }

    if (document.getElementById("newName").value != "") {
        newAccName = document.getElementById("newName").value;
    }
    if (document.getElementById("newPin").value != "") {
        newAccPin = parseInt(document.getElementById("newPin").value);
    }

    const updatedDetails = {
        accountName: newAccName,
        account_pin: newAccPin,
        accountType: newAccType
    }

    // console.log("Updating with details: ", updatedDetails);
    // console.log("Updating on account: ", accountData.id);

    fetch (`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/${accountData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedDetails)
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        // console.log('Card Updated');
        loadingReset()
    })
    .catch(error => {
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

// TRANSFERRING BETWEEN ACCOUNTS
document.getElementById("transferTab").addEventListener("click", function() {
    const sendingAccount = document.getElementById("sendingAccount");
    sendingAccount.innerHTML = "";
    const receivingAccount = document.getElementById("receivingAccount");
    receivingAccount.innerHTML = "";

    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Cards Adding');
        // console.log('Card Data: ', data);

        let userEmail = userData.email;
        
        for (let currCard of data) {
            let card = currCard.email;
            // console.log("comparing: ", userEmail, " and ", card);
            if (card === userEmail) {
                let cardString = currCard.id.toString();
                let midPoint = Math.floor(cardString.length / 2);
                let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);

                sendingAccount.innerHTML += 
                `
                <div 
                style="background-color: rgb(205, 206, 207); 
                display: flex;
                border-radius: 5px; 
                border: 1px solid black;
                width: 100% !important;
                padding: 2px;
                "
                >
                    <input type="radio" name="senderCard" value="${encodeURIComponent(JSON.stringify(currCard))}">
                    <p style="margin-right: 20px;"> 
                     ${currCard.accountType} </br>
                     ${cardNumber} 
                     </p>
                    <p style="margin-top: 7%;"> Balance: $${currCard.accountBalance.toFixed(2)} </p>

                </div>

                `;

                receivingAccount.innerHTML += 
                `
                <div 
                style="background-color: rgb(205, 206, 207); 
                display: flex;
                border-radius: 5px; 
                border: 1px solid black;
                width: 100% !important;
                padding: 2px;
                "
                >
                    <input type="radio" name="receiverCard" value="${encodeURIComponent(JSON.stringify(currCard))}">
                    <p style="margin-right: 20px;"> 
                     ${currCard.accountType} </br>
                     ${cardNumber} 
                     </p>
                    <p style="margin-top: 7%;"> Balance: $${currCard.accountBalance.toFixed(2)} </p>

                </div>

                `;
            }
        }

    })
    .catch(error => {
        // console.log("Cards Couldnt be Added");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

document.getElementById("transferForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    let senderAccount = document.querySelector('input[name="senderCard"]:checked');
    let receiverAccount = document.querySelector('input[name="receiverCard"]:checked');
    const senderData = JSON.parse(decodeURIComponent(senderAccount.value));
    const receiverData = JSON.parse(decodeURIComponent(receiverAccount.value));

    const transferAmount = -document.getElementById("transferAmount").value;
    const receiverAmount = -transferAmount;
    // console.log("Sending: ", transferAmount);
    // console.log("Receiving: ", receiverAmount);
    
    if (senderData.id == receiverData.id) {
        console.error("Sender and Receiver accounts cannot be the same");
        alert("Sender and Receiver accounts cannot be the same");
        event.preventDefault();
    } else if (senderData.accountBalance + transferAmount < 0) {
        console.error("Error - user cant send more than they have");
        alert("Insufficient Funds for Transfer");
    } else if (!senderAccount || !receiverAccount) {
        console.error("Missing sender account or receiver account");
        alert("Missing sender account or receiver account");
        event.preventDefault();
    } 

    else {
        try {

            const headers = {
                "Content-Type": "application/json"
            };

            const [senderResponse, receiverResponse] = await Promise.all ([
                fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/${senderData.id}`, {
                    method: 'GET',
                    headers
                }),
                fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/${receiverData.id}`, {
                    method: 'GET',
                    headers
                })
            ]);

            if (!senderResponse.ok || !receiverResponse.ok) {
                throw new Error("Failed to fetch sender or receiver account");
            }

            // console.log("Fetch Successful!");

            // console.log("Sender ID: ", senderData.id);
            // console.log("Receiver ID: ", receiverData.id);

            const [sendingResponse, receivingResponse] = await Promise.all ([
                fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/Pay/${senderData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Amount': `${transferAmount}`
                    }
                }),
                fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/Pay/${receiverData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Amount': `${receiverAmount}`
                    }
                })
            ]);

            if (!sendingResponse.ok || !receivingResponse.ok) {
                throw new Error("Failed to transfer money");
            }

            // console.log("Transfer Success!");

            loadingReset()

        } catch (error) {
            alert("Error transferring, please make sure details are correct or try again later");
            // console.log('Error caught:', error.message);
            console.error('Error:', error);
        }
    }
});

// PAY SOMEONE
document.getElementById("payTab").addEventListener("click", function() {
    const sendingAccount = document.getElementById("payerAccount");
    sendingAccount.innerHTML = "";

    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Cards Adding');
        // console.log('Card Data: ', data);

        let userEmail = userData.email;
        
        for (let currCard of data) {
            let card = currCard.email;
            // console.log("comparing: ", userEmail, " and ", card);
            if (card === userEmail) {
                let cardString = currCard.id.toString();
                let midPoint = Math.floor(cardString.length / 2);
                let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);

                sendingAccount.innerHTML += 
                `
                <div 
                style="background-color: rgb(205, 206, 207); 
                display: flex;
                border-radius: 5px; 
                border: 1px solid black;
                width: 100% !important;
                padding: 2px;
                "
                >
                    <input type="radio" name="payerCard" value="${encodeURIComponent(JSON.stringify(currCard))}">
                    <p style="margin-right: 20px;"> 
                     ${currCard.accountType} </br>
                     ${cardNumber} 
                     </p>
                    <p style="margin-top: 7%;"> Balance: $${currCard.accountBalance.toFixed(2)} </p>

                </div>

                `;
            }
        }

    })
    .catch(error => {
        // console.log("Cards Couldnt be Added");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

document.getElementById("payingForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let payerAccount = document.querySelector('input[name="payerCard"]:checked');
    const payerData = JSON.parse(decodeURIComponent(payerAccount.value));

    let payeeString = document.getElementById("payeeAccount").value;
    let sendAmnt = -document.getElementById("payAmount").value;
    const payeeId = payeeString.slice(0, 4) + payeeString.slice(5);

    if (payerData.accountBalance + sendAmnt < 0) {
        alert("Insufficient Funds");
    } else if (payeeId === payerData.id.toString()) {
        alert("Cannot send money to the same account!");
    } else if (!payerAccount) {
        alert("Please select an account to pay from");
    } else if (payeeString.charAt(4) != '-' || payeeString.length != 9) {
        alert("Please follow the format");
    } else {
        const receivingAmnt = -sendAmnt;

        // console.log("Payer ID: ", payerData.id);
        // console.log("Receiver ID: ", payeeId);
        // console.log("Sending Amount: ", sendAmnt);
        // console.log("Receiving: ", receivingAmnt);

        const receiverStatus = await fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/CheckExists/${payeeId}`, {
            method: 'GET',
            headers: {
                'Content-Type':'application/json'
            }
        });
        if (!receiverStatus.ok) {
            alert("Couldn't find account with this id, please check if you entered it correctly");
            // console.log("Couldn't find account with this id, please check if you entered it correctly");
            throw new Error("Couldnt Find Account");
        }
        // console.log("Valid Account Found");

        const [sendingResponse, receivingResponse] = await Promise.all ([
            fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/Pay/${payerData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Amount': `${sendAmnt}`
                }
            }),
            fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/Pay/${payeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Amount': `${receivingAmnt}`
                }
            })
        ]);

        if (!sendingResponse.ok || !receivingResponse.ok) {
            throw new Error("Failed to transfer money");
        }

        // console.log("Payment Success!");
        loadingReset();
    }
});

// FOR DEPOSITING MONEY
document.getElementById("depositTab").addEventListener("click", function (e) {
    const depositAccount = document.getElementById("despoitAccounts");
    depositAccount.innerHTML = "";

    fetch ('https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts', {

        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // console.log('Response received:', response.status); 

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Cards Adding');
        // console.log('Card Data: ', data);

        let userEmail = userData.email;
        
        for (let currCard of data) {
            let card = currCard.email;
            // console.log("comparing: ", userEmail, " and ", card);
            if (card === userEmail) {
                let cardString = currCard.id.toString();
                let midPoint = Math.floor(cardString.length / 2);
                let cardNumber = cardString.slice(0, midPoint) + '-' + cardString.slice(midPoint);

                depositAccount.innerHTML += 
                `
                <div 
                style="background-color: rgb(205, 206, 207); 
                display: flex;
                border-radius: 5px; 
                border: 1px solid black;
                width: 100% !important;
                padding: 2px;
                "
                >
                    <input type="radio" name="depositCard" value="${encodeURIComponent(JSON.stringify(currCard))}">
                    <p style="margin-right: 20px;"> 
                     ${currCard.accountType} </br>
                     ${cardNumber} 
                     </p>
                    <p style="margin-top: 7%;"> Balance: $${currCard.accountBalance.toFixed(2)} </p>

                </div>

                `;
            }
        }

    })
    .catch(error => {
        // console.log("Cards Couldnt be Added");
        // console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

document.getElementById("depositForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let accountSelected = document.querySelector('input[name="depositCard"]:checked');
    const accountData = JSON.parse(decodeURIComponent(accountSelected.value));
    // console.log("Account Data: ", accountData);

    const depositAmount = document.getElementById("depositAmount").value;
    // console.log("Deposit Amount: ", depositAmount);

    const enteredPin = document.getElementById("depositPin").value;
    // console.log("Entered Pin: ", enteredPin);
    // console.log("Expected Pin: ", accountData.account_pin);

    if (enteredPin.toString().length != 4) {
        alert ("Please enter your 4 digit pin");
    } else if (!accountData) {
        alert ("Please select an account to deposit to");
    } else if (enteredPin != accountData.account_pin) {
        alert ("Incorrect Pin");
    } else {
        // console.log("Depositing into account");

        const depositStatus = await fetch(`https://bankingsystem-production-3cb0.up.railway.app/Cards/Accounts/Pay/${accountData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Amount': `${depositAmount}`
            }
        });
        if (!depositStatus.ok) {
            throw new Error ("Couldn't complete deposit");
        }

        // console.log("Deposit Success!");
        loadingReset();
    }
});