const axios = require("axios");

const RATES_API =
  "https://api.exchangerate-api.com/v4/latest/USD";

exports.getRate = async (currencyCode) => {
  try {
    if (!currencyCode || currencyCode === "USD") {
      return 1;
    }

    const response = await axios.get(RATES_API);

    const rates = response.data.rates;

    return rates[currencyCode] || 1;
  } catch (error) {
    console.error("Exchange Rate Error:", error.message);
    return 1;
  }
};