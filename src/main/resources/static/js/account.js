console.log("account.js script loaded");
let userData = null;

async function getUserInfo () {
    document.getElementsByClassName("tab")[0].click();
    // TODO: CHANGE BACK TO 0

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

function showMesage () {
    const messageDiv = document.getElementById("message");

    messageDiv.classList.add("show");

    setTimeout(function() {
        messageDiv.classList.remove("show");
    }, 4000); //TODO: CHANGE BACK TO 4000
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

        const cards = document.getElementById("displayCard");
        let userEmail = userData.email;
        cards.innerHTML = "";

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

    })
    .catch(error => {
        console.log("Cards Couldnt be Added");
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
}