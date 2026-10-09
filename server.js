require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const app = express();

app.use(express.json());

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            path.join(__dirname, "public", "songss", "uploads")
        );

    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({
    storage: storage
});

const imageStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            path.join(
                __dirname,
                "public",
                "songss",
                "uploads",
                "images"
            )
        );

    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const uploadImage = multer({
    storage: imageStorage
});


app.use(session({
    secret: "hidden-harmonies-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const PORT = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("MySQL database connected!");
    }
});


// ========================================
// REGISTER
// ========================================

app.post("/register", (req, res) => {

    const { username, email, password } = req.body;

    const sql = `
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [username, email, password], (err, result) => {

        if (err) {

            if (err.code === "ER_DUP_ENTRY") {
                return res.json({
                    success: false,
                    message: "Username or email already exists."
                });
            }

            return res.json({
                success: false,
                message: "Registration failed."
            });
        }

        res.json({
            success: true,
            message: "Account created successfully!"
        });
    });
});


// ========================================
// LOGIN
// ========================================

app.post("/login", (req, res) => {

    const { username, email, password } = req.body;

    const sql = `
        SELECT * FROM users
        WHERE username = ?
        AND email = ?
        AND password = ?
    `;

    db.query(sql, [username, email, password], (err, results) => {

        if (err) {
            return res.json({
                success: false,
                message: "Login failed."
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: "Invalid username, email or password."
            });
        }

        req.session.user = results[0];

        req.session.save((err) => {

            if (err) {

                console.log("SESSION SAVE ERROR:", err);

                return res.json({
                    success: false,
                    message: "Could not save session."
                });
            }

            res.json({
                success: true,
                message: "Login successful!"
            });
        });
    });
});


// ========================================
// GET ALL ARTISTS
// ========================================

app.get("/artists", (req, res) => {

    const sql = "SELECT * FROM artists";

    db.query(sql, (err, results) => {

        if (err) {
            return res.json({
                success: false,
                message: "Could not fetch artists."
            });
        }

        res.json(results);
    });
});


// ========================================
// GET SONGS FOR ONE ARTIST
// ========================================

app.get("/artists/:artistId/songs", (req, res) => {

    const artistId = req.params.artistId;

    const sql = `
        SELECT song_id, song_name, audio_path
        FROM songs
        WHERE artist_id = ?
    `;

    db.query(sql, [artistId], (err, results) => {

        if (err) {
            return res.json({
                success: false,
                message: "Could not fetch songs."
            });
        }

        res.json(results);
    });
});

// ========================================
// CREATE - ADD NEW SONG
// ========================================

app.post("/songs", (req, res) => {

    const { artist_id, song_name, audio_path } = req.body;

    if (!artist_id || !song_name || !audio_path) {
        return res.json({
            success: false,
            message: "Please provide artist, song name and audio path."
        });
    }

    const sql = `
        INSERT INTO songs (artist_id, song_name, audio_path)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [artist_id, song_name, audio_path],
        (err, result) => {

            if (err) {
                console.log("ADD SONG ERROR:", err.message);

                return res.json({
                    success: false,
                    message: "Could not add song."
                });
            }

            res.json({
                success: true,
                message: "Song added successfully!",
                song_id: result.insertId
            });
        }
    );
});

// ========================================
// CREATE - UPLOAD NEW SONG
// ========================================

app.post("/songs/upload", upload.single("audio_file"), (req, res) => {

    const artistId = req.body.artist_id;
    const songName = req.body.song_name;

    if (!artistId || !songName || !req.file) {

        return res.json({
            success: false,
            message: "Please provide artist, song name and audio file."
        });

    }

    const audioPath =
        "songss/uploads/" + req.file.filename;

    const sql = `
        INSERT INTO songs (artist_id, song_name, audio_path)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [artistId, songName, audioPath],
        (err, result) => {

            if (err) {

                console.log(
                    "UPLOAD SONG ERROR:",
                    err.message
                );

                return res.json({
                    success: false,
                    message: "Could not upload song."
                });

            }

            res.json({
                success: true,
                message: "Song uploaded successfully!",
                song_id: result.insertId
            });

        }
    );

});

// ========================================
// UPDATE - CHANGE ARTIST IMAGE
// ========================================

app.put("/artists/:artistId", (req, res) => {

    const artistId = req.params.artistId;
    const { image_path } = req.body;

    if (!image_path) {

        return res.json({
            success: false,
            message: "Please provide an image path."
        });

    }

    const sql = `
        UPDATE artists
        SET image_path = ?
        WHERE artist_id = ?
    `;

    db.query(
        sql,
        [image_path, artistId],
        (err, result) => {

            if (err) {

                console.log(
                    "UPDATE ARTIST ERROR:",
                    err.message
                );

                return res.json({
                    success: false,
                    message: "Could not update artist."
                });

            }

            if (result.affectedRows === 0) {

                return res.json({
                    success: false,
                    message: "Artist not found."
                });

            }

            res.json({
                success: true,
                message: "Artist image updated successfully!"
            });

        }
    );

});


// ========================================
// UPDATE - UPLOAD NEW ARTIST IMAGE
// ========================================

app.post(
    "/artists/:artistId/image",
    uploadImage.single("image_file"),
    (req, res) => {

        const artistId = req.params.artistId;

        if (!req.file) {

            return res.json({
                success: false,
                message: "Please select an image."
            });

        }

        const imagePath =
            "songss/uploads/images/" + req.file.filename;

        const sql = `
            UPDATE artists
            SET image_path = ?
            WHERE artist_id = ?
        `;

        db.query(
            sql,
            [imagePath, artistId],
            (err, result) => {

                if (err) {

                    console.log(
                        "UPDATE IMAGE ERROR:",
                        err.message
                    );

                    return res.json({
                        success: false,
                        message: "Could not update artist image."
                    });

                }

                if (result.affectedRows === 0) {

                    return res.json({
                        success: false,
                        message: "Artist not found."
                    });

                }

                res.json({
                    success: true,
                    message: "Artist image updated successfully!"
                });

            }
        );

    }
);

// ========================================
// DELETE - DELETE SONG
// ========================================

app.delete("/songs/:songId", (req, res) => {

    const songId = req.params.songId;

    const sql = `
        DELETE FROM songs
        WHERE song_id = ?
    `;

    db.query(
        sql,
        [songId],
        (err, result) => {

            if (err) {
                console.log("DELETE SONG ERROR:", err.message);

                return res.json({
                    success: false,
                    message: "Could not delete song."
                });
            }

            if (result.affectedRows === 0) {
                return res.json({
                    success: false,
                    message: "Song not found."
                });
            }

            res.json({
                success: true,
                message: "Song deleted successfully!"
            });
        }
    );
});

// ========================================
// GET INTERVIEW FOR ONE ARTIST
// ========================================

app.get("/artists/:artistId/interview", (req, res) => {

    const artistId = req.params.artistId;

    const sql = `
        SELECT video_path, article_path
        FROM interviews
        WHERE artist_id = ?
    `;

    db.query(sql, [artistId], (err, results) => {

        if (err) {
            return res.json({
                success: false,
                message: "Could not fetch interview."
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: "No interview found."
            });
        }

        res.json(results[0]);
    });
});
// ========================================
// SAVE LISTENING HISTORY
// ========================================

app.post("/history", (req, res) => {

    console.log("HISTORY REQUEST RECEIVED");
    console.log("SESSION:", req.session);
    console.log("BODY:", req.body);

    if (!req.session.user) {

        return res.json({
            success: false,
            message: "User not logged in."
        });
    }

    const userId = req.session.user.user_id;
    const songId = req.body.song_id;

    const sql = `
        INSERT INTO listening_history (user_id, song_id)
        VALUES (?, ?)
    `;

    db.query(sql, [userId, songId], (err, result) => {

        if (err) {

            console.log("HISTORY INSERT ERROR:", err.message);

            return res.json({
                success: false,
                message: err.message
            });
        }

        console.log("HISTORY SAVED:", result.insertId);

        res.json({
            success: true
        });
    });
});


// ========================================
// GET CURRENT USER
// ========================================

app.get("/user", (req, res) => {

    if (req.session.user) {

        res.json({
            loggedIn: true,
            username: req.session.user.username,
            email: req.session.user.email
        });

    } else {

        res.json({
            loggedIn: false
        });
    }
});

// ========================================
// UPDATE USER PROFILE
// ========================================

app.put("/user", (req, res) => {

    if (!req.session.user) {
        return res.json({
            success: false,
            message: "User not logged in."
        });
    }

    const userId = req.session.user.user_id;
    const { username, email, password } = req.body;

    const sql = `
        UPDATE users
        SET username = ?, email = ?, password = ?
        WHERE user_id = ?
    `;

    db.query(sql, [username, email, password, userId], (err, result) => {

        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.json({
                    success: false,
                    message: "Username or email already exists."
                });
            }

            return res.json({
                success: false,
                message: "Profile update failed."
            });
        }

        // Update session with new details
        req.session.user.username = username;
        req.session.user.email = email;
        req.session.user.password = password;

        res.json({
            success: true,
            message: "Profile updated successfully!"
        });
    });
});

// ========================================
// DELETE USER ACCOUNT
// ========================================

app.delete("/user", (req, res) => {

    if (!req.session.user) {
        return res.json({
            success: false,
            message: "User not logged in."
        });
    }

    const userId = req.session.user.user_id;

    // Delete listening history first
    const deleteHistory = `
        DELETE FROM listening_history
        WHERE user_id = ?
    `;

    db.query(deleteHistory, [userId], (err) => {

        if (err) {
            return res.json({
                success: false,
                message: "Could not delete listening history."
            });
        }

        // Delete user account
        const deleteUser = `
            DELETE FROM users
            WHERE user_id = ?
        `;

        db.query(deleteUser, [userId], (err, result) => {

            if (err) {
                return res.json({
                    success: false,
                    message: "Could not delete account."
                });
            }

            req.session.destroy(() => {
                res.json({
                    success: true,
                    message: "Account deleted successfully."
                });
            });
        });
    });
});


// ========================================
// LOGOUT
// ========================================

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.json({
                success: false
            });
        }

        res.json({
            success: true
        });
    });
});


// ========================================
// HOME PAGE
// ========================================

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/public/login.html");

});


// ========================================
// STATIC FILES
// ========================================

app.use(express.static("public"));


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});