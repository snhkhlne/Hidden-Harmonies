const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("active");

                revealObserver.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.15
    }
);


revealElements.forEach((element) => {
    revealObserver.observe(element);
});

const profileButton = document.getElementById("profileButton");
const profileBox = document.getElementById("profileBox");
const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const logoutButton = document.getElementById("logoutButton");

fetch("/user")
    .then((response) => response.json())
    .then((data) => {

        if (data.loggedIn) {
            profileButton.textContent = "👤 " + data.username;

            profileUsername.textContent = "Username: " + data.username;
            profileEmail.textContent = "Email: " + data.email;
        }

    });

profileButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (profileBox.style.display === "none") {
        profileBox.style.display = "block";
    } else {
        profileBox.style.display = "none";
    }
});

logoutButton.addEventListener("click", () => {

    fetch("/logout")
        .then(() => {
            window.location.href = "login.html";
        });

});
// ========================================
// LOAD ARTIST IMAGES FROM DATABASE
// ========================================

fetch("/artists")
    .then(response => response.json())
    .then(artists => {

        artists.forEach(artist => {

            if (artist.artist_id == 1 && artist.image_path) {
                document.getElementById("artistImage1").src =
                    "/" + artist.image_path;
            }

            if (artist.artist_id == 2 && artist.image_path) {
                document.getElementById("artistImage2").src =
                    "/" + artist.image_path;
            }

            if (artist.artist_id == 3 && artist.image_path) {
                document.getElementById("artistImage3").src =
                    "/" + artist.image_path;
            }

            if (artist.artist_id == 4 && artist.image_path) {
                document.getElementById("artistImage4").src =
                    "/" + artist.image_path;
            }

        });

    })
    .catch(error => {
        console.error("Artist image loading error:", error);
    });