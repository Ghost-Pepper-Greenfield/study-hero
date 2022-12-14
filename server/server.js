const express = require("express");
const path = require("path");
const db = require("../db/knex");
const bodyParser = require("body-parser");

function setupServer() {
	const app = express();

	app.use(express.static(path.resolve(__dirname, "../client/build")));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(express.json());

	// app.get('/*', function(req, res) {
	//   res.sendFile(path.join(__dirname, '../client/build/index.html'), function(err) {
	//     if (err) {
	//       res.status(500).send(err)
	//     }
	//   })
	// })

	// app.get("/", (req, res) => {
	// 	console.log("received");
	// 	res.status(200).send("received");
	// });

	app.post("/test", (req, res) => {
		console.log(req.body);
		res.status(200).send("message received");
	});

	app.get("/sessions", async (req, res) => {
		try {
			const sessions = await db("sessions_table").select("*");
			res.status(201).send(sessions);
		} catch (err) {
			res.status(500).send(err);
		}
	});
	//will get all sessions from the corresponding firebase ID string
	app.get("/:user/sessions", async (req, res) => {
		const user = req.params.user;
		console.log("userID received: ", user);
		try {
			const sessions = await db("sessions_table")
				.select("*")
				.where("firebaseId", user);
			res.status(200).send(sessions);
		} catch (err) {
			res.status(500).send(err);
		}
	});

	//POST a time onto log of all sessions
	app.post("/new-session", async (req, res) => {
		try {
			console.log("request received");
			const payload = req.body;
			console.log(payload);
			// change variable: table
			const table = await db("sessions_table")
				.select("*") //may not be needed
				.insert(payload);
			console.log("Completed");
			res.status(201).send("Success");
		} catch (err) {
			res.status(500).send(err);
		}
	});

	//LEADERBOARD
	app.get("/leaderboard", async (req, res) => {
		try {
			const leaderboard = await db("sessions_table")
				.select("name")
				.sum("points")
				.groupBy("name");
			res.status(200).send(leaderboard);
		} catch (err) {
			res.status(500).send(err);
		}
	});

	return app;
}

module.exports = setupServer;
