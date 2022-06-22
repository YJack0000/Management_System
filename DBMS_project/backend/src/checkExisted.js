const { mysqlPoolQuery } = require("./mysql");

const checkUserId = (userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery("SELECT * FROM user WHERE user_id = ?", userId)
      .then((rows) => {
        if (rows.length == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkMaterialId = (materialId, userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery(
      "SELECT * FROM material WHERE material_id = ? AND user_id = ?",
      [materialId, userId]
    )
      .then((rows) => {
        if (rows.length == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkProductId = (productId, userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery(
      "SELECT * FROM product WHERE product_id = ? AND user_id = ?",
      [productId, userId]
    )
      .then((rows) => {
        if (rows.length == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkOrderId = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery("SELECT * FROM `order` WHERE order_id = ? AND user_id = ?", [
      orderId,
      userId,
    ])
      .then((rows) => {
        if (rows.length == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkTagId = (tagId, userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery("SELECT * FROM tag WHERE tag_id = ? AND user_id = ?", [
      tagId,
      userId,
    ])
      .then((rows) => {
        if (rows.length == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkEmployeeId = (employeeId, userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery(
      "SELECT * FROM employee WHERE employee_id = ? AND user_id = ?",
      [employeeId, userId]
    )
      .then((rows) => {
        if (rows.length == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkTimeblockId = (timeblockId, userId) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery(
      "SELECT * FROM timeblock WHERE timeblock_id = ? AND user_id = ?",
      [timeblockId, userId]
    )
      .then((rows) => {
        if (rows.length == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  checkUserId,
  checkMaterialId,
  checkProductId,
  checkOrderId,
  checkTagId,
  checkEmployeeId,
  checkTimeblockId,
};
