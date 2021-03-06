const express = require("express");
const router = express.Router();

const methodNotAllowed = require("../errors/methodNotAllowed");
const serverError = require("../errors/serverError");
const { auth, authErrorHandler } = require("../middleware/auth");
const normalizeUrls = require("../services/normalizeUrls");

const Graduate = require("../models/graduate");


router.use(auth);
router.use(authErrorHandler);

router.put("/", async (req, res, next) => {

  // TODO: Make check more specific once we have roles defined.
  // Currently checks for any user:
  if (!req.user) {
    return res.status(403).send({
      isSuccess: 0,
      message: "Unauthorized user."
    });
  }

  let [github, linkedin, website] = normalizeUrls(
    req.body.github,
    req.body.linkedin,
    req.body.website,
  );
  
  try {
    const grad = await Graduate.findById(req.body._id);
    // TODO: Add userId to request in app.js to allow additional backend auth
    // if (grad.userId.toString() !== req.body.userId.toString()) {
    //   const error = new Error('Not authorized');
    //   error.statusCode = 403;
    //   throw error;
    // }

    grad.firstName = req.body.firstName;
    grad.lastName = req.body.lastName;
    grad.isActive = req.body.isActive;
    grad.phone = req.body.phone;
    grad.story = req.body.story;
    grad.yearOfGrad = req.body.yearOfGrad;
    grad.image = req.body.image;
    grad.resume = req.body.resume;
    grad.links.email = req.body.email;
    grad.links.github = github;
    grad.links.linkedin = linkedin;
    grad.links.website = website;
    grad.skills = req.body.skills;

    const newGrad = await grad.save();

    res.status(200).send({
      isSuccess: 1,
      message: "Success",
      _id: newGrad._id.toString()
    });
  } catch(err) {
    serverError(req, res, next, err);
  }

});

router.all("/", methodNotAllowed);

module.exports = router;