import useTimeLine from "./useTimeline";
import EventCard from "./components/EventCard";

export default function Timeline({ children }) {
  const { posts, onDeletePostClick } = useTimeLine();
  return (
    <>
      {children}
      <div className="flex flex-col items-center py-6">
        {posts.map((post) => (
          <EventCard
            key={post.id}
            wrapperClassName="mb-6"
            onDeletePostClick={onDeletePostClick}
            {...post}
          />
        ))}
      </div>
    </>
  );
}
