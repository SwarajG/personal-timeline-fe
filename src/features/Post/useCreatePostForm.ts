import { useState } from 'react';
import { useDispatch } from "react-redux";
import { debounce } from 'lodash';
import createPost from '@api/post';
import { createNewTag, getTags } from '@api/tags';
import { addPost } from "../Timeline/slices/appSlice";

interface Option {
  readonly label: string;
  readonly value: number;
}

export default function useCreatePostForm() {
  const dispatch = useDispatch();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  // const [options, setOptions] = useState<Option[]>([]);
  const [value, setValue] = useState<readonly Option[]>([]);
  // const [defaultOptions, setDefaultOptions] = useState([]);

  const createOption = (label: string, value: number) => ({
    label,
    value
  });

  const onChange = (data: [Option]) => {
    setSelectedTags(data);
  }

  const handleCreate = async (inputValue: string) => {
    setIsLoading(true);
    createNewTag(inputValue).then((data) => {
      const { tag: { id, text } } = data;
      const newOption = createOption(text, id);
      setValue(prev => [...prev, newOption]);
      setIsLoading(false);
      setSelectedTags((prevOptions) => [...prevOptions, newOption]);
    });
  };

  const onFileSubmit = (e) => {
    const file = e.target.files[0];
    const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validFileTypes.includes(file.type)) {
      return;
    }
    setUploadedFile(file);
  }

  const onTextChange = (e) => {
    const text = e.target.value.trim();
    setText(text);
  };

  const onCreatePost = async () => {
    const form = new FormData();
    const tags = selectedTags.map(({ value }) => value);
    form.append('media', uploadedFile);
    form.append('text', text);
    form.append('tags', tags.join(','));
    try {
      const post = await createPost(form);
      dispatch(addPost(post))
    } catch (error) {
      // console.log('response: ', response);
    }
  }

  const promiseOptions = (inputValue: string) =>
    new Promise<Option[]>(async (resolve) => {
      let finalList = [];
      // const findLocally = options.filter(({ label }) => label.includes(inputValue));
      // finalList = findLocally;
      getTags(inputValue).then((response) => {
        const { tags } = response;
        finalList = [...finalList, ...tags.map(({ id, text }) => ({ label: text, value: id }))];
        resolve(finalList);
      });
    });

  return {
    // inputValue,
    setValue,
    // defaultOptions,
    value,
    promiseOptions,
    isLoading,
    selectedTags,
    onChange,
    onTextChange,
    onFileSubmit,
    onCreatePost,
    handleCreate,
  };
}