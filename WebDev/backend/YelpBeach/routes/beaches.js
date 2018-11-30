const express = require("express"),
      router  = express.Router();

const Beach   = require("./../models/beach")      

//middleware to check logged/unlogged
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
       return next();
    }
    res.redirect("/login");
}
  

//index route
router.get("/", (req,res) =>  {
    //get all beaches from DB
    Beach.find({}, (err, allBeaches) => {
        if(err) {
            console.log(err);
        } else {
            res.render("beaches/index", { theBeaches : allBeaches});
        }

    });

})  

//creating new entry
router.post("/", isLoggedIn, (req,res) => {
    //creating an author object from the logged in user
    const author = {
        id: req.user_id,
        username: req.user.username
    }
    ///Taking the entry data from the form
    const newBeach = { name: req.body.name, image: req.body.image, description: req.body.description, author: author }
 
    //Create a new beach entry and save to the DB
    Beach.create(newBeach, (err, newlyCreated) => {
      if(err) {
          console.log(err);
      } else {
        res.redirect("beaches");
      }
    })

})

//NEW - show a form for a new beach entry
router.get("/new", isLoggedIn, (req,res) => {
    res.render("beaches/new");
})

//SHOW - details about a specific beach - find by id and render the template
router.get("/:id", (req,res) => {
    //find the beach by the provided id
    Beach.findById(req.params.id)
    .populate("comments")
    .exec((err, foundBeach)=> {
       if (err) {
           console.log(err);
       } else {
        res.render("beaches/show", {theBeach: foundBeach});
       }
    });
    
});


module.exports = router;