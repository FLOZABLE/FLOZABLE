import config from "@/app/utils/config";

async function postSubscriptionInitialize(priceId) {
  const response = await fetch(
    `${config.server}/payment/subscription/initialize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ priceId }),
    }
  );
  const data = await response.json();
  return data;
}

async function getProduct(priceId) {
  const response = await fetch(
    `${config.server}/payment/product?priceId=${priceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
}

export { postSubscriptionInitialize, getProduct };
