const bodyParser = require("body-parser");
const express = require("express");
const  engines = require("consolidate");
const paypal = require("paypal-rest-sdk");


const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'AXJ2CvF7wpoyY_MciVzhj0AISNIqm5tDuLuhyXk0YA8CoT2_R9vTP-oHKJBTnXpKbJQCb60Wb7f2uVWC',
  'client_secret': 'EOT9dcJFt5OpBpVT3Q3PSPUk7wg3JvsZTWoT-uz6QjzRdYL-0tDaSOuBeW91TxTZtVY4bOLWHmvzIdXR'
});

app.get("/", (req, res)=>{
  res.render("index");
});

app.get("/paypal", (req, res)=>{
  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:5000/done",
        "cancel_url": "http://localhost/bugs"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": "1.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "1.00"
        },
        "description": "This is the payment description."
    }]
};


paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        console.log("Create Payment Response");
        console.log(payment);
        res.redirect(payment.links[1].href);
    }
});

});

app.get("/done", (req, res)=>{
 
  var paymentId= req.query.paymentId;
  var payerID = req.query.PayerID;

  var execute_payment_json ={
    "payer_id": payerID,
    "transactions" : [{
      "amount" : {
        "currency" : "USD",
        "total" :"1.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment){
    if(error){
      throw error;
    }
    else {
      res.render("done")
    }
  });
});

app.get("/bugs", (req, res)=>{
  res.render('bugs');
});

app.listen(5000, ()=>{
  console.log("server is running>>>>");
})