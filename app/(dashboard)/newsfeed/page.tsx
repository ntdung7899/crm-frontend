import { FeedView } from "./components/feed/FeedView";

export default function NewsfeedPage() {
  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <FeedView />
      </div>
    </div>
  );
}
