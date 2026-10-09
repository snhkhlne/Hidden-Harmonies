// ========================================
// LOAD ARTISTS AND SONGS
// ========================================

loadArtists();
loadSongs();


// ========================================
// LOAD ARTISTS
// ========================================

function loadArtists() {

    fetch("/artists")
        .then(response => response.json())
        .then(artists => {

            const songArtist = document.getElementById("songArtist");
            const imageArtist = document.getElementById("imageArtist");

            songArtist.innerHTML = '<option value="">Select Artist</option>';
            imageArtist.innerHTML = '<option value="">Select Artist</option>';

            artists.forEach(artist => {

                const option1 = document.createElement("option");

                option1.value = artist.artist_id;
                option1.textContent = artist.artist_name;

                songArtist.appendChild(option1);


                const option2 = document.createElement("option");

                option2.value = artist.artist_id;
                option2.textContent = artist.artist_name;

                imageArtist.appendChild(option2);

            });

        })
        .catch(error => {

            console.error("Error loading artists:", error);

        });
}


// ========================================
// LOAD SONGS
// ========================================

function loadSongs() {

    fetch("/artists")
        .then(response => response.json())
        .then(artists => {

            const deleteSong =
                document.getElementById("deleteSong");

            deleteSong.innerHTML =
                '<option value="">Select Song</option>';


            artists.forEach(artist => {

                fetch(`/artists/${artist.artist_id}/songs`)
                    .then(response => response.json())
                    .then(songs => {

                        songs.forEach(song => {

                            const option =
                                document.createElement("option");

                            option.value = song.song_id;

                            option.textContent =
                                artist.artist_name +
                                " - " +
                                song.song_name;

                            deleteSong.appendChild(option);

                        });

                    });

            });

        })
        .catch(error => {

            console.error("Error loading songs:", error);

        });
}


// ========================================
// CREATE - ADD NEW SONG
// ========================================

function addSong() {

    const artistId =
        document.getElementById("songArtist").value;

    const songName =
        document.getElementById("songName").value.trim();

    const audioFile =
    document.getElementById("audioFile").files[0];

    const message =
        document.getElementById("addMessage");


    if (!artistId || !songName || !audioFile) {

        message.textContent =
            "Please fill all fields.";

        return;
    }


const formData = new FormData();

formData.append("artist_id", artistId);
formData.append("song_name", songName);
formData.append("audio_file", audioFile);


fetch("/songs/upload", {

    method: "POST",

    body: formData

})

    .then(response => response.json())

   .then(data => {

    console.log("SERVER RESPONSE:", data);

    message.textContent = data.message;

    if (data.success) {

        document.getElementById("songName").value = "";

        loadSongs();
    }
})

    .catch(error => {

        console.error("Add song error:", error);

        message.textContent =
            "Something went wrong.";

    });
}


// ========================================
// UPDATE - CHANGE ARTIST IMAGE
// ========================================

function updateImage() {

    const artistId =
        document.getElementById("imageArtist").value;

    const imageFile =
        document.getElementById("imageFile").files[0];

    const message =
        document.getElementById("imageMessage");

    if (!artistId || !imageFile) {

        message.textContent =
            "Please select an artist and image.";

        return;
    }

    const formData = new FormData();
     
    formData.append("image_file", imageFile);
    console.log("IMAGE URL:", `/artists/${artistId}/image`);
    fetch(`/artists/${artistId}/image`, {

        method: "POST",
        body: formData

    })
    .then(response => response.json())
    .then(data => {

        console.log("IMAGE RESPONSE:", data);

        message.textContent = data.message;

        if (data.success) {

            document.getElementById("imageFile").value = "";

        }

    })
    .catch(error => {

        console.error("Update image error:", error);

        message.textContent =
            "Something went wrong.";

    });
}


// ========================================
// DELETE - DELETE SONG
// ========================================

function deleteSong() {

    const songId =
        document.getElementById("deleteSong").value;

    const message =
        document.getElementById("deleteMessage");


    if (!songId) {

        message.textContent =
            "Please select a song.";

        return;
    }


    const confirmDelete =
        confirm("Are you sure you want to delete this song?");


    if (!confirmDelete) {
        return;
    }


    fetch(`/songs/${songId}`, {

        method: "DELETE"

    })

    .then(response => response.json())

    .then(data => {

        message.textContent =
            data.message;

        if (data.success) {

            loadSongs();

        }

    })

    .catch(error => {

        console.error("Delete song error:", error);

        message.textContent =
            "Something went wrong.";

    });
}s