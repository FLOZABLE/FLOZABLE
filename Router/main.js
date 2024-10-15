const express = require("express");
const { autoSignin } = require("../API/auth");
const Router = express.Router();

Router.get("/", async (req, res) => {
  autoSignin(
    req,
    res,
    () => {
      try {
        res.render("index", { loggedIn: true });
      } catch (err) {
        console.log(err);
      }
    },
    () => res.render("index", { loggedIn: false })
  );
});

Router.get("/privacy-policy", async (req, res) => {
  autoSignin(
    req,
    res,
    () => {
      try {
        res.render("privacy-policy", { loggedIn: true });
      } catch (err) {
        console.log(err);
      }
    },
    () => {
      try {
        res.render("privacy-policy", { loggedIn: false });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

Router.get("/terms", async (req, res) => {
  autoSignin(
    req,
    res,
    () => {
      try {
        res.render("terms", { loggedIn: true });
      } catch (err) {
        console.log(err);
      }
    },
    () => {
      try {
        res.render("terms", { loggedIn: false });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

Router.get("/cookies", async (req, res) => {
  autoSignin(
    req,
    res,
    () => {
      try {
        res.render("cookies", { loggedIn: true });
      } catch (err) {
        console.log(err);
      }
    },
    () => {
      try {
        res.render("cookies", { loggedIn: false });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

Router.get("/release-notes", async (req, res) => {
  autoSignin(
    req,
    res,
    () => {
      try {
        res.render("release-notes", { loggedIn: true });
      } catch (err) {
        console.log(err);
      }
    },
    () => {
      try {
        res.render("release-notes", { loggedIn: false });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

Router.get("/contact", async (req, res) => {
  try {
    res.render("contact", {});
  } catch (err) {
    console.log(err);
  }
});
Router.get("/robots.txt", (req, res) => {
  try {
    res.render("robots.txt");
  } catch (err) {
    console.log(err);
  }
});

Router.get("/sitemap.xmal", (req, res) => {
  try {
    res.render("sitemap.xml");
  } catch (err) {
    console.log(err);
  }
});

/* Router.get("/ads.txt", (req, res) => {
  res.render("ads.txt");
}); */

Router.get("/reset-password", (req, res) => {
  autoSignin(
    req,
    res,
    () => {
      try {
        res.render("reset-password", { loggedIn: true });
      } catch (err) {
        console.log(err);
      }
    },
    () => {
      try {
        res.render("reset-password", { loggedIn: false });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

Router.get("/verify-by-link", (req, res) => {
  autoSignin(
    req,
    res,
    () => {
      try {
        res.render("verify-email", { loggedIn: true });
      } catch (err) {
        console.log(err);
      }
    },
    () => {
      try {
        res.render("verify-email", { loggedIn: false });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

module.exports = Router;
