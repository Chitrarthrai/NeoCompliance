const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  uploadQuestion,
  getScoreDetails,
  GenerateResponseMediaUploadUrl,
  GetUserUploadedMedia,
  dummyMediaUpload,
} = require("../controllers/user-controller");
const {
  createInspector,
  createUser,
} = require("../controllers/auth-controller");
const { auth, authRole } = require("../middlewares/auth-middleware");

router.post("/upload-question", auth, authRole(["inspector"]), uploadQuestion);
router.post("/register", createUser);
router.post("/score-details", auth, authRole(["inspector"]), getScoreDetails);
router.post(
  "/create-inspector",
  auth,
  authRole(["inspector"]),
  createInspector
);
router.get(
  "/getSignedUrl",
  auth,
  authRole(["inspector"]),
  GenerateResponseMediaUploadUrl
);
router.post(
  "/getuser-upload",
  auth,
  authRole(["inspector"]),
  GetUserUploadedMedia
);
router.post(
  "/dummy-upload",
  auth,
  authRole(["inspector"]),
  upload.single("file"),
  dummyMediaUpload
);

module.exports = router;
