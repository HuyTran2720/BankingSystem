// log in
console.log("logIn.js loaded");
document.getElementById('logInForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Form data:', { email, password });

    const userAccount = {
        email: email,
        password: password
    };

    console.log('Sending request to:', 'http://localhost:8081/users/login');

    fetch('http://localhost:8081/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userAccount)
    })
    .then(response => {
        console.log('Response received:', response.status); 
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Log In Sucess:', data.message);
        console.log('Redirecting');

        console.log("Token being set: ", data.token);
        localStorage.setItem('token', data.token);

        const tokenData = localStorage.getItem('token');
        console.log('Token Generated: ', tokenData);

        window.location.href = 'accountPage.html?token=' + encodeURIComponent(data.token);
    })
    .catch(error => {
        console.log('Error caught:', error.message);
        console.error('Error:', error);
        document.getElementById('errorMessage').style.display = 'flex';
        document.getElementById('okError').addEventListener('click', function() {
            document.getElementById('errorMessage').style.display = 'none';
        });
    });
});

async function getUserInfo () {
    console.log("Fetching Token");

    const token = localStorage.getItem('token');

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
    } else {
        console.error("Couldnt Login with Token: ", await response.text());
    }
}