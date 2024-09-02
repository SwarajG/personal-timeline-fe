import axios, { AxiosResponse } from 'axios';

export default async function createPost(form) {
  const file = form.get('media');
  const text = form.get('text');
  const tags = form.get('tags');
  const response: AxiosResponse = await axios.post('/v1/posts', {
    text,
    file,
    tags
  }, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  console.log('response: ', response);
  return response.data.post;
}

export async function getPostsByUser(offset) {
  const response: AxiosResponse = await axios.get(`/v1/posts?offset=${offset}&limit=10`);
  return response.data.data;
}

export async function deletePostByID(id) {
  const response: AxiosResponse = await axios.delete(`/v1/posts/${id}`);
  return response.data;
}