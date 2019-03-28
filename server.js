let express = require("express");
let mongoose = require("mongoose");
let cheerio = require("cheerio");
let axios = require("axios");
let path = require("path");
let mongojs = require("mongojs");
let app = express();
let PORT = process.env.PORT || 3000;
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

app.use(express.urlencoded({
	extended: true
}));
app.use(express.json());
app.use(express.static("public"));

let databaseUrl = "gtnews";
let collections = ["articles"];

let db = mongojs(databaseUrl, collections);

db.on("error", function(error) {
	console.log("Database Error:", error);
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/news", (req, res) => {
	db.articles.find(function(err, result) {
		if (err) {
			console.log(err);
		}
		res.json(result);
	});
});

app.get("/api/news", (req, res) => {
	axios.get("https://www.nytimes.com")
		.then(function(response) {
			let $ = cheerio.load(response.data);
			db.articles.remove({});
			$("article").each(function(i, element) {
				let result = {};
				result.title = $(element).children().text();
				result.link = $(element).find("a").attr("href");

				db.articles.save(result);
			});


		});

});

app.listen(PORT, function() {
	console.log("App listening on port: " + PORT);
})
