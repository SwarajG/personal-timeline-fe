import { useState } from 'react';
import createPost from '@api/post';
import { getUser } from '@globalSlice/selector';
import { useSelector } from 'react-redux';

export default function useCreatePostForm() {
  const user = useSelector(getUser);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [text, setText] = useState('');
  const onFileSubmit = (e) => {
    const file = e.target.files[0];
    const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validFileTypes.includes(file.type)) {
      return;
    }
    setUploadedFile(file);
  }

  const onTextChange = (e) => {
    setText(e.target.value.trim());
  };

  const onCreatePost = async () => {
    const form = new FormData();
    form.append('media', uploadedFile);
    form.append('text', text);
    const userID = user.id;
    const response = await createPost({ form, userID });
    console.log('response: ', response);
  }

  return {
    onTextChange,
    onFileSubmit,
    onCreatePost
  };
}