//  AXIOS USED TO AVOID REPATING BASE URL AND COOKIE CONFIG

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // change if needed
  withCredentials: true, // IMPORTANT for cookies
});

export default api;
