import axios from "axios";
import config from "./config";
import { toast } from "react-toastify";
import axiosRetry from "axios-retry";

// Axios Interceptor Instance
const AxiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosRetry(AxiosInstance, {
  retries: 2,
  retryCondition: (error) => {
    /* console.log(
      "Retry condition triggered. Error code:",
      error.code,
      "Message:",
      error.message
    ); */
    // Retry for network errors and specific HTTP status codes
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      return true;
    }

    const retryableStatusCodes = [500, 502, 503, 504, 408];
    return retryableStatusCodes.includes(error.response?.status);
  },
  retryDelay: (retryCount) => {
    // Optional delay between retries (e.g., exponential backoff)
    return Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, etc.
  },
});

AxiosInstance.interceptors.response.use(
  (response) => {
    const message = response?.data?.message;
    const type = response?.data?.status === 200 ? "success" : "error";
    if (message && type) {
      toast(message, { type });
    }
    return response;
  },
  (err) => {
    if (err?.response?.data?.message) {
      toast.error(err?.response?.data?.message);
    }

    return Promise.reject(err);
  }
);

export default AxiosInstance;
