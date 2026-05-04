const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    avatar_url: { type: String, default: "" },
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    cover_image_url: { type: String, default: "" },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["blog", "marketing"], required: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },

    hero_image_url: { type: String, default: "" },
    thumbnail_url: { type: String, default: "" },

    // blog fields
    views: { type: Number, default: 0 },
    topic: { type: String, default: "" },

    // marketing fields
    tag: { type: String, default: "" },
    reading_minutes: { type: Number, default: 30 },
    price_cents: { type: Number, default: 0 },
    old_price_cents: { type: Number, default: 0 },

    author: { type: AuthorSchema, required: true },
  },
  { timestamps: true }
);

const SubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const Subscriber = mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);

// ---------- Seed ----------
async function seedIfEmpty() {
  const count = await Post.countDocuments({});
  if (count > 0) return;

  await Category.insertMany([
    { name: "DevSecOps", slug: "devsecops", cover_image_url: "https://picsum.photos/seed/devsecops/1200/900" },
    { name: "Cloud & AWS", slug: "cloud-aws", cover_image_url: "https://picsum.photos/seed/cloudaws/1200/900" },
    { name: "Kubernetes", slug: "kubernetes", cover_image_url: "https://picsum.photos/seed/k8s/1200/900" },
    { name: "Observability", slug: "observability", cover_image_url: "https://picsum.photos/seed/observability/1200/900" },
  ]);

  await Post.insertMany([
    // HERO blog
    {
      type: "blog",
      slug: "agentic-aiops-keep-p95-under-200ms",
      title: "Agentic AIOps: Keeping p95 Latency Under 200ms During Noise Traffic",
      excerpt:
        "A practical blueprint: scale only when needed, prioritize critical requests, and respond to attacks — coordinated by an agent.",
      hero_image_url: "https://picsum.photos/seed/hero-aiops/1600/900",
      thumbnail_url: "https://picsum.photos/seed/hero-aiops-thumb/800/500",
      author: { name: "LinguaSphere Team", avatar_url: "https://i.pravatar.cc/80?img=15" },
      views: 128540,
      topic: "DevSecOps",
    },

    // RELATED blog
    {
      type: "blog",
      slug: "dockerfile-to-compose-production-checklist",
      title: "From Dockerfile to docker-compose: A Production-Ready Checklist",
      excerpt:
        "Common container pitfalls (env, ports, healthchecks, volumes) and a clean compose setup for smooth dev and demo runs.",
      hero_image_url: "https://picsum.photos/seed/blog-compose/1600/900",
      thumbnail_url: "https://picsum.photos/seed/blog-compose-thumb/800/500",
      author: { name: "Nam", avatar_url: "https://i.pravatar.cc/80?img=8" },
      views: 90520,
      topic: "Kubernetes",
    },
    {
      type: "blog",
      slug: "trivy-sonarcloud-fast-gates",
      title: "Trivy + SonarCloud in CI/CD: Secure Gates Without Slowing the Team",
      excerpt:
        "How to set thresholds, caching, and quality gates so your pipeline stays secure — without killing release velocity.",
      hero_image_url: "https://picsum.photos/seed/blog-trivy/1600/900",
      thumbnail_url: "https://picsum.photos/seed/blog-trivy-thumb/800/500",
      author: { name: "Vy", avatar_url: "https://i.pravatar.cc/80?img=31" },
      views: 110230,
      topic: "DevSecOps",
    },
    {
      type: "blog",
      slug: "k8s-hpa-vpa-when-to-use",
      title: "HPA vs VPA: When to Scale Replicas vs Resources",
      excerpt:
        "A simple mental model + examples. Avoid thrashing, wasted cost, and unstable performance during load spikes.",
      hero_image_url: "https://picsum.photos/seed/blog-hpa/1600/900",
      thumbnail_url: "https://picsum.photos/seed/blog-hpa-thumb/800/500",
      author: { name: "Huy", avatar_url: "https://i.pravatar.cc/80?img=22" },
      views: 76840,
      topic: "Kubernetes",
    },
    {
      type: "blog",
      slug: "prometheus-alerts-that-dont-spam",
      title: "Prometheus Alerts That Don’t Spam: SLO-Driven Alerting",
      excerpt:
        "Write alerts that matter, reduce noisy pages, and organize routing/labels so on-call can triage fast.",
      hero_image_url: "https://picsum.photos/seed/blog-prom/1600/900",
      thumbnail_url: "https://picsum.photos/seed/blog-prom-thumb/800/500",
      author: { name: "Lina", avatar_url: "https://i.pravatar.cc/80?img=47" },
      views: 84510,
      topic: "Observability",
    },

    // MARKETING courses
    {
      type: "marketing",
      slug: "aws-saa-foundations",
      title: "AWS Certified Solutions Architect",
      excerpt:
        "Learn IAM, VPC, EC2, and S3. Choose the right services for real problems with cost and security in mind.",
      tag: "Cloud",
      thumbnail_url:
        "https://images.unsplash.com/photo-1736220690063-d65115e1bec6?auto=format&fit=crop&w=1200&q=80",
      author: { name: "Lina", avatar_url: "https://i.pravatar.cc/80?img=47" },
      reading_minutes: 35,
      price_cents: 8900,
      old_price_cents: 11900,
    },
    {
      type: "marketing",
      slug: "kubernetes-deploy-and-scale",
      title: "Kubernetes for DevOps — Deploy & Scale",
      excerpt:
        "Deployments, Services, Ingress, and HPA. Build a clean workflow to ship reliably and scale with confidence.",
      tag: "Kubernetes",
      thumbnail_url: "https://picsum.photos/seed/k8s-course/1200/900",
      author: { name: "Nam", avatar_url: "https://i.pravatar.cc/80?img=15" },
      reading_minutes: 42,
      price_cents: 9900,
      old_price_cents: 12900,
    },
    {
      type: "marketing",
      slug: "secure-ci-cd-devsecops",
      title: "Practical DevSecOps — Secure CI/CD",
      excerpt:
        "Trivy, SBOM, secret scanning, and policy gates. Build secure pipelines while keeping fast iteration.",
      tag: "DevSecOps",
      thumbnail_url: "https://picsum.photos/seed/devsecops-course/1200/900",
      author: { name: "Vy", avatar_url: "https://i.pravatar.cc/80?img=31" },
      reading_minutes: 38,
      price_cents: 10500,
      old_price_cents: 13900,
    },
    {
      type: "marketing",
      slug: "observability-prometheus-grafana",
      title: "Observability — Prometheus & Grafana",
      excerpt:
        "Metrics, dashboards, and SLO-based alerts. Reduce alert noise and debug incidents faster.",
      tag: "Observability",
      thumbnail_url: "https://picsum.photos/seed/obs-course/1200/900",
      author: { name: "Huy", avatar_url: "https://i.pravatar.cc/80?img=22" },
      reading_minutes: 30,
      price_cents: 8600,
      old_price_cents: 10900,
    },
  ]);
}

// ---------- Queries used by controller ----------
async function getHero() {
  return Post.findOne({ type: "blog" }).sort({ createdAt: -1 }).lean();
}

async function getCategories() {
  return Category.find({}).sort({ createdAt: 1 }).limit(50).lean();
}

async function getRelated(page = 0, pageSize = 2) {
  const q = { type: "blog" };
  const total = await Post.countDocuments(q);
  const items = await Post.find(q).sort({ createdAt: -1 }).skip(page * pageSize).limit(pageSize).lean();
  return { items, meta: { page, page_size: pageSize, total } };
}

async function getMarketing(page = 0, pageSize = 4) {
  const q = { type: "marketing" };
  const total = await Post.countDocuments(q);
  const items = await Post.find(q).sort({ createdAt: -1 }).skip(page * pageSize).limit(pageSize).lean();
  return { items, meta: { page, page_size: pageSize, total } };
}

async function subscribe(email) {
  const exists = await Subscriber.findOne({ email });
  if (exists) return { ok: true, message: "This email is already subscribed." };

  await Subscriber.create({ email });
  return { ok: true, message: "Subscribed successfully!" };
}

module.exports = {
  Category,
  Post,
  Subscriber,
  seedIfEmpty,
  getHero,
  getCategories,
  getRelated,
  getMarketing,
  subscribe,
};