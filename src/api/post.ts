import axios, { AxiosResponse } from 'axios';

export default async function createPost({ form, userID }) {
  const file = form.get('media');
  const text = form.get('text');
  const response: AxiosResponse = await axios.post('/v1/user/posts', {
    text,
    userID,
    file
  }, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data
}