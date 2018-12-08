// REQUIRING DEPENDENCIES
// ======================
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
// const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");


// REQUIRING ALL MODELS
// ====================
const db = require("./models");


// SETTING UP OUR PORT
// ===================
// Set up our port to be either the host's designated port, or 3000
const PORT = process.env.PORT || 3000;


// EXPRESS APP
// ===========
// Initialize Express
const app = express();


// CONFIGURING MIDDLEWARE
// ======================
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ 
  extended: false 
}));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries,
// we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB

// If deployed, use the deployed database. Otherwise use local database.
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongo-scraper-hw";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;

mongoose.connect(MONGODB_URI, {
  // useMongoClient: true
});

//set up routes 

app.get("/scrape", function(req, res) {
// First, we grab the body of the html with request
axios.get("https://techcrunch.com/").then(function(response) {
  // Load into cheerio and save it to $ for a shorthand selector
  const $ = cheerio.load(response.data);

    $(".river").each(function(i, element) {
    var result = {};


      // ARTICLE HEADLINE / TITLE
      result.title = $(this).children("a").children("h2").text();
        console.log("Result.title: " + result.title);

      // ARTICLE LINK
      result.link = $(this).children("a").attr("href");
        console.log("Result Link: " + result.link);

      // ARTICLE SUMMARY
      result.summary = $(this)
      .children(".post-block__content")
      .text();
        console.log("Result Summary: " + result.summary);

      // ARTICLE THUMBNAIL
      result.thumbnail = $(this)
      .children(".post-block-__media")
      .children("img")
      .attr("src");
        console.log("Result Thumbnail: " + result.thumbnail);

    console.log("Entire result: " + JSON.stringify(result));

    console.log("db: " + JSON.stringify(db));
    console.log("Article: " + db.Article);

    db.Article.create(result)
    .then(function(dbArticle) {
      console.log(dbArticle);
    })
    .catch(function(err) {
      return res.json(err);
    });

    //i previosly had this code, without the app.get part and it would scrape
    //artcile titles to my console but for some reason doesn't work with the app.get
    //also link only returns the first article link for some reason 
  //   axios.get("https://techcrunch.com/").then((response) => {
  //     const $ = cheerio.load(response.data);
  //     const getArticles = $(".river").each((i, el)=> {
  //         result = {};
  
  //         result.title = $(this)
  //         .find(".post-block__title")
  //         .text();
  //         result.link = $(this)
  //         .find("a")
  //         .attr("href");
         
  
  //          console.log(title);
  //          console.log(link);
  //         // let articlesArray = [];
  //         // articlesArray.push(title);
  //         // console.log(articlesArray);
  
  // //         var result = {};
  
  // //         // Add the text and href of every link, and save them as properties of the result object
  // //         result.title = $(this).text();
  // //         result.link = $(this).attr("href");
    
  // //   console.log(result)
  
  // })
  // })
  // })

  });

  res.send("Scrape Complete");
});
});


app.get("/articles", function(req, res) {
db.Article.find({})
.then(function(dbArticle) {
  res.json(dbArticle);
})
.catch(function(err) {
  res.json(err);
});
});


//find notes for an article
app.get("/articles/:id", function(req, res) {
db.Article.findOne({ _id: req.params.id })
.populate("note")
.then(function(dbArticle) {
  res.json(dbArticle);
})
.catch(function(err) {
  res.json(err);
});
});


// POST ROUTE TO SAVE/UPDATE AN ARTICLE'S NOTE
app.post("/newNote/:id", function(req, res) {
db.Note.create(req.body)
.then(function(dbNote) {
  return db.Article.update(
    {_id: req.params.id},
    {note: dbNote._id},
    {new: true});
})
.then(function(dbArticle) {
  res.json(dbArticle);
})
.catch(function(err) {
res.json(err);
});
});


// POST ROUTE TO DELETE AN ARTICLE'S NOTE
app.post("/deleteNote/:id", function(req, res) {
//GET the id of note we wish to delete here:
var {articleId, noteId} = req.body;
var noteIdRaw = req.body.noteId;
db.Note.remove(
    { _id: noteIdRaw}
  )
.then(function(dbNote) {
  // If we were able to successfully find Articles,
  // send them back to the client
  res.json(dbNote);
})
.catch(function(err) {
  // If an error occurred, send it to the client
  res.json(err);
});
});



app.listen(PORT, function() {
  console.log("Listening on port" + PORT);
});