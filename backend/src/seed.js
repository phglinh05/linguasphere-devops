async function seedIfEmpty(db) {
  const posts = db.collection("posts");
  const categories = db.collection("categories");

  // Prevent duplicates in the future
  await posts.createIndex({ slug: 1 }, { unique: true });
  await categories.createIndex({ slug: 1 }, { unique: true });

  // Seed only when DB is empty
  if ((await posts.countDocuments({})) > 0) return;

  await categories.insertMany([
    {
      name: "DevSecOps",
      slug: "devsecops",
      cover_image_url: "https://picsum.photos/seed/devsecops/1200/900",
    },
    {
      name: "Cloud & AWS",
      slug: "cloud-aws",
      cover_image_url: "https://picsum.photos/seed/cloudaws/1200/900",
    },
    {
      name: "Kubernetes",
      slug: "kubernetes",
      cover_image_url: "https://picsum.photos/seed/k8s/1200/900",
    },
    {
      name: "Observability",
      slug: "observability",
      cover_image_url: "https://picsum.photos/seed/observability/1200/900",
    },
  ]);

  await posts.insertMany([
    // ===== HERO (Blog) =====
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

    // ===== RELATED BLOG (enough items for paging) =====
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
    {
      type: "blog",
      slug: "aws-vpc-mental-model",
      title: "AWS VPC: The Mental Model That Makes Networking Click",
      excerpt:
        "Subnets, route tables, NAT/IGW, SG/NACL — explained from an architecture perspective, not memorization.",
      hero_image_url: "https://picsum.photos/seed/blog-vpc/1600/900",
      thumbnail_url: "https://picsum.photos/seed/blog-vpc-thumb/800/500",
      author: { name: "Minh", avatar_url: "https://i.pravatar.cc/80?img=12" },
      views: 99210,
      topic: "Cloud & AWS",
    },

    // ===== MARKETING (Courses) =====
    {
      type: "marketing",
      slug: "aws-saa-foundations",
      title: "AWS Solutions Architect — Foundations",
      excerpt:
        "Learn IAM, VPC, EC2, and S3. Choose the right services for real problems with cost and security in mind.",
      tag: "Cloud",
      thumbnail_url: "https://images.unsplash.com/photo-1736220690063-d65115e1bec6?auto=format&fit=crop&w=1200&q=80",
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

module.exports = { seedIfEmpty };
