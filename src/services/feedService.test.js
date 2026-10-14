import assert from "node:assert/strict";
import test from "node:test";
import { getFeedPosts } from "./feedService.js";

const posts = [
  { id: "c-new", authorId: "user-c", createdAt: "2025-01-04T00:00:00.000Z" },
  { id: "b-new", authorId: "user-b", createdAt: "2025-01-03T00:00:00.000Z" },
  { id: "a", authorId: "user-a", createdAt: "2025-01-02T00:00:00.000Z" },
  { id: "b-old", authorId: "user-b", createdAt: "2025-01-01T00:00:00.000Z" },
];

test("Following is account-scoped and responds to relationship changes", () => {
  const followsB = [{ followerId: "user-a", followingId: "user-b" }];
  assert.deepEqual(
    getFeedPosts(posts, followsB, "user-a", "following").map((post) => post.id),
    ["b-new", "a", "b-old"],
  );

  assert.deepEqual(
    getFeedPosts(posts, [], "user-a", "following").map((post) => post.id),
    ["a"],
  );

  const followsC = [{ followerId: "user-a", followingId: "user-c" }];
  assert.deepEqual(
    getFeedPosts(posts, followsC, "user-a", "following").map((post) => post.id),
    ["c-new", "a"],
  );

  assert.deepEqual(
    getFeedPosts(posts, followsB, "user-b", "following").map((post) => post.id),
    ["b-new", "b-old"],
  );
});

test("For You includes every post newest first", () => {
  assert.deepEqual(
    getFeedPosts(posts, [], "user-a", "all").map((post) => post.id),
    ["c-new", "b-new", "a", "b-old"],
  );
});
