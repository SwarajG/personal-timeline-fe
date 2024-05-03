import { FileInput, Textarea, Label, Button } from "flowbite-react";
import { MdFileUpload } from "react-icons/md";
import useCreatePostForm from "./useCreatePostForm";

export default function CreatePostForm() {
  const { onFileSubmit, onCreatePost, onTextChange } = useCreatePostForm();
  return (
    <div className="py-20 flex flex-col justify-end items-center">
      <div className="w-1/2 flex flex-col justify-end items-end">
      <Textarea
        className="bg-white"
        id="content"
        placeholder="Add your thoughts here..."
        required
        rows={4}
        onChange={onTextChange}
      />
      <Button outline color="grey">
        <Label htmlFor="dropzone-file">
          <MdFileUpload className="h-6 w-6" />
        </Label>
      </Button>
      <FileInput
        id="dropzone-file"
        className="hidden"
        onChange={onFileSubmit}
      />
      <Button color="blue" onClick={onCreatePost}>
        Publish post
      </Button>
    </div>
    </div>
  );
}
