import express from "express";
import crypto from "crypto";

const router = express.Router();

// ── JazzCash ──────────────────────────────────────────────────
router.post("/jazzcash", async (req, res) => {
  const { mobileNumber, amount, orderId } = req.body;

  const merchantId  = process.env.JAZZCASH_MERCHANT_ID;
  const password    = process.env.JAZZCASH_PASSWORD;
  const salt        = process.env.JAZZCASH_INTEGRITY_SALT;

  const txnDateTime = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const txnRefNo   = "T" + txnDateTime;
  const amountPaisa = String(Math.round(amount * 100));

  const hashString = [
    salt, amountPaisa, "", "", "", "", "", "", "",
    merchantId, mobileNumber, "", orderId,
    "PKR", "", "MWALLET", txnDateTime, txnRefNo, password,
  ].join("&");

  const hash = crypto
    .createHmac("sha256", salt)
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  const payload = {
    pp_Version:              "1.1",
    pp_TxnType:              "MWALLET",
    pp_Language:             "EN",
    pp_MerchantID:           merchantId,
    pp_Password:             password,
    pp_MobileNumber:         mobileNumber,
    pp_CNIC:                 "",
    pp_TxnRefNo:             txnRefNo,
    pp_Amount:               amountPaisa,
    pp_TxnCurrency:          "PKR",
    pp_TxnDateTime:          txnDateTime,
    pp_BillReference:        orderId,
    pp_Description:          "Order Payment",
    pp_TxnExpiryDateTime:    txnDateTime,
    pp_SecureHash:           hash,
    ppmpf_1: "", ppmpf_2: "", ppmpf_3: "", ppmpf_4: "", ppmpf_5: "",
  };

  try {
    const response = await fetch(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();

    if (data.pp_ResponseCode === "000") {
      res.json({ success: true, message: "Payment successful", data });
    } else {
      res.json({ success: false, message: data.pp_ResponseMessage, data });
    }
  } catch (err) {
    console.error("JazzCash error:", err);
    res.status(500).json({ success: false, message: "JazzCash request failed" });
  }
});

// ── EasyPaisa ─────────────────────────────────────────────────
router.post("/easypaisa", async (req, res) => {
  const { mobileNumber, amount, orderId } = req.body;

  const storeId = process.env.EASYPAISA_STORE_ID;
  const hashKey = process.env.EASYPAISA_HASH_KEY;

  const hashString = `${amount}${orderId}${mobileNumber}${storeId}${hashKey}`;
  const hash = crypto
    .createHash("sha256")
    .update(hashString)
    .digest("hex");

  const payload = {
    storeId,
    amount,
    postBackURL:   "https://yourdomain.com/api/payment/easypaisa/callback",
    orderRefNum:   orderId,
    mobileNum:     mobileNumber,
    emailAddr:     "",
    paymentMethod: "MA",
    signature:     hash,
    autoRedirect:  0,
  };

  try {
    const response = await fetch(
      "https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/initPayment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "credentials":  Buffer.from(`${storeId}:${hashKey}`).toString("base64"),
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("EasyPaisa error:", err);
    res.status(500).json({ success: false, message: "EasyPaisa request failed" });
  }
});

export default router;