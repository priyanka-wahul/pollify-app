if(process.env.NODE_ENV !=  "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStoreImport = require("connect-mongo");
const MongoStore = MongoStoreImport.default || MongoStoreImport;


const Poll = require("./models/Poll");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected DB");
}).catch(err => {
    console.log(err);
})

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto : {
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600
});


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
};


//middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.engine("ejs",ejsMate);

app.use(cors());
app.use( express.static( path.join(__dirname, "public") ));

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(session(sessionOptions));

// HOME PAGE 
app.get("/", async (req, res) => { 
    const polls = await Poll.find()
    .sort({ createdAt: -1 });
    res.render("index",{ polls }); 
});

//create route
app.get("/create", (req, res) => {
    res.render("create"); }); 

// Create Poll Page 

app.post("/poll", wrapAsync(async (req, res) => {
        const {question,pollType,options,timer,chartType} = req.body;
        let finalOptions = [];

        // Yes / No Poll
        if (pollType === "yesno") {

            finalOptions = [
                { text: "Yes" },
                { text: "No" }
            ];

        }

        // True / False Poll
        else if (pollType === "truefalse") {

            finalOptions = [
                { text: "True" },
                { text: "False" }
            ];

        }
        // Multiple Choice Poll
        else {
            finalOptions = (options || []).filter(option => option.trim() !== "").map(option => ({
                    text: option.trim()
                }));
        }
        if (
        pollType === "multiple" && finalOptions.length < 2) {
        throw new ExpressError(400,"At least 2 options are required");
    }
    const expiresAt = new Date( Date.now() + timer * 1000);

        const poll = new Poll({
            question: question.trim(),
            pollType,
            options: finalOptions,
            timer,
            chartType,
            expiresAt,
        });
        await poll.save();
        // console.log("Poll Saved:");
        // console.log(poll);

        // res.send(`Poll Created Successfully! Poll ID: ${poll._id}`);
        res.redirect(`/poll/${poll._id}`);
}));

//create poll id 
app.get("/poll/:id", wrapAsync(async (req, res) => {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
        throw new ExpressError(404, "Poll Not Found");
    }
    res.render("poll", { poll,req});
}));

//vote route
app.post("/poll/:id/vote", wrapAsync(async (req, res) => {

    const { id } = req.params;
    const { optionId } = req.body;

    // Find Poll
    const poll = await Poll.findById(id);

    if (!poll) {
        throw new ExpressError(
            404,
            "Poll Not Found"
        );
    }

    // Initialize Session Storage
    if (!req.session.votedPolls) {
        req.session.votedPolls = [];
    }

    // Prevent Duplicate Voting
    if (req.session.votedPolls.includes(id)) {
        throw new ExpressError(
            400,
            "You have already voted in this poll"
        );
    }

    // Check Poll Expiry
    if (new Date() > poll.expiresAt) {

        poll.status = "closed";

        await poll.save();

        throw new ExpressError(
            400,
            "Poll has expired"
        );
    }

    // Find Selected Option
    const option = poll.options.id(optionId);

    if (!option) {
        throw new ExpressError(
            404,
            "Option Not Found"
        );
    }

    // Add Vote
    option.votes += 1;

    // Increase Total Votes
    poll.totalVotes += 1;

    // Remember User Voted
    req.session.votedPolls.push(id);

    // Save Changes
    await poll.save();

    // Redirect Back To Poll
    res.redirect(`/poll/${id}`);

}));
//result route
app.get("/poll/:id/results",wrapAsync(async (req, res) => {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
        throw new ExpressError(404, "Poll Not Found");
        }
        let winner = poll.options[0];
        poll.options.forEach(option => {
            if (option.votes > winner.votes) {
                winner = option;
    }
});
res.render("results", { poll,winner });
})
);

// Test Create Poll Route 
// app.post("/poll", (req, res) => { 
//     console.log(req.body); 
//     res.send("Poll Created Successfully"); 
// });


//create route
// app.post("/create",async (req,res) => {
//     try{
//         const { question, options, timer, chartType } = req.body;
//         //create poll
//         const newPoll = new Poll({ 
//             question, 
//             options: options.map((option) => ({ 
//                 text: option, 
//             })), 
//             timer, 
//             chartType, 
//         });
//     }
// });

//polltest sample

// app.get("/poll", async (req, res) => { 
//     try { 
//         const newPoll = new Poll({ 
//             question: "Favorite Language?", 
//             options: [ { text: "JavaScript" }, { text: "Python" }, ], 
//             timer: 60, }); 
//     await newPoll.save(); 
//     res.send("Poll Created"); 
//     } catch (err) {
//      console.log(err); res.send("Error"); 
//     } 
// });

// app.get("/",(req,res) => {
//     res.send("Hi welcome !");
// });

app.use((req,res,next) => {
    next(new ExpressError(404,"page not found"));
});

//error middleware
app.use((err,req,res,next) => {
    let {statusCode=500, message="something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{err});
}); 

app.listen(8080,() => {
    console.log("app is listening to port 8080");
});