import axios from "axios";
import config from "./config";
import { toast } from "react-toastify";

// Axios Interceptor Instance
const AxiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true,
});

AxiosInstance.interceptors.response.use(
  (response) => {
    console.log(response);
    const message = response?.data?.message;
    const type = response?.data?.status;
    if (message && type) {
      toast(message, { type });
    }
    return response;
  },
  (err) => {
    if (err?.response?.data?.message) {
      toast.error(err?.response?.data?.message);
    } else {
      toast.error("Unexpected Error Occurred");
    }
    console.log(err);
    return Promise.reject(err);
  }
);

export default AxiosInstance;
