const express = require('express');
const firebaseAdmin = require('firebase-admin');
const credentials = require("./serviceAccountKey.json");
const { getAuth } = require('firebase/auth');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(credentials)
});

const app = express();
app.use(express.json());

// Sign-up endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }
  
  try {
    const userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
    });
    res.json({ success: true, uid: userRecord.uid});
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({ error: 'The password must be a string with at least 6 characters.' });
    }

    console.error('Error creating new user:', error);
    res.status(500).json({ error: "Failed to Create User" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
