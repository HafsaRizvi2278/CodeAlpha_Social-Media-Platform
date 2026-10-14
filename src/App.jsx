import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./components/Icons";
import { demoCredentials } from "./data/mockData";
import { dataService } from "./services/dataService";
import { getFeedPosts } from "./services/feedService";

const relativeTime = (date) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date)) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const dateLabel = (date) => new Date(date).toLocaleDateString(undefined, { month: "long", year: "numeric" });

function Avatar({ user, size = "md" }) {
  return <img className={`avatar avatar-${size}`} src={user?.avatarUrl} alt={`${user?.name || "User"}'s avatar`} />;
}

function Logo() {
  return <button className="logo" type="button" aria-label="Connectly home"><span className="logo-mark">C</span><span>Connectly</span></button>;
}

function Notice({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type || ""}`} role="status"><Icon name={toast.type === "error" ? "close" : "check"} size={17}/>{toast.text}</div>;
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({ name: "", username: "", email: "", password: "", confirm: "" });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const emailOk = /^\S+@\S+\.\S+$/.test(values.email);
    if (!values.email || !emailOk) return setError("Enter a valid email address.");
    if (!values.password) return setError("Password is required.");
    if (mode === "register") {
      if (!values.name.trim() || !values.username.trim()) return setError("Full name and username are required.");
      if (values.password.length < 8) return setError("Password must be at least 8 characters.");
      if (values.password !== values.confirm) return setError("Passwords do not match.");
    }
    setPending(true);
    try {
      if (mode === "login") await dataService.login(values.email, values.password);
      else await dataService.register(values);
      onAuth();
    } catch (err) { setError(err.message); }
    finally { setPending(false); }
  };

  const switchMode = () => { setMode(mode === "login" ? "register" : "login"); setError(""); };
  return <main className="auth-page">
    <section className="auth-intro">
      <Logo />
      <div className="auth-copy">
        <p className="eyebrow">Your people. Your progress.</p>
        <h1>Share what you’re building. <em>Grow together.</em></h1>
        <p>Connect with a community of curious makers, designers, and lifelong learners.</p>
      </div>
      <div className="auth-quote"><div className="quote-avatars">{demoCredentials.map((c, i) => <img key={c.userId} src={`https://i.pravatar.cc/80?img=${[47,11,32][i]}`} alt="" />)}</div><span>Join a thoughtful community of creators</span></div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <div className="mobile-auth-logo"><Logo /></div>
        <p className="eyebrow">{mode === "login" ? "Welcome back" : "Join Connectly"}</p>
        <h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
        <p className="muted">{mode === "login" ? "Continue the conversations you care about." : "Start sharing and connecting in a few steps."}</p>
        <form onSubmit={submit} noValidate>
          {mode === "register" && <div className="two-fields">
            <label>Full name<input value={values.name} onChange={(e) => setValues({...values, name: e.target.value})} autoComplete="name" placeholder="Your name" /></label>
            <label>Username<input value={values.username} onChange={(e) => setValues({...values, username: e.target.value})} autoComplete="username" placeholder="yourhandle" /></label>
          </div>}
          <label>Email address<input type="email" value={values.email} onChange={(e) => setValues({...values, email: e.target.value})} autoComplete="email" placeholder="you@example.com" /></label>
          <label>Password<div className="password-wrap"><input type={showPassword ? "text" : "password"} value={values.password} onChange={(e) => setValues({...values, password: e.target.value})} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" /><button type="button" className="icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}><Icon name="eye"/></button></div></label>
          {mode === "register" && <label>Confirm password<input type="password" value={values.confirm} onChange={(e) => setValues({...values, confirm: e.target.value})} autoComplete="new-password" placeholder="Repeat your password" /></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button primary wide" disabled={pending}>{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <p className="auth-switch">{mode === "login" ? "New to Connectly?" : "Already have an account?"} <button type="button" onClick={switchMode}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
        {mode === "login" && <div className="demo-box">
          <div><strong>Try a demo account</strong><span>Choose a persona to explore Connectly.</span></div>
          <div className="demo-list">{demoCredentials.map((credential, index) => <button key={credential.userId} type="button" disabled={pending} onClick={async () => { setPending(true); await dataService.loginAs(credential.userId); onAuth(); }}><img src={`https://i.pravatar.cc/80?img=${[47,11,32][index]}`} alt="" /><span>{["Hafsa Ahmed","Marcus Chen","Sofia Ramirez"][index]}<small>{credential.email}</small></span><Icon name="chevron" size={18}/></button>)}</div>
          <button className="demo-fill" type="button" onClick={() => setValues({...values, email: "hafsa@example.com", password: "Demo1234!"})}>Use demo account credentials</button>
        </div>}
      </div>
    </section>
  </main>;
}

function Sidebar({ currentUser, view, navigate, logout }) {
  const items = [["home","home","Home"],["explore","search","Explore"],["profile","user","My Profile"]];
  return <aside className="sidebar">
    <Logo />
    <nav>{items.map(([target, icon, label]) => <button key={target} className={view.type === target ? "active" : ""} onClick={() => navigate(target)}><Icon name={icon}/><span>{label}</span></button>)}</nav>
    <div className="sidebar-user">
      <button className="user-summary" onClick={() => navigate("profile")}><Avatar user={currentUser}/><span><strong>{currentUser.name}</strong><small>@{currentUser.username}</small></span></button>
      <button className="icon-button" onClick={logout} aria-label="Log out"><Icon name="logout"/></button>
    </div>
  </aside>;
}

function MobileHeader({ currentUser, logout }) {
  return <header className="mobile-header"><Logo/><div><Avatar user={currentUser} size="sm"/><button className="icon-button" onClick={logout} aria-label="Log out"><Icon name="logout"/></button></div></header>;
}

function BottomNav({ view, navigate }) {
  return <nav className="bottom-nav">{[["home","home","Home"],["explore","search","Explore"],["profile","user","Profile"]].map(([target,icon,label]) => <button className={view.type === target ? "active" : ""} onClick={() => navigate(target)} key={target}><Icon name={icon}/><span>{label}</span></button>)}</nav>;
}

function FollowButton({ userId, currentUserId, follows, onToggle, compact = false }) {
  if (userId === currentUserId) return null;
  const following = follows.some((f) => f.followerId === currentUserId && f.followingId === userId);
  return <button className={`button ${following ? "secondary selected" : "primary"} ${compact ? "small" : ""}`} onClick={() => onToggle(userId, following)}>{following ? "Following" : "Follow"}</button>;
}

function PersonRow({ user, currentUser, follows, onToggle, onProfile }) {
  return <div className="person-row"><button className="person-identity" onClick={() => onProfile(user.id)}><Avatar user={user}/><span><strong>{user.name}</strong><small>@{user.username}</small></span></button><FollowButton userId={user.id} currentUserId={currentUser.id} follows={follows} onToggle={onToggle} compact/></div>;
}

function Composer({ currentUser, onCreate, compact = false, initial, onCancel }) {
  const [text, setText] = useState(initial?.text || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const fileRef = useRef();
  const chooseImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) return setError("Choose a JPG, PNG, WebP, or GIF image.");
    if (file.size > 4 * 1024 * 1024) return setError("Image must be smaller than 4 MB.");
    const reader = new FileReader();
    reader.onload = () => { setImageUrl(reader.result); setError(""); };
    reader.readAsDataURL(file);
  };
  const submit = async () => {
    if (!text.trim() && !imageUrl) return setError("Add some text or an image.");
    setPending(true);
    try { await onCreate({ text, imageUrl }); setText(""); setImageUrl(""); }
    finally { setPending(false); }
  };
  return <div className={`composer ${compact ? "editing" : "card"}`}>
    {!compact && <Avatar user={currentUser}/>}
    <div className="composer-body">
      <textarea value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder={compact ? "Update your post…" : "What are you building or learning?"} aria-label="Post text"/>
      {imageUrl && <div className="image-preview"><img src={imageUrl} alt="Post preview"/><button className="image-remove" onClick={() => setImageUrl("")} aria-label="Remove image"><Icon name="close" size={16}/></button></div>}
      {error && <p className="form-error">{error}</p>}
      <div className="composer-footer"><div><button className="composer-tool" type="button" onClick={() => fileRef.current.click()} aria-label="Add image"><Icon name="image"/><span>Add image</span></button><input ref={fileRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage}/><span className={text.length > 470 ? "counter warn" : "counter"}>{text.length}/500</span></div><div className="action-row">{onCancel && <button className="button ghost" onClick={onCancel}>Cancel</button>}<button className="button primary" disabled={pending || (!text.trim() && !imageUrl)} onClick={submit}>{pending ? "Saving…" : compact ? "Save changes" : "Create Post"}</button></div></div>
    </div>
  </div>;
}

function PostCard({ post, users, currentUser, comments, likes, onRefresh, onProfile, notify }) {
  const author = users.find((u) => u.id === post.authorId);
  const postComments = comments.filter((c) => c.postId === post.id);
  const liked = likes.some((l) => l.postId === post.id && l.userId === currentUser.id);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const own = post.authorId === currentUser.id;
  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return setCommentError("Write a comment before posting.");
    await dataService.addComment(post.id, currentUser.id, comment);
    setComment(""); setCommentError(""); onRefresh();
  };
  const removePost = async () => {
    if (!window.confirm("Delete this post and all of its comments?")) return;
    await dataService.deletePost(post.id); notify("Post deleted."); onRefresh();
  };
  return <article className="post-card card">
    <header className="post-header">
      <button className="post-author" onClick={() => onProfile(author.id)}><Avatar user={author}/><span><strong>{author.name}</strong><small>@{author.username} · {relativeTime(post.createdAt)} {post.updatedAt !== post.createdAt && <em>· Edited</em>}</small></span></button>
      {own && <div className="menu-wrap"><button className="icon-button" aria-label="Post options" onClick={() => setMenuOpen(!menuOpen)}><Icon name="more"/></button>{menuOpen && <div className="overflow-menu"><button onClick={() => {setEditing(true);setMenuOpen(false)}}><Icon name="edit" size={17}/>Edit post</button><button className="danger" onClick={removePost}><Icon name="trash" size={17}/>Delete post</button></div>}</div>}
    </header>
    {editing ? <Composer currentUser={currentUser} compact initial={post} onCancel={() => setEditing(false)} onCreate={async (values) => { await dataService.updatePost(post.id, values); setEditing(false); notify("Post updated."); onRefresh(); }}/> : <>
      {post.text && <p className="post-text">{post.text}</p>}
      {post.imageUrl && <img className="post-image" src={post.imageUrl} alt={`Post shared by ${author.name}`}/>}
    </>}
    <div className="post-actions">
      <button className={liked ? "liked" : ""} onClick={async () => { await dataService.toggleLike(post.id, currentUser.id); onRefresh(); }} aria-pressed={liked}><Icon name="heart"/><span>{likes.filter((l) => l.postId === post.id).length}</span><span className="action-label">{liked ? "Liked" : "Like"}</span></button>
      <button onClick={() => setCommentsOpen(!commentsOpen)} aria-expanded={commentsOpen}><Icon name="comment"/><span>{postComments.length}</span><span className="action-label">Comment</span></button>
    </div>
    {commentsOpen && <section className="comments">
      {postComments.length ? postComments.map((item) => {
        const user = users.find((u) => u.id === item.authorId);
        return <div className="comment" key={item.id}><button onClick={() => onProfile(user.id)}><Avatar user={user} size="sm"/></button><div className="comment-bubble"><div><button onClick={() => onProfile(user.id)}><strong>{user.name}</strong></button><span>@{user.username} · {relativeTime(item.createdAt)}</span></div><p>{item.text}</p></div>{item.authorId === currentUser.id && <button className="comment-delete" aria-label="Delete your comment" onClick={async () => { if (window.confirm("Delete this comment?")) { await dataService.deleteComment(item.id); onRefresh(); } }}><Icon name="trash" size={15}/></button>}</div>;
      }) : <p className="empty-comments">No comments yet. Start the conversation.</p>}
      <form className="comment-form" onSubmit={addComment}><Avatar user={currentUser} size="sm"/><div><input value={comment} maxLength={300} onChange={(e) => {setComment(e.target.value);setCommentError("")}} placeholder="Write a comment…" aria-label="Write a comment"/>{commentError && <small className="form-error">{commentError}</small>}</div><button className="button primary small" disabled={!comment.trim()}>Post</button></form>
    </section>}
  </article>;
}

function Feed({ data, currentUser, onRefresh, onProfile, notify }) {
  const [tab, setTab] = useState("all");
  const posts = getFeedPosts(data.posts, data.follows, currentUser.id, tab);
  return <div className="content-stack">
    <div className="page-heading"><div><p className="eyebrow">Your community</p><h1>Home</h1></div></div>
    <div className="tabs"><button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>For You</button><button className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}>Following</button></div>
    <Composer currentUser={currentUser} onCreate={async (values) => { await dataService.createPost(currentUser.id, values); notify("Your post is live."); onRefresh(); }}/>
    {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} users={data.users} currentUser={currentUser} comments={data.comments} likes={data.likes} onRefresh={onRefresh} onProfile={onProfile} notify={notify}/>) : tab === "following" ? <Empty title="Your following feed is quiet" text="Your posts will appear here too. Follow someone to see what they share."/> : <Empty title="No posts yet" text="Be the first to share what you’re building or learning."/>}
  </div>;
}

function Empty({ title, text }) {
  return <div className="empty card"><span className="empty-icon"><Icon name="search"/></span><h3>{title}</h3><p>{text}</p></div>;
}

function Explore({ data, currentUser, onRefresh, onProfile, onFollow, notify }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("people");
  const q = query.trim().toLowerCase();
  const people = data.users.filter((u) => u.id !== currentUser.id && (!q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)));
  const posts = data.posts.filter((p) => !q || p.text.toLowerCase().includes(q)).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const results = tab === "people" ? people : posts;
  return <div className="content-stack">
    <div className="page-heading"><div><p className="eyebrow">Discover something new</p><h1>Explore</h1></div></div>
    <div className="search-box"><Icon name="search"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people or posts…" aria-label="Search people or posts"/>{query && <button className="icon-button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={18}/></button>}</div>
    <div className="tabs"><button className={tab === "people" ? "active" : ""} onClick={() => setTab("people")}>People</button><button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>Posts</button></div>
    <p className="result-count">{results.length} {results.length === 1 ? "result" : "results"}{q && ` for “${query}”`}</p>
    {tab === "people" ? <div className="people-grid">{people.map((user) => <div className="person-card card" key={user.id}><button onClick={() => onProfile(user.id)}><Avatar user={user} size="lg"/><strong>{user.name}</strong><span>@{user.username}</span><p>{user.bio}</p></button><FollowButton userId={user.id} currentUserId={currentUser.id} follows={data.follows} onToggle={onFollow}/></div>)}</div> : posts.map((post) => <PostCard key={post.id} post={post} users={data.users} currentUser={currentUser} comments={data.comments} likes={data.likes} onRefresh={onRefresh} onProfile={onProfile} notify={notify}/>)}
    {!results.length && <Empty title="No matches found" text="Try a different name, username, or phrase."/>}
  </div>;
}

function Modal({ title, onClose, children }) {
  const closeRef = useRef();
  useEffect(() => {
    closeRef.current?.focus();
    const handler = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">{title}</h2><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button></header>{children}</section></div>;
}

function EditProfile({ user, onClose, onSaved, notify }) {
  const [values, setValues] = useState({ name: user.name, bio: user.bio, location: user.location, website: user.website, avatarUrl: user.avatarUrl, coverUrl: user.coverUrl });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const file = (key) => (event) => {
    const selected = event.target.files[0];
    if (!selected || !selected.type.startsWith("image/") || selected.size > 4 * 1024 * 1024) return setError("Choose an image smaller than 4 MB.");
    const reader = new FileReader(); reader.onload = () => setValues({...values, [key]: reader.result}); reader.readAsDataURL(selected);
  };
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!values.name.trim()) return setError("Name is required.");
    if (values.website) { try { new URL(values.website); } catch { return setError("Enter a complete website URL, including https://"); } }
    setPending(true); await dataService.updateProfile(user.id, values); notify("Profile updated."); onSaved(); onClose();
  };
  return <Modal title="Edit profile" onClose={onClose}><form className="profile-form" onSubmit={submit}>
    <div className="edit-images"><div className="edit-cover" style={{backgroundImage: values.coverUrl ? `url(${values.coverUrl})` : undefined}}><label className="upload-pill"><Icon name="image" size={16}/>Change cover<input type="file" accept="image/*" onChange={file("coverUrl")}/></label></div><div className="edit-avatar"><img src={values.avatarUrl} alt="Avatar preview"/><label aria-label="Change avatar"><Icon name="image" size={16}/><input type="file" accept="image/*" onChange={file("avatarUrl")}/></label></div></div>
    <label>Full name<input value={values.name} onChange={(e) => setValues({...values,name:e.target.value})}/></label>
    <label>Bio<textarea maxLength={180} value={values.bio} onChange={(e) => setValues({...values,bio:e.target.value})}/><small>{values.bio.length}/180</small></label>
    <div className="two-fields"><label>Location<input value={values.location} onChange={(e) => setValues({...values,location:e.target.value})}/></label><label>Website<input value={values.website} onChange={(e) => setValues({...values,website:e.target.value})} placeholder="https://example.com"/></label></div>
    {error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button></div>
  </form></Modal>;
}

function Profile({ profileId, data, currentUser, onRefresh, onProfile, onFollow, notify }) {
  const user = data.users.find((u) => u.id === profileId) || currentUser;
  const own = user.id === currentUser.id;
  const [editOpen, setEditOpen] = useState(false);
  const [list, setList] = useState(null);
  const followers = data.follows.filter((f) => f.followingId === user.id);
  const following = data.follows.filter((f) => f.followerId === user.id);
  const posts = data.posts.filter((p) => p.authorId === user.id).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  const listUsers = list === "Followers" ? data.users.filter((u) => followers.some((f) => f.followerId === u.id)) : data.users.filter((u) => following.some((f) => f.followingId === u.id));
  return <div className="content-stack">
    <section className="profile-card card">
      <div className="profile-cover" style={{backgroundImage: user.coverUrl ? `url(${user.coverUrl})` : undefined}}></div>
      <div className="profile-body">
        <div className="profile-top"><Avatar user={user} size="xl"/>{own ? <button className="button secondary" onClick={() => setEditOpen(true)}><Icon name="edit" size={17}/>Edit profile</button> : <FollowButton userId={user.id} currentUserId={currentUser.id} follows={data.follows} onToggle={onFollow}/>}</div>
        <h1>{user.name}</h1><p className="handle">@{user.username}</p><p className="profile-bio">{user.bio}</p>
        <div className="profile-meta">{user.location && <span><Icon name="pin" size={17}/>{user.location}</span>}{user.website && <a href={user.website} target="_blank" rel="noreferrer"><Icon name="link" size={17}/>{user.website.replace(/^https?:\/\//,"")}</a>}<span><Icon name="calendar" size={17}/>Joined {dateLabel(user.createdAt)}</span></div>
        <div className="profile-stats"><span><strong>{posts.length}</strong> Posts</span><button onClick={() => setList("Followers")}><strong>{followers.length}</strong> Followers</button><button onClick={() => setList("Following")}><strong>{following.length}</strong> Following</button></div>
      </div>
    </section>
    <div className="section-title"><h2>Posts</h2><span>{posts.length}</span></div>
    {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} users={data.users} currentUser={currentUser} comments={data.comments} likes={data.likes} onRefresh={onRefresh} onProfile={onProfile} notify={notify}/>) : <Empty title="Nothing shared yet" text={own ? "Your next idea could start a great conversation." : `${user.name} hasn’t posted yet.`}/>}
    {editOpen && <EditProfile user={user} onClose={() => setEditOpen(false)} onSaved={onRefresh} notify={notify}/>}
    {list && <Modal title={list} onClose={() => setList(null)}><div className="modal-list">{listUsers.length ? listUsers.map((item) => <PersonRow key={item.id} user={item} currentUser={currentUser} follows={data.follows} onToggle={onFollow} onProfile={(id) => {setList(null);onProfile(id)}}/>) : <Empty title={`No ${list.toLowerCase()} yet`} text="This list will grow as more connections are made."/ >}</div></Modal>}
  </div>;
}

function RightRail({ data, currentUser, onFollow, onProfile }) {
  const suggestions = data.users.filter((u) => u.id !== currentUser.id && !data.follows.some((f) => f.followerId === currentUser.id && f.followingId === u.id)).slice(0,3);
  return <aside className="right-rail">
    <section className="rail-card"><div className="rail-heading"><h2>People to follow</h2></div>{suggestions.length ? suggestions.map((user) => <PersonRow key={user.id} user={user} currentUser={currentUser} follows={data.follows} onToggle={onFollow} onProfile={onProfile}/>) : <p className="rail-empty">You’re all caught up. Explore the community for more people.</p>}</section>
    <section className="community-card"><span className="community-icon">C</span><h3>Made for meaningful progress</h3><p>Connectly is a small space to share what you’re learning and cheer others on.</p></section>
    <p className="rail-footer">Connectly demo · Frontend simulation</p>
  </aside>;
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState({ type: "home" });
  const [toast, setToast] = useState(null);

  const refresh = async () => {
    try { setData(await dataService.getSnapshot()); setLoadError(""); }
    catch { setLoadError("We couldn’t load Connectly right now."); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);
  const notify = (text, type = "success") => { setToast({text,type}); window.setTimeout(() => setToast(null), 2600); };
  const navigate = (type, profileId) => { setView({type, profileId}); window.scrollTo({top:0, behavior:"smooth"}); };
  const currentUser = useMemo(() => data?.users.find((u) => u.id === data.currentUserId), [data]);
  const follow = async (userId, isFollowing) => {
    const followerId = currentUser.id;
    setData((current) => ({
      ...current,
      follows: isFollowing
        ? current.follows.filter((follow) => !(follow.followerId === followerId && follow.followingId === userId))
        : [...current.follows, { followerId, followingId: userId }],
    }));
    try {
      if (isFollowing) await dataService.unfollowUser(followerId, userId);
      else await dataService.followUser(followerId, userId);
      await refresh();
      notify(isFollowing ? "User unfollowed." : "You’re now following them.");
    } catch {
      await refresh();
      notify("We couldn’t update that follow right now.", "error");
    }
  };

  if (loading) return <div className="loading"><span className="loader"/><p>Opening Connectly…</p></div>;
  if (loadError) return <main className="error-page"><Empty title="Something went wrong" text={loadError}/><button className="button primary" onClick={refresh}>Try again</button></main>;
  if (!currentUser) return <><AuthScreen onAuth={refresh}/><Notice toast={toast}/></>;
  const content = view.type === "home" ? <Feed key={currentUser.id} data={data} currentUser={currentUser} onRefresh={refresh} onProfile={(id) => navigate("profile", id)} notify={notify}/> : view.type === "explore" ? <Explore data={data} currentUser={currentUser} onRefresh={refresh} onProfile={(id) => navigate("profile",id)} onFollow={follow} notify={notify}/> : <Profile profileId={view.profileId || currentUser.id} data={data} currentUser={currentUser} onRefresh={refresh} onProfile={(id) => navigate("profile",id)} onFollow={follow} notify={notify}/>;
  return <div className="app-shell">
    <Sidebar currentUser={currentUser} view={view} navigate={navigate} logout={async () => { await dataService.logout(); setView({type:"home"}); refresh(); }}/>
    <MobileHeader currentUser={currentUser} logout={async () => { await dataService.logout(); refresh(); }}/>
    <main className="main-content">{content}</main>
    <RightRail data={data} currentUser={currentUser} onFollow={follow} onProfile={(id) => navigate("profile",id)}/>
    <BottomNav view={view} navigate={navigate}/>
    <Notice toast={toast}/>
  </div>;
}
