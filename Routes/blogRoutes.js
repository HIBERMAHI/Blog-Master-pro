const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const Registration = require("../models/Registration");
const { ensureAuthenticated, isadmin } = require("../middleware/auth");

// 1. PUBLIC VIEW: Only shows blogs after Admin Approval
router.get("/fashion-feed", async (req, res) => {
  try {
    const approvedBlogs = await Blog.find({ approveStatus: "approved" })
      .populate("author", "firstName lastName")
      .sort({ publishDate: -1 });

    res.render("fashionFeed", { blogs: approvedBlogs });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Unable to load the blog feed");
  }
});

// 2. USER SUBMISSION PAGE
router.get("/blog", ensureAuthenticated, async (req, res) => {
  try {
    const myBlogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.render("blog", { 
      title: "Submit Blog", 
      myBlogs, 
      user: req.user 
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// 3. CREATE BLOG
router.post("/blog", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description,} = req.body;
    const newBlog = new Blog({
      title,
      description,
      publishDate: new Date(),
      author: req.user._id,
      approveStatus: "pending" 
    });
    await newBlog.save();
    req.flash("success_msg", "Blog submitted! Awaiting admin approval.");
    res.redirect("/blog");
  } catch (error) {
    req.flash("error_msg", "Failed to submit blog.");
    res.redirect("/blog");
  }
});

// 4. ADMIN DASHBOARD: MATCHING adminBlogs.pug
router.get("/adminBlogs", isadmin, async (req, res) => {
  try {
    const pendingBlogs = await Blog.find({ approveStatus: "pending" })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });

    const approvedBlogs = await Blog.find({ approveStatus: "approved" })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });

    // This renders adminBlogs.pug
    res.render("adminBlogs", { 
      title: "Admin Blog Control", 
      pendingBlogs, 
      approvedBlogs 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Unable to load Admin Dashboard");
  }
});

// 5. STATUS UPDATE: Redirecting back to /adminBlogs
router.post("/blog/status/:id", isadmin, async (req, res) => {
  try {
    const { status } = req.body;
    await Blog.findByIdAndUpdate(req.params.id, { approveStatus: status });
    req.flash("success_msg", `Blog ${status} successfully.`);
    
    // Updated Redirect
    res.redirect("/adminBlogs"); 
  } catch (error) {
    res.status(500).send("Error updating status");
  }
});

// 8. VIEW SINGLE BLOG (Pre-approval check)
router.get("/blog/view/:id", isadmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "firstName lastName");
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    res.render("viewBlog", { title: "Review Blog", blog });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading blog content");
  }
});

// 6. DELETE BLOG: Redirecting back to /adminBlogs

// 6. DELETE BLOG: Strictly Admin Only
router.post("/blog/delete/:id", isadmin, async (req, res) => {
  try {
    // We no longer check for author. toString() because 'isadmin' 
    // middleware ensures only an admin can reach this code.
    await Blog.findByIdAndDelete(req.params.id);

    req.flash("success_msg", "Blog successfully removed by Admin.");
    
    // Since only admins can delete, we always redirect to the Admin Dashboard
    res.redirect("/adminBlogs"); 
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(400).send("Error deleting blog");
  }
});

// A. GET: Show the Edit Form with existing data
router.get("/blog/edit/:id", isadmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");
    
    res.render("editBlog", { title: "Edit Blog Content", blog });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// B. POST: Handle the update logic
router.post("/blog/edit/:id", isadmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Update the blog and keep the original author and date
    await Blog.findByIdAndUpdate(req.params.id, { title, description });
    
    req.flash("success_msg", "Blog updated successfully!");
    res.redirect("/adminBlogs");
  } catch (error) {
    res.status(400).send("Error updating blog");
  }
});

// 1. PUBLIC VIEW: The Fashion Feed
router.get("/fashionFeed", async (req, res) => {
  try {
    const approvedBlogs = await Blog.find({ approveStatus: "approved" })
      .populate("author", "firstName lastName") // Get the author names
      .sort({ publishDate: -1 }); // Show newest first

    res.render("fashionFeed", { 
      title: "Fashion Feed", 
      blogs: approvedBlogs,
      user: req.user // Pass user to show/hide login links
    });
  } catch (error) {
    res.status(500).send("Unable to load the feed");
  }
});

router.get('/landing', (req,res)=>{
  res.render('landing')
})

// 7. LOGOUT: Clears session and redirects to landing page
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return next(err);
    }
    // Optional: Destroy the session completely for extra security
    req.session.destroy((err) => {
      res.clearCookie('connect.sid'); // Clears the session cookie
      res.redirect("landing"); // Redirects to your landing page
    });
  });
});


module.exports = router;