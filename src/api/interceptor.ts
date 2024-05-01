import axios from 'axios';

axios.interceptors.request.use(function (config) {
  config.baseURL = 'http://localhost:3001';
  config.withCredentials = true;
  return config;
}, function (error) {
  return Promise.reject(error);
});