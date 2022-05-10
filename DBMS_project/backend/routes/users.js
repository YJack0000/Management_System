var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("In Users!!");
});

router.post("/signup", function (req, res, next) {
  const mysqlPoolQuery = req.pool;
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  //store information into DB
  let insertSQL = {
    user_id: uuidv4(),
    user_name: username,
    password: password,
    email: email,
    phone_number: phoneNumber,
  };
  mysqlPoolQuery(
    "SELECT user_name FROM user WHERE user_name = ?",
    username,
    function (err, rows) {
      if (err) {
        res.status(404).json({ success: false, err: err });
      } else {
        if (rows.length > 0) {
          res.status(409).json({ success: false, err: "使用者名稱已存在" });
        } else {
          mysqlPoolQuery(
            "INSERT INTO user SET ?",
            insertSQL,
            function (err, rows) {
              if (err) {
                res.status(404).json({ success: false, err: err });
              } else {
                res.status(201).json({ success: true, message: "註冊成功" });
              }
            }
          );
        }
      }
    }
  );
});

router.post("/login", function (req, res, next) {
  const mysqlPoolQuery = req.pool;
  const username = req.body.username;
  const password = req.body.password;
  mysqlPoolQuery(
    "SELECT user_id, password FROM user WHERE user_name = ?",
    username,
    function (err, rows) {
      if (err) {
        res.status(404).json({ success: false, err: err });
      } else {
        if (rows.length != 1) {
          res.status(409).json({ success: false, err: "使用者名稱錯誤" });
        } else {
          const passwordHash = rows[0].password;
          const correct = bcrypt.compareSync(password, passwordHash);
          if (!correct) {
            res.status(409).json({ success: false, err: "密碼錯誤" });
          } else {
            res.status(200).json({ success: true, userId: rows[0].user_id });
          }
        }
      }
    }
  );
});

router.post("/getInformation", function (req, res, next) {
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  mysqlPoolQuery(
    "SELECT user_name AS username, email, phone_number AS phoneNumber FROM user WHERE user_id = ?",
    userId,
    function (err, rows) {
      if (err) {
        res.status(404).json({ success: false, err: err });
      } else {
        if (rows.length == 0) {
          res.status(409).json({ success: false, err: "使用者不存在" });
        } else {
          res.status(200).json({ success: true, userInformation: rows[0] });
        }
      }
    }
  );
});

module.exports = router;
