console.log("account.js script loaded");
let data = null;

async function getUserInfo () {
    showMesage();
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
        data = await response.json();
        console.log("Login with Token Success: ", data);

        console.log("Parsing");
        let hasCard = JSON.parse(data.hasCard);
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

        const userTitle = document.getElementById("userName");
        userTitle.innerHTML = `<h2> ${data.name} </h2>`;
    } else {
        console.error("Couldnt Login with Token: ", await response.text());
        window.location.href = 'http://localhost:8081/login.html';
    }
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

    console.log("Form Data: ", {amount, pin});

    let account_type = "Credit Account";
    if(savings) {
        console.log("Savings Account");
        account_type = "Savings Account";
    } else {
        console.log("Credit Account");
    }

    const newCard = {
        accountName: data.name,
        accountBalance: amount,
        email: data.email,
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
    console.log("updating with email: ", data.email);
    console.log("hasCard: ", String(isTrue));

    fetch ('http://localhost:8081/users/user-info', {

        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'hasCard_changed': String(isTrue),
            'userEmail': data.email.trim()
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
        let userEmail = data.email;
        cards.innerHTML = "";

        for (let currCard of data) {
            let card = currCard.email;
            if (card.localeCompare(userEmail)) {
                cards.innerHTML += 
                `

                <div>
                    <p> Account Name: ${currCard.accountName} </p>
                    <p> Account Balance: ${currCard.accountBalance} </p>
                    <p> Account Type: ${currCard.accountType} </p>
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