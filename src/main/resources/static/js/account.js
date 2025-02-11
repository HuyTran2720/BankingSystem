console.log("account.js script loaded");
async function getUserInfo () {
    showMesage();
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
        const data = await response.json();
        console.log("Login with Token Success: ", data);

        console.log("Parsing");
        let hasCard = JSON.parse(data.hasCard);
        if (!hasCard) {
            const popUp = document.getElementById("displayEmpty");
            popUp.innerHTML = `<p> It appears you have no card! </p>`;
            popUp.innerHTML += `<p> Would you like to create a card <a href="#" id="cardLink" style="color:dodgerblue"> here</a>? </p>`;

            const createCardLink = document.getElementById("cardLink");
            createCardLink.addEventListener("click", function(event) {
                event.preventDefault;
                openTab(event, "accounts");
            });
        }

        const userTitle = document.getElementById("userName");
        userTitle.innerHTML = `<h2> ${data.name} </h2>`;
    } else {
        console.error("Couldnt Login with Token: ", await response.text());
    }
}

function showMesage () {
    const messageDiv = document.getElementById("message");

    messageDiv.classList.add("show");

    setTimeout(function() {
        messageDiv.classList.remove("show");
    }, 1000); // TODO : change this back to 4000 or 5000
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