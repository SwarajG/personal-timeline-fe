import axios, { AxiosResponse } from 'axios';

async function createNewTag(inputValue: string) {
  const response: AxiosResponse = await axios.post('/v1/tags', {
    text: inputValue
  });
  return response.data;
}

async function getTags(inputValue: string) {
  const response: AxiosResponse = await axios.get(`/v1/tags?text=${inputValue}`);
  return response.data;
}

export { createNewTag, getTags };