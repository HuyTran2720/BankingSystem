console.log("account.js script loaded");
async function getUserInfo () {
    showMesage();
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
        console.log("User has Card: ", hasCard);

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
    }, 5000); 
}