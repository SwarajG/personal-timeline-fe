import axios from 'axios';

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  config.baseURL = 'http://localhost:3001';
  config.withCredentials = true;
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});