const express = require ('express');
const cookies = require ('cookie-parser');
const cors = require ('cors');
const app = express ();

app.use (
  cors ({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use (cookies ());
app.use (express.json ());

const authRouter = require ('./routes/auth.route');
const interviewRouter = require ('./routes/interview.route');
app.use ('/api/auth', authRouter);
app.use ('/api/interview', interviewRouter);

module.exports = app;
