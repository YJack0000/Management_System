const { mysqlPoolQuery } = require("./mysql");

const deleteOrder = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery("DELETE FROM `order` WHERE order_id = ? AND user_id = ?", [
      orderId,
      userId,
    ])
      .then((rows) => {
        resolve(rows);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = { deleteOrder };
