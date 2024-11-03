import AxiosInstance from "@/app/utils/axiosInstance";
import { requestHandler } from "@/app/utils/Tool";

async function postSubscriptionInitialize(priceId) {
  return requestHandler(
    AxiosInstance.post(`/payment/subscription/initialize`, { priceId })
  );
}

async function getProduct(priceId) {
  return requestHandler(
    AxiosInstance.get(`/payment/product`, {
      params: { priceId },
    })
  );
}

export { postSubscriptionInitialize, getProduct };
