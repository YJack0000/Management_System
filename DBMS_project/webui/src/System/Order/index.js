import { Grid } from "@mui/material";
import ProductCard from "./components/ProductCard.js";
import OrderTable from "./components/OrderTable";
import { useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
const axios = require("axios");
export default function Order() {
  const [productInfos, setProductInfos] = useState([]);
  const [canSend, setCanSend] = useState(false);
  const [orders, setOrders] = useState([]);
  const [toZero, setToZero] = useState(false);
  function orderRec(name, productId, price, amount) {
    console.log("first");
    let order = {
      name: name,
      productId: productId,
      price: price,
      amount: amount,
    };
    const newOrders = [
      ...orders.filter((item) => item.productId !== productId),
      order,
    ];
    setOrders(newOrders);
  }

  useEffect(() => {
    axios({
      method: "post",
      url: "https://nccu-dbms-team11.herokuapp.com/product/getAllProducts",
      data: {
        userId: "6cc4a5be-08ba-41de-946d-a2e5c6ed43c2",
      },
    }).then((response) => {
      let allProduct = response.data.allProductInformation;
      setProductInfos(allProduct);
    });
  }, []);
  return (
    <Grid container spacing={2} sx={{ display: "flex" }}>
      <Grid container md={6}>
        {productInfos.map((productInfo) => (
          <Grid item md={6} key={productInfo.productId}>
            <ProductCard
              toZero={toZero}
              setToZero={setToZero}
              orderRec={orderRec}
              productInfo={productInfo}
              sx={{ justifyContent: "flex-end", width: "30px" }}
            />
          </Grid>
        ))}
      </Grid>

      <Grid item md={6}>
        <OrderTable orders={orders} />
        <Grid item md={12}>
          <IconButton
            sx={{
              color: canSend ? "#0095E6" : "grey",
              "&:hover": { color: "#C4090E" },
            }}
            onClick={() => {
              setOrders(orders.filter((item) => item.productId === 0));
              setToZero(true);
            }}
          >
            <CancelIcon />
          </IconButton>
          <IconButton sx={{ color: canSend ? "#0095E6" : "grey" }}>
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
