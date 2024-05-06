import axios, { AxiosResponse } from 'axios';

export default async function createPost(form) {
  const file = form.get('media');
  const text = form.get('text');
  const response: AxiosResponse = await axios.post('/v1/posts', {
    text,
    file
  }, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data
}

export async function getPostsByUser() {
  const response: AxiosResponse = await axios.get('/v1/posts');
  return response.data.data;
}

export async function deletePostByID(id) {
  const response: AxiosResponse = await axios.delete(`/v1/posts/${id}`);
  return response.data;
}