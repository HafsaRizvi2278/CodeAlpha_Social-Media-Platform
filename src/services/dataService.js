import { demoCredentials } from "../data/mockData.js";
const names = ["getSnapshot","login","register","logout","getCurrentUser","getUsers","getUserProfile","updateProfile","getPosts","createPost","updatePost","deletePost","getComments","addComment","deleteComment","toggleLike","followUser","unfollowUser","getFollowers","getFollowing"];
async function request(action, args) {
  const response = await fetch(`/api/actions/${action}`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({args}) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Unable to complete request.");
  return payload.result;
}
export const dataService = Object.fromEntries(names.map(name => [name, (...args) => request(name,args)]));
dataService.loginAs = userId => {
  const account = demoCredentials.find(item => item.userId === userId);
  if (!account) return Promise.reject(new Error("Demo account not found."));
  return dataService.login(account.email, account.password);
};
