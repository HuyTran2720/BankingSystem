console.log('Script loaded'); 

document.getElementById('accountCreation').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const accountName = document.getElementById('accountName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeatPassword').value;

    console.log('Form data:', { accountName, email, password });

    if (repeatPassword != password) {
        console.log('Passwords do not match');
        alert("Passwords do not match!");
        return;
    }

    // Create an object with the form data
    const newAccount = {
        name: accountName,
        email: email,
        password: password,
        hasCard: false
    };

    console.log('Sending request to:', 'http://localhost:8081/users/signup');

    // Send data to backend using fetch API
    fetch('http://localhost:8081/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAccount)
    })
    .then(response => {
        console.log('Response received:', response.status); 

        if (response.status === 409) {
            alert("Email already in use!");
            document.getElementById("email").style.borderColor = 'red';
        }

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        console.log('Account created:', data);
        console.log('Redirecting');

        console.log("playing loader");
        document.getElementById("signupLoader").style.display = 'flex';
        console.log("loading being played");
        setTimeout (function() {
            window.location.href = 'logIn.html';
        }, 1500)
        console.log('Redirected');
    })
    .catch(error => {
        console.log('Error caught:', error.message);
        console.error('Error:', error);
    });
});

