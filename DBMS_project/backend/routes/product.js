var express = require("express");
var router = express.Router();

/* GET product listening. */
router.get("/", function (req, res, next) {
  res.send("In Product!!");
});



router.post("/getAllProducts", function (req, res, next) {
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  // get information from DB
  mysqlPoolQuery(
    "SELECT product_id AS productId, product_name AS name, product_price AS price, product_amount AS amount FROM product WHERE user_id = ?",userId,
  
    function (err, rows) {
      if (err) {
        res.status(404).json({ success: false, err: err });
      } else {
        if (rows.length == 0) {
          res.status(409).json({ success: false, err: "使用者不存在" });
        }
        res.status(200).json({ success: true, userInformation: rows[0] });
      }
    }
  );
});

module.exports = router;
