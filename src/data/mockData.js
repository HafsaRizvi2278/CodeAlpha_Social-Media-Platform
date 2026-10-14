const now = Date.now();
const ago = (hours) => new Date(now - hours * 3600000).toISOString();

export const demoCredentials = [
  { userId: "u1", email: "hafsa@example.com", password: "Demo1234!" },
  { userId: "u2", email: "marcus@example.com", password: "Build1234!" },
  { userId: "u3", email: "sofia@example.com", password: "Design1234!" },
];

export const seedData = {
  users: [
    { id: "u1", name: "Hafsa Ahmed", username: "hafsacodes", email: "hafsa@example.com", bio: "Full-stack learner building thoughtful things for the web. Currently exploring React and Django.", avatarUrl: "https://i.pravatar.cc/300?img=47", coverUrl: "https://images.unsplash.com/photo-1497128742402-653a7e07f344?auto=format&fit=crop&w=1200&q=80", location: "Manchester, UK", website: "https://hafsacodes.dev", createdAt: "2024-01-12T10:00:00.000Z" },
    { id: "u2", name: "Marcus Chen", username: "marcusbuilds", email: "marcus@example.com", bio: "Frontend engineer. Design systems, accessibility, and strong coffee.", avatarUrl: "https://i.pravatar.cc/300?img=11", coverUrl: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=1200&q=80", location: "Toronto, Canada", website: "https://marcusbuilds.dev", createdAt: "2023-08-20T10:00:00.000Z" },
    { id: "u3", name: "Sofia Ramirez", username: "sofiadesigns", email: "sofia@example.com", bio: "Product designer turning complex problems into calm, useful interfaces.", avatarUrl: "https://i.pravatar.cc/300?img=32", coverUrl: "https://images.unsplash.com/photo-1649061358901-8a28b9237c69?auto=format&fit=crop&w=1200&q=80", location: "Barcelona, Spain", website: "https://sofiaramirez.design", createdAt: "2023-11-03T10:00:00.000Z" },
    { id: "u4", name: "Noah Williams", username: "noahwanders", email: "noah@example.com", bio: "Developer on weekdays, trail finder on weekends. Sharing notes from both.", avatarUrl: "https://i.pravatar.cc/300?img=12", coverUrl: "https://images.unsplash.com/photo-1748086154782-23ef9132d954?auto=format&fit=crop&w=1200&q=80", location: "Denver, USA", website: "", createdAt: "2024-02-17T10:00:00.000Z" },
    { id: "u5", name: "Priya Kapoor", username: "priyalearns", email: "priya@example.com", bio: "Computer science student documenting the journey, one solved bug at a time.", avatarUrl: "https://i.pravatar.cc/300?img=45", coverUrl: "https://images.unsplash.com/photo-1632229910777-131718197ea7?auto=format&fit=crop&w=1200&q=80", location: "Delhi, India", website: "", createdAt: "2024-03-05T10:00:00.000Z" },
    { id: "u6", name: "Elliot Brooks", username: "elliotmakes", email: "elliot@example.com", bio: "Creative developer making playful experiences with code.", avatarUrl: "https://i.pravatar.cc/300?img=68", coverUrl: "https://images.unsplash.com/photo-1748086142825-6f66e3bbfb2d?auto=format&fit=crop&w=1200&q=80", location: "Melbourne, Australia", website: "https://elliotmakes.com", createdAt: "2023-06-14T10:00:00.000Z" },
  ],
  posts: [
    { id: "p1", authorId: "u2", text: "A tiny accessibility win today: our modal is now fully keyboard navigable, returns focus correctly, and announces its title. The invisible details matter.", imageUrl: "", createdAt: ago(1), updatedAt: ago(1) },
    { id: "p2", authorId: "u1", text: "Finally connected my first Django REST endpoint to a React frontend!\n\nIt’s a small step, but watching real data appear in the UI felt like magic.", imageUrl: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=1200&q=80", createdAt: ago(3), updatedAt: ago(3) },
    { id: "p3", authorId: "u3", text: "Design reminder: whitespace isn’t empty. It’s what gives content room to speak.", imageUrl: "", createdAt: ago(6), updatedAt: ago(6) },
    { id: "p4", authorId: "u4", text: "Traded my desk for this view today. Somehow the stubborn bug looked much smaller from up here.", imageUrl: "https://images.unsplash.com/photo-1748086154782-23ef9132d954?auto=format&fit=crop&w=1200&q=80", createdAt: ago(10), updatedAt: ago(10) },
    { id: "p5", authorId: "u5", text: "Study note: when a concept won’t stick, explain it out loud as if you’re teaching someone else. Found three gaps in my understanding of closures this way.", imageUrl: "", createdAt: ago(20), updatedAt: ago(20) },
    { id: "p6", authorId: "u6", text: "Experimenting with subtle motion for a portfolio interaction. The goal: guide attention, never steal it.", imageUrl: "https://images.unsplash.com/photo-1649061358901-8a28b9237c69?auto=format&fit=crop&w=1200&q=80", createdAt: ago(28), updatedAt: ago(28) },
    { id: "p7", authorId: "u1", text: "Today’s progress: database schema drafted, seed data ready, and one less mystery in Git. Calling that a good day.", imageUrl: "", createdAt: ago(36), updatedAt: ago(36) },
    { id: "p8", authorId: "u3", text: "A quick snapshot from today’s component critique. We simplified four variants down to two—and the product is clearer for it.", imageUrl: "https://images.unsplash.com/photo-1497128742402-653a7e07f344?auto=format&fit=crop&w=1200&q=80", createdAt: ago(50), updatedAt: ago(50) },
    { id: "p9", authorId: "u2", text: "Code review tip: explain the why, not just the what. A thoughtful comment teaches; a command only blocks.", imageUrl: "", createdAt: ago(72), updatedAt: ago(72) },
    { id: "p10", authorId: "u4", text: "Weekend trail, zero notifications, very full camera roll.", imageUrl: "https://images.unsplash.com/photo-1748086142825-6f66e3bbfb2d?auto=format&fit=crop&w=1200&q=80", createdAt: ago(96), updatedAt: ago(96) },
    { id: "p11", authorId: "u5", text: "Passed my algorithms assessment! Celebrating with chai and absolutely no big-O notation for the rest of the evening.", imageUrl: "", createdAt: ago(120), updatedAt: ago(120) },
    { id: "p12", authorId: "u6", text: "There’s something satisfying about a clean desk before starting a new build.", imageUrl: "https://images.unsplash.com/photo-1632229910777-131718197ea7?auto=format&fit=crop&w=1200&q=80", createdAt: ago(144), updatedAt: ago(144) },
  ],
  comments: [
    { id: "c1", postId: "p1", authorId: "u1", text: "Focus return is so often missed. Great work!", createdAt: ago(.5) },
    { id: "c2", postId: "p2", authorId: "u5", text: "That first successful request is the best feeling!", createdAt: ago(2) },
    { id: "c3", postId: "p2", authorId: "u2", text: "Huge milestone. Keep going!", createdAt: ago(1.5) },
    { id: "c4", postId: "p4", authorId: "u3", text: "What a workspace.", createdAt: ago(8) },
    { id: "c5", postId: "p5", authorId: "u1", text: "The Feynman technique never misses.", createdAt: ago(18) },
    { id: "c6", postId: "p8", authorId: "u6", text: "Constraints make systems stronger.", createdAt: ago(46) },
  ],
  likes: [
    ["u1","p1"],["u3","p1"],["u4","p1"],["u2","p2"],["u3","p2"],["u5","p2"],
    ["u1","p3"],["u2","p3"],["u6","p3"],["u1","p4"],["u3","p4"],["u5","p4"],
    ["u1","p5"],["u2","p5"],["u3","p6"],["u4","p6"],["u2","p7"],["u5","p7"],
    ["u1","p8"],["u4","p8"],["u6","p9"],["u1","p10"],["u3","p10"],["u1","p11"],
  ].map(([userId, postId]) => ({ userId, postId })),
  follows: [
    ["u1","u2"],["u1","u3"],["u2","u1"],["u2","u6"],["u3","u1"],["u3","u5"],
    ["u4","u1"],["u4","u3"],["u5","u1"],["u5","u2"],["u6","u2"],["u6","u4"],
  ].map(([followerId, followingId]) => ({ followerId, followingId })),
  currentUserId: null,
};
