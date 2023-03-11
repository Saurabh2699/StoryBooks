const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

router.get("/add", ensureAuth, (req, res) => {
    res.render("stories/add");
});

router.post("/", ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id;
        console.log(req.body);
        await Story.create(req.body);
        res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
        res.render("error/500");
    }
});

router.get("/", ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: "public" })
            .populate("user")
            .sort({ createdAt: "desc" })
            .lean();

        res.render("stories/index", { stories });
    } catch (err) {
        console.log(err);
        res.render("error/500");
    }
})

router.get("/:id", ensureAuth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate("user")
            .lean();

        if (!story) {
            return res.render("error/404");
        }

        if (story.user._id != req.user.id && story.status == "private") {
            res.render("error/404");
        } else {
            res.render("stories/show", { story });
        }
    } catch (err) {
        console.log(err);
        res.render("error/500");
    }
})

router.get("/edit/:id", ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({ _id: req.params.id }).lean();
        if (!story) {
            return res.render("error/404");
        }

        if (story.user != req.user.id) {
            res.redirect("/stories");
        } else {
            res.render("stories/edit", { story });
        }
    } catch (err) {
        console.log(err);
        res.render("error/500");
    }
});

router.put("/:id", ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean();
        if (!story) {
            return res.render("error/404");
        }

        if (story.user != req.user.id) {
            res.redirect("/stories");
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            });

            res.redirect("/dashboard");
        }
    } catch (err) {
        console.log(err);
        res.render("error/500");
    }
});

router.delete("/:id", ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean();
        if (!story) {
            return res.render("error/404");
        }

        if (story.user != req.user.id) {
            res.redirect("/stories");
        } else {
            story = await Story.findOneAndDelete({ _id: req.params.id })
            res.redirect("/dashboard");
        }
    } catch (err) {
        console.log(err);
        res.render("error/500");
    }
});

router.get("/user/:id", ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.id,
            status: "public"
        })
            .populate("user")
            .lean()

        res.render("stories/index", { stories });
    } catch (err) {
        console.log(err);
        res.render("error/500");
    }
});

router.get("/search/:query", ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ title: new RegExp(req.query.query, "i"), status: "public" })
            .populate("user")
            .sort({ createdAt: "desc" })
            .lean()
        res.render("stories/index", { stories })
    } catch (err) {
        console.log(err)
        res.render("error/404")
    }
})

module.exports = router;