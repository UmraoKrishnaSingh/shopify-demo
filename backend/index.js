require("@shopify/shopify-api/adapters/node");
const express = require("express");
const dotenv = require("dotenv");
const { LATEST_API_VERSION, shopifyApi } = require("@shopify/shopify-api");
const { MongoDBSessionStorage } = require("@shopify/shopify-app-session-storage-mongodb");
// const { restResources } = require("@shopify/shopify-api/rest/admin/2022-10");
const cors = require("cors");
dotenv.config();
const crypto = require("crypto");
const compare = require("secure-compare");
const app = express();
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, HOST, URL } = process.env;
const SessionStore = new MongoDBSessionStorage(
  process.env.DB_CONNECTION_STRING,
  process.env.DB_NAME,
  { sessionCollectionName: "shopifysessions" }
);
let shopify;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.debug("request received --->", req.headers.host + req.url);
  next();
});

app.get("/api/install", (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.send("No shop provided");

  // let state = shopify.auth.nonce();
  // states[`${shop}.myshopify.com`] = state;
  // console.log("states", states);
  const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${URL}/api/auth`;
  res.redirect(redirectUrl);
});

app.get("/api/auth", compareHmac, async (req, res) => {
  console.log("----- api auth called ----");
  const { shop } = req.query;
  if (!shop) return res.status(400).send("Missing shop parameter");

  await shopify.auth.begin({
    shop: shopify.utils.sanitizeShop(shop, true),
    callbackPath: "/api/callback",
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });
});

app.get("/api/callback", compareHmac, async (req, res) => {
  try {
    console.log("----- api auth callback called ----");

    const { session } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    try {
      await SessionStore.storeSession(session);
    } catch (error) {
      console.error("Error during store: ", error);
    }

    res.redirect("http://localhost:5173/shop");
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/data", async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send("Invalid request");
  const session = await SessionStore.findSessionsByShop(shop);
  if (!session?.length) return res.status(400).send("Invalid request");
  let result = await fetchProducts(session[0]);
  if (result.length) result = result.map((item) => item.node);
  if (result.length) res.status(200).send(result);
  else res.status(401).send("Invalid request");
});

async function fetchProducts(session) {
  const client = new shopify.clients.Graphql({ session });
  let products = [];

  try {
    products = (
      await client.request(
        `{
        products(first: 10) {
          edges {
            node {
              id
              title
              description
            }
          }
        }
      }`,
        { retries: 2 }
      )
    ).data.products.edges;
  } catch (error) {
    console.log(error);
  }
  return products;
}

app.get("/*", (req, res) => res.status(404).send("Api Not Found"));

function compareHmac(req, res, next) {
  const { hmac } = req.query;
  const query = req.query;
  if (!hmac) return res.send("Invalid request");

  const queryParams = Object.keys(query).filter((item) => item !== "hmac");
  let message = "";

  for (let i = 0; i < queryParams.length; i++) {
    if (i === 0) message += queryParams[i] + "=" + query[queryParams[i]];
    else message += "&" + queryParams[i] + "=" + query[queryParams[i]];
  }

  const HMAC = crypto.createHmac("sha256", SHOPIFY_API_SECRET).update(message);
  const digest = HMAC.digest("hex");

  if (compare(hmac, digest)) return next();
  else {
    console.log("failed hmac compare");
    return res.status(401).send("Invalid request");
  }
}

async function startServer() {
  const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

  // The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
  // See the ensureBilling helper to learn more about billing in this template.

  // const billingConfig = {
  // "My Shopify One-Time Charge": {
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
  // },
  // };

  shopify = shopifyApi({
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET,
    scopes: [SCOPES],
    hostName: URL.replace(/^https?:\/\//, ""),
    isEmbeddedApp: false,
    apiVersion: LATEST_API_VERSION,
    // restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined, // or replace with billingConfig above to enable example billing
    sessionStorage: SessionStore,
  });

  app.listen(PORT, () => console.log(`Server running at ${URL}`));
}

startServer();
