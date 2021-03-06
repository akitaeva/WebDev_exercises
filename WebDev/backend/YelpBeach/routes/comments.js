const express     = require("express"),
      router      = express.Router({mergeParams: true});

const middleware  = require("../middleware");          

const Beach       = require("./../models/beach"),
      Comment     = require("./../models/comment");
      
      
//show form to create new
router.get("/new", middleware.isLoggedIn, (req, res) =>{
    //find beach by id 
    Beach.findById(req.params.id, (err, foundBeach) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {theBeach: foundBeach});
        }
    })
});

//comments create
router.post("/", middleware.isLoggedIn, (req, res) =>{ 
    Beach.findById(req.params.id, (err, foundBeach) =>{
        if (err) {
            console.log(err);
            req.flash("error", "Error finding the entry")
        } else  {
            Comment.create(req.body.comment, (err, comment) =>{ 
                if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong")
                } else  {
                    //add username and user id to the comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save the comment
                    comment.save();
                    foundBeach.comments.push(comment);
                    foundBeach.save();
                    req.flash("success", "Successfully added your comment")
                    return res.redirect("/beaches/" + foundBeach._id);
                }    
            })
           }       
        })    
})

//edit a comment - render the prefilled form
router.get("/:comment_id/edit", middleware.isCommentOwner, (req, res) => {
    Beach.findById(req.params.id, (err, foundBeach) => {
        if(err || !foundBeach) {
            req.flash("error", "Error finding the entry")  
            return res.redirect("back")
        } else {
          Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err) {
               res.redirect("back")
            } else {
               res.render("comments/edit", {theBeach_id: req.params.id, comment: foundComment} )
            }
          });
        }
    });

}); 

//update the comment
router.put("/:comment_id", middleware.isCommentOwner, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/beaches/" + req.params.id);
        }
    })
})


//destroy the comment
router.delete("/:comment_id/", middleware.isCommentOwner, (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, (err) => {
        if (err) {
            req.flash("error", "Error finding the entry")
            res.redirect("back");  
        } else {
            req.flash("success", "The comment has been successfully deleted")
            res.redirect("/beaches/" + req.params.id);
        }
    })
})


module.exports = router;    