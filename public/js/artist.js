// ========================================
// HIDDEN HARMONIES - ARTIST PAGE
// ========================================
fetch("/artists")
    .then(response => response.json())
    .then(artists => {

        const artistId =
            document.body.getAttribute("data-artist-id");

        const artist =
            artists.find(a => a.artist_id == artistId);

        if (artist && artist.image_path) {

            document.querySelector(".artist-photo img").src =
                "/" + artist.image_path;

        }

    })
    .catch(error => {
        console.error("Artist image error:", error);
    });
// Get artist ID from the HTML
const artistId = document.body.dataset.artistId;

const songList = document.getElementById("songList");


// ========================================
// LOAD SONGS FROM DATABASE
// ========================================

fetch(`/artists/${artistId}/songs`)
    .then(response => response.json())
    .then(songs => {

        songList.innerHTML = "";

        songs.forEach((song, index) => {

            const songCard = document.createElement("div");

            songCard.className = "song-card";

            songCard.innerHTML = `
                <span>${String(index + 1).padStart(2, "0")}</span>

                <h3>${song.song_name}</h3>

                <button onclick="playSong('${song.audio_path}', ${song.song_id}, '${song.song_name.replace(/'/g, "\\'")}')">
                    ▶ Play
                </button>
            `;

            songList.appendChild(songCard);

        });

    })
    .catch(error => {
        console.error("Error loading songs:", error);
    });


// ========================================
// MUSIC PLAYER
// ========================================

function playSong(path, songId, songName) {

    const audio = document.getElementById("audioPlayer");

    const player = document.getElementById("musicPlayer");

    const currentSong = document.getElementById("currentSong");

    audio.src = "/" + path;

    currentSong.textContent = songName;

    player.style.display = "flex";

    audio.play();

    // Save listening history
    fetch("/history", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            song_id: songId
        })
    });
}
// ========================================
// LOAD INTERVIEW
// ========================================

fetch(`/artists/${artistId}/interview`)
    .then(response => response.json())
    .then(data => {

        const interviewButton = document.querySelector(".main-button");

        if (data.video_path && interviewButton) {

            interviewButton.href = data.video_path;
            interviewButton.target = "_blank";

        } else if (interviewButton) {

            interviewButton.style.display = "none";
        }

    })
    .catch(error => {
        console.error("Error loading interview:", error);
    });

    // ========================================
// LOAD ARTICLE
// ========================================

fetch(`/artists/${artistId}/interview`)
    .then(response => response.json())
    .then(data => {

        const articleButton = document.querySelector(".article-button");

        if (data.article_path && articleButton) {

            articleButton.href = data.article_path;
            articleButton.target = "_blank";

        } else if (articleButton) {

            articleButton.style.display = "none";
        }

    })
    .catch(error => {
        console.error("Error loading article:", error);
    });