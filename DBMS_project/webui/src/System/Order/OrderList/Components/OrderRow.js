import * as React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/material";
import { Collapse } from "@mui/material";
import { IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { deleteOrder, updateOrder } from "../APIs";
import MultipleTags from "./MultipleTags";

export default function OrderRow(props) {
  const { row, refresh, allTags } = props;

  const [expandOpen, setExpandOpen] = React.useState(false);
  const [canSend, setCanSend] = React.useState(false);
  const OLD_orderProducts = row.orderProducts;
  const [orderProducts, setOrderProducts] = React.useState(row.orderProducts);
  const OLD_chosedTags = row.tags.map((tag) => tag.tagId);
  const [chosedTags, setChosedTags] = React.useState(
    row.tags.map((tag) => {
      if (allTags[tag.tagId]) return tag.tagId;
    })
  );
  const [orderData, setOrderData] = React.useState({});
  const [totalPrice, setTotalPrice] = React.useState(row.totalPrice);

  React.useEffect(() => {
    setOrderProducts(row.orderProducts);  // 用來防止 row 的 useState 比 orderProducts 的 useState 跑多一次！！！
    let checkChosedTags = row.tags.map((tag) => {
      if (allTags[tag.tagId]) return tag.tagId;
    });
    setChosedTags(checkChosedTags);
  }, [allTags, row]);

  React.useEffect(() => {
    if (
      JSON.stringify(chosedTags) !== JSON.stringify(OLD_chosedTags) ||
      JSON.stringify(orderProducts) !== JSON.stringify(OLD_orderProducts)
    ) {
      console.log("!!!!!!!!!!!!!NOT EQUAL===========");
      setCanSend(true);
    } else {
      setCanSend(false);
      console.log("============EQUAL============");
    }
    console.log("===================================");
    console.log(row.orderId, "row.orderId");
    console.log(OLD_chosedTags, "OLD_chosedTags");
    console.log(chosedTags, "chosedTags");
    console.log(OLD_orderProducts, "OLD_orderProducts");
    console.log(orderProducts, "orderProducts");
    console.log("===================================");

    const newOrderData = {};
    orderProducts.forEach((orderProduct) => {
      newOrderData[orderProduct.productId] = orderProduct.productAmount;
    });
    setOrderData(newOrderData);
    // console.log(totalPrice, "totalPrice");
    // console.log(chosedTags, "chosedTags");
    // console.log(orderData, "orderData"); // 因為還沒更新，所以他會 render 出上一次的值
    // console.log("===================================")
  }, [chosedTags, totalPrice]);

  const handleAmountChange = (id, event) => {
    const newOrderProducts = orderProducts.map((orderProduct) => {
      console.log(event.target.value, "event.target.value");
      if (orderProduct.productId === id) {
        return {
          ...orderProduct,
          productAmount: event.target.value,
        };
      } else return orderProduct;
    });
    setOrderProducts(newOrderProducts);

    let newTotalPrice = 0;
    newOrderProducts.map((o) => {
      newTotalPrice += o.productAmount * o.productPrice;
    });
    setTotalPrice(newTotalPrice);
  };

  const handleDelete = async (id) => {
    console.log("[CollapsibleRow.js handleDelete] delete order: ", id);
    props.setIsBackdropOpen(true);
    let resp = await deleteOrder(id);
    console.log("delete resp: ", resp);
    await props.refresh();
    props.setIsBackdropOpen(false);
    refresh();
  };

  const handleUpdate = async (id) => {
    console.log("[CollapsibleRow.js handleUpdate] update order: ", id);
    props.setIsBackdropOpen(true);
    // let resp = await updateOrder(id, orderData, chosedTags, totalPrice);
    // console.log("update resp: ", resp);
    // await props.refresh();
    props.setIsBackdropOpen(false);
    props.refresh();
  };

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              setExpandOpen(!expandOpen);
            }}
          >
            {expandOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell size="small" width="50px">
          <Typography variant="h12">{row.orderId}</Typography>
        </TableCell>
        <TableCell align="right">
          <MultipleTags
            label={"標籤"}
            options={Object.values(allTags).map((tag) => tag)}
            chosedTags={chosedTags}
            setChosedTags={setChosedTags}
            allTags={allTags}
          />
        </TableCell>
        <TableCell align="right"> {row.createTime} </TableCell>
        <TableCell align="right"> {row.totalPrice} </TableCell>
        <TableCell align="center">
          <IconButton
            aria-label="delete"
            onClick={() => {
              handleDelete(row.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
        <TableCell align="center">
          <IconButton
            disabled={!canSend}
            color="success"
            aria-label="delete"
            onClick={() => {
              handleUpdate(
                row.id,
                orderData,
                Object.keys(chosedTags),
                totalPrice
              );
              setCanSend(false);
              console.log(canSend);
            }}
          >
            <CheckCircleIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expandOpen} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="history">
                <TableHead>
                  <TableRow>
                    <TableCell> 商品名稱 </TableCell>
                    <TableCell align="right"> 數量 </TableCell>
                    <TableCell align="right"> 小計 </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderProducts.map((orderProduct) => (
                    <TableRow
                      key={orderProduct.productId}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {orderProduct.productName}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          value={orderProduct.productAmount}
                          type="number"
                          onChange={(e) =>
                            handleAmountChange(orderProduct.productId, e)
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        {orderProduct.productPrice * orderProduct.productAmount}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: "bold" }}>
                      加總
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }} />
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {totalPrice}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
