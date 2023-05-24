// add a ".env" file to your project to set these environment variables
import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const {
  PAYPAL_ENVIRONMENT_MODE,
  PAYPAL_SANDBOX_CLIENT_ID,
  PAYPAL_SANDBOX_CLIENT_SECRET,
  PAYPAL_LIVE_CLIENT_ID,
  PAYPAL_LIVE_CLIENT_SECRET,
  PAYPAL_API_BASE_URL,
} = process.env;

function getConfig() {
  const env = PAYPAL_ENVIRONMENT_MODE?.toLowerCase() || "sandbox";
  return {
    paypal: {
      clientID:
        env === "sandbox" ? PAYPAL_SANDBOX_CLIENT_ID : PAYPAL_LIVE_CLIENT_ID,
      clientSecret:
        env === "sandbox"
          ? PAYPAL_SANDBOX_CLIENT_SECRET
          : PAYPAL_LIVE_CLIENT_SECRET,
      apiBaseUrl:
        PAYPAL_API_BASE_URL || env === "sandbox"
          ? "https://api-m.sandbox.paypal.com"
          : "https://api-m.paypal.com",
    },
  };
}

export default getConfig();
