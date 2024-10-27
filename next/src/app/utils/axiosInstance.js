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
  (error) => {
    toast.error("Unexpected Error Occurred");
    return Promise.reject(error);
  }
);

export default AxiosInstance;
