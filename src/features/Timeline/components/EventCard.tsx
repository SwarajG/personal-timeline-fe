import { Card } from "flowbite-react";
import Image from "common/Image";
import { MdDeleteOutline } from "react-icons/md";
import classNames from "classnames";

export default function EventCard({
  id,
  media_url: media,
  content,
  wrapperClassName,
  onDeletePostClick,
}) {
  return (
    <Card
      className={classNames(
        wrapperClassName,
        "w-full flex items-center",
        "max-w-sm"
      )}
      renderImage={() => (
        <Image src={media} alt={content} wrapperClassName="w-fit h-80" />
      )}
    >
      <MdDeleteOutline onClick={(e) => onDeletePostClick(e, id)} />
      <p className="font-normal text-gray-700 dark:text-gray-400">{content}</p>
    </Card>
  );
}
