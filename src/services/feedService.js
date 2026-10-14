export function getFeedPosts(posts, follows, currentUserId, tab) {
  const followingIds = new Set(
    follows
      .filter((follow) => follow.followerId === currentUserId)
      .map((follow) => follow.followingId),
  );

  return posts
    .filter(
      (post) =>
        tab === "all" ||
        post.authorId === currentUserId ||
        followingIds.has(post.authorId),
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt) - new Date(first.createdAt),
    );
}
