import axios from "axios";
import config from "./config";

// Axios Interceptor Instance
const AxiosInstance = axios.create({
  baseURL: config.server,
  withCredentials: true
});

export default AxiosInstance;
