import { Button, Modal, Avatar, Card } from "flowbite-react";
import { format } from "date-fns";
import Image from "common/Image";
import { MdDeleteOutline, MdOutlineWarningAmber } from "react-icons/md";
import classNames from "classnames";
import useEventCard from "./useEventCard";

export default function EventCard({
  id,
  media_url: media,
  content,
  tags,
  created_at,
  user: { id: userID, picture, displayName },
  wrapperClassName,
  onDeletePostClick,
}) {
  const { openModal, onModalOpen, onModalClose, onDeleteClick } = useEventCard(
    id,
    onDeletePostClick
  );
  return (
    <>
      <Modal show={openModal} size="md" onClose={onModalClose} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <MdOutlineWarningAmber className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={onDeleteClick}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={onModalClose}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <div
        className={classNames(
          wrapperClassName,
          "bg-white w-full px-4 py-2 rounded"
        )}
      >
        <div className="w-full flex items-center">
          <Avatar alt="User settings" img={picture} rounded />
          <div className="flex flex-col items-start ml-2">
            <a href="#" className="">
              {displayName}
            </a>
            <p>{format(created_at, "MMM dd, yyyy hh:mm aaa")}</p>
          </div>
        </div>
        <div>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {content}
          </p>
          <div className="flex">
            {tags?.map(({ text, id }) => (
              <a href="#" key={id} className="mr-2">
                #{text}
              </a>
            ))}
          </div>
          {media && (
            <Image src={media} alt={content} wrapperClassName="w-fit h-80" />
          )}
        </div>
      </div>
      {/* <Card
        className={classNames(
          "w-full flex items-center",
          "max-w-sm",
          wrapperClassName
        )}
        renderImage={() =>
          media && (
            <Image src={media} alt={content} wrapperClassName="w-fit h-80" />
          )
        }
      >
        <div className="flex items-start">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Noteworthy technology acquisitions 2021
          </h5>
          <Button onClick={onModalOpen} size="xs">
            <MdDeleteOutline className="text-xl" />
          </Button>
        </div>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Here are the biggest enterprise technology acquisitions of 2021 so
          far, in reverse chronological order.
        </p>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {content}
        </p>
      </Card> */}
    </>
  );
}
