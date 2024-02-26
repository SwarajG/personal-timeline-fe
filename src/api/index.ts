import axios, { AxiosResponse } from 'axios';

async function fetchUserProfile() {
  const response: AxiosResponse = await axios.get('/v1/user/get_user_profile');
  return response.data.user;
}

async function logout() {
  const response: AxiosResponse = await axios.get('/v1/user/logout');
  return response.data;
}

export {
  fetchUserProfile,
  logout
}