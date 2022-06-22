var express = require("express");
var router = express.Router();

const { v4: uuidv4 } = require("uuid");

const {
  checkUserId,
  checkProductId,
  checkTagId,
  checkOrderId,
} = require("../src/checkExisted");

const { deleteOrder } = require("../src/modifyOrder");

/* GET order listening. */
router.get("/", function (req, res, next) {
  // #swagger.tags = ['Order']
  res.send("In Order!!");
});

router.post("/getTagDict", async function (req, res, next) {
  /*
  #swagger.tags = ['Order']
  #swagger.responses[409] = {
    description: '使用者不存在'
  }
  #swagger.responses[200] = {
    description: '取得成功',
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  try {
    const userExisted = await checkUserId(userId);
    if (!userExisted) {
      res.status(409).json({ success: false, err: "使用者不存在" });
    } else {
      let rows = await mysqlPoolQuery(
        "SELECT tag_id AS tagId, tag_name AS tagName FROM tag WHERE user_id = ?",
        userId
      );
      let tagDict = {};
      for (let i = 0; i < rows.length; i++) {
        tagDict[rows[i].tagId] = rows[i].tagName;
      }
      res.status(200).json({ success: true, tagDict: tagDict });
    }
  } catch (err) {
    res.status(404).json({ success: false, err: err });
  }
});

router.post("/addNewTag", async function (req, res, next) {
  /*
  #swagger.tags = ['Order']
  #swagger.responses[409] = {
    description: '使用者不存在或標籤已存在'
  }
  #swagger.responses[200] = {
    description: '取得成功',
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  const tagName = req.body.tagName;
  const tagId = uuidv4();
  let insertTag = {
    tag_id: tagId,
    tag_name: tagName,
    user_id: userId,
  };
  try {
    const userExisted = await checkUserId(userId);
    if (!userExisted) {
      res.status(409).json({ success: false, err: "使用者不存在" });
    } else {
      // insert new tag
      let rows = await mysqlPoolQuery(
        "SELECT tag_name FROM tag WHERE tag_name = ? AND user_id = ?",
        [tagName, userId]
      );
      if (rows.length > 0) {
        res.status(409).json({ success: false, err: "標籤名稱已存在" });
      } else {
        await mysqlPoolQuery("INSERT INTO tag SET ?", insertTag);
        res
          .status(201)
          .json({ success: true, message: "新增標籤成功", tagId: tagId });
      }
    }
  } catch (err) {
    res.status(404).json({ success: false, err: err });
  }
});

router.post("/addNewOrder", async function (req, res, next) {
  /*
  #swagger.tags = ['Order']
  #swagger.responses[409] = {
    description: '使用者不存在或存貨或標籤不存在'
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  const orderData = req.body.orderData;
  const totalPrice = req.body.totalPrice;
  const tagId = req.body.tagId;
  const orderId = uuidv4();
  let insertOrderSQL = {
    order_id: orderId,
    create_time: new Date(),
    total_price: totalPrice,
    user_id: userId,
  };

  try {
    const userExisted = await checkUserId(userId);
    if (!userExisted) {
      res.status(409).json({ success: false, err: "使用者不存在" });
    } else {
      let allProductExisted = true;
      for ([productId] of Object.entries(orderData)) {
        let productExisted = await checkProductId(productId, userId);
        if (!productExisted) {
          allProductExisted = false;
        }
      }
      if (!allProductExisted) {
        res.status(409).json({ success: false, err: "存貨不存在" });
      } else {
        let allTagsExisted = true;
        for (let i = 0; i < tagId.length; i++) {
          let tagExisted = await checkTagId(tagId[i], userId);
          if (!tagExisted) {
            allTagsExisted = false;
            break;
          }
        }
        if (!allTagsExisted) {
          res.status(409).json({ success: false, err: "標籤不存在" });
        } else {
          await mysqlPoolQuery("INSERT INTO `order` SET ?", insertOrderSQL);
          for (let i = 0; i < tagId.length; i++) {
            let insertOTSQL = {
              order_id: orderId,
              tag_id: tagId[i],
            };
            await mysqlPoolQuery("INSERT INTO `order_tag` SET ?", insertOTSQL);
          }
          for ([productId, amount] of Object.entries(orderData)) {
            let insertOPSQL = {
              order_id: orderId,
              product_id: productId,
              amount: amount,
            };
            await mysqlPoolQuery(
              "INSERT INTO `order_product` SET ?",
              insertOPSQL
            );
          }
          res.status(201).json({ success: true, message: "新增訂單成功" });
        }
      }
    }
  } catch (err) {
    res.status(404).json({ success: false, err: err });
  }
});

router.post("/deleteOrder", async function (req, res, next) {
  /*
  #swagger.tags = ['Order']
  #swagger.responses[409] = {
    description: '使用者不存在或訂單不存在'
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  const orderId = req.body.orderId;
  try {
    const userExisted = await checkUserId(userId);
    const orderExisted = await checkOrderId(orderId, userId);
    if (!userExisted) {
      res.status(409).json({ success: false, err: "使用者不存在" });
    } else if (!orderExisted) {
      res.status(409).json({ success: false, err: "訂單不存在" });
    } else {
      await deleteOrder(orderId, userId);
      res.status(200).json({ success: true, message: "刪除訂單成功" });
    }
  } catch (err) {
    res.status(404).json({ success: false, err: err });
  }
});

router.post("/updateOrder", async function (req, res, next) {
  /*
  #swagger.tags = ['Order']
  #swagger.responses[409] = {
    description: '使用者不存在或存貨或標籤不存在'
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  const orderData = req.body.orderData;
  const totalPrice = req.body.totalPrice;
  const tagId = req.body.tagId;
  const orderId = req.body.orderId;
  let updateOrderSQL = {
    order_id: orderId,
    create_time: new Date(),
    total_price: totalPrice,
    user_id: userId,
  };
  try {
    const userExisted = await checkUserId(userId);
    if (!userExisted) {
      res.status(409).json({ success: false, err: "使用者不存在" });
    } else {
      let allProductExisted = true;
      for ([productId] of Object.entries(orderData)) {
        let productExisted = await checkProductId(productId, userId);
        if (!productExisted) {
          allProductExisted = false;
        }
      }
      if (!allProductExisted) {
        res.status(409).json({ success: false, err: "存貨不存在" });
      } else {
        let allTagsExisted = true;
        for (let i = 0; i < tagId.length; i++) {
          let tagExisted = await checkTagId(tagId[i], userId);
          if (!tagExisted) {
            allTagsExisted = false;
            break;
          }
        }
        if (!allTagsExisted) {
          res.status(409).json({ success: false, err: "標籤不存在" });
        } else {
          // delete order and add new order
          await deleteOrder(orderId, userId);
          await mysqlPoolQuery("INSERT INTO `order` SET ?", updateOrderSQL);
          for (let i = 0; i < tagId.length; i++) {
            let insertOTSQL = {
              order_id: orderId,
              tag_id: tagId[i],
            };
            await mysqlPoolQuery("INSERT INTO `order_tag` SET ?", insertOTSQL);
          }
          for ([productId, amount] of Object.entries(orderData)) {
            let insertOPSQL = {
              order_id: orderId,
              product_id: productId,
              amount: amount,
            };
            await mysqlPoolQuery(
              "INSERT INTO `order_product` SET ?",
              insertOPSQL
            );
          }
          res.status(200).json({ success: true, message: "更新訂單成功" });
        }
      }
    }
  } catch (err) {
    res.status(404).json({ success: false, err: err });
  }
});

router.post("/getAllOrders", async function (req, res, next) {
  /*
  #swagger.tags = ['Order']
  #swagger.responses[409] = {
    description: '使用者不存在'
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  try {
    const userExisted = await checkUserId(userId);
    if (!userExisted) {
      res.status(409).json({ success: false, err: "使用者不存在" });
    } else {
      let rows = await mysqlPoolQuery(
        "SELECT order_id AS orderId, create_time AS createTime, total_price AS totalPrice FROM `order` WHERE user_id = ? ",
        userId
      );
      if (rows.length == 0) {
        res.status(200).json({ success: true, message: "尚無訂單" });
      } else {
        for (let i = 0; i < rows.length; i++) {
          //get orderProducts
          let productRows = await mysqlPoolQuery(
            "SELECT p.product_id AS productId, p.product_name AS productName, p.product_price AS productPrice, op.amount AS productAmount \
            FROM product p, `order` o, order_product op \
            WHERE p.product_id = op.product_id AND o.order_id = op.order_id AND o.order_id = ?",
            rows[i].orderId
          );
          rows[i].orderProducts = productRows;
          //get tags
          let tagRows = await mysqlPoolQuery(
            "SELECT t.tag_id AS tagId, t.tag_name AS tagName \
            FROM tag t, `order` o, order_tag ot \
            WHERE t.tag_id = ot.tag_id AND o.order_id = ot.order_id AND o.order_id = ?",
            rows[i].orderId
          );
          rows[i].tags = tagRows;
        }

        res.status(200).json({ success: true, allOrdersData: rows });
      }
    }
  } catch (err) {
    res.status(404).json({ success: false, err: err });
  }
});

module.exports = router;
