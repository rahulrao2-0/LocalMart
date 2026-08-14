<div align="center">

<h1>🛒 LocalMart</h1>

<h3>A Hyperlocal, Event-Driven E-Commerce Platform</h3>
<p><i>Amazon/Flipkart-style marketplace meets Blinkit-style local delivery — built on a 9-service microservices architecture.</i></p>

<p>
  <img src="https://img.shields.io/badge/status-in%20development-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/architecture-microservices-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/pattern-event--driven-yellow?style=for-the-badge" />
</p>

</div>

---

## ✨ What makes LocalMart different

Instead of shipping from a single warehouse, every order flows through **real, independent local shops**:

- 📍 See every nearby shop carrying a product — live open/closed status, distance, and stock
- 🚚 Choose **home delivery** from the nearest open shop
- 🏬 Or choose **store pickup** and collect it yourself
- 🛍️ One catalog for daily groceries *and* marketplace-style categories — furniture, electronics, and more
- 🧑‍💼 Shop owners run their store from a dedicated **Seller Hub**
- 🛵 Independent delivery partners accept jobs and navigate live routes from a dedicated **Delivery app**
- ⚡ Real-time order & delivery tracking via **Socket.IO**

---

## 🖥️ Demo

<div align="center">

### Customer App — Home
<img src="./customer-app-home.png.png" width="850" alt="Customer app home screen"/>

<br/><br/>

### Seller Hub — Dashboard
<img src="./seller-hub-dashboard.png.png" width="850" alt="Seller hub dashboard"/>

<br/><br/>

### Delivery App — Live Map
<img src="./delivery-live-map.png.png" width="850" alt="Delivery app live map"/>

</div>

---

## 🏗️ Architecture

Event-driven **microservices** backend — services publish and consume events over **Kafka** instead of calling each other directly — with three role-specific frontends sitting on top, and **Socket.IO** pushing live updates to the client.

```
LocalMart/
├── Backend/
│   ├── api-gateway/          # Single entry point for synchronous client requests
│   ├── infrastructure/       # Kafka, Docker, Nginx, CI/CD, shared infra config
│   └── Services/
│       ├── auth-service/         # Login, signup, sessions, JWT
│       ├── cart-service/         # Cart management per user
│       ├── delivery-service/     # Delivery partner assignment, live tracking, routes
│       ├── inventory-service/    # Per-shop stock levels
│       ├── notification-service/ # Consumes events → push/email/SMS + Socket.IO
│       ├── order-service/        # Order lifecycle (placed → confirmed → fulfilled)
│       ├── payment-service/      # Payment processing & refunds
│       ├── product-service/      # Product catalog, categories, search
│       └── user-service/         # Customer, seller & delivery-partner profiles
│   └── shared/               # Kafka event schemas/contracts, shared types & utils
└── Frontend/
    ├── Customer-app/         # Browse, order, and track deliveries in real time
    ├── delivery-app/         # Accept jobs, follow live routes
    └── seller-app/           # Manage products, orders & revenue
```

### Event-driven flow (example)

```
Customer places order (order-service)
        │
        ▼
   Kafka: "order.created"
        │
   ┌────┼────────────────┬──────────────────┐
   ▼    ▼                ▼                  ▼
inventory-service   payment-service   notification-service
(reserve stock)     (charge customer) (notify shop + customer via Socket.IO)
        │
        ▼
   Kafka: "payment.success"
        │
        ▼
delivery-service (assign nearby delivery partner or mark ready for pickup)
```

Decoupling services this way means `notification-service` and `inventory-service` react independently to the same `order.created` event — `order-service` never needs to know they exist, and any service can be scaled, redeployed, or replaced on its own.

---

## 🧩 Services overview

| Service | Responsibility | Kafka role |
|---|---|---|
| `api-gateway` | Routes synchronous requests from all frontends to the right service | — |
| `auth-service` | Authentication & authorization | Publishes `user.registered` |
| `cart-service` | Cart state, per-shop cart splitting | Publishes `cart.checked_out` |
| `delivery-service` | Matches orders to delivery partners, live tracking & routes | Consumes `payment.success`, publishes `delivery.assigned` |
| `inventory-service` | Per-shop stock levels, powers "in stock nearby" | Consumes `order.created`, publishes `inventory.updated` |
| `notification-service` | Order updates, delivery alerts, promos (real-time via Socket.IO) | Consumes `order.*`, `delivery.*` events |
| `order-service` | Order lifecycle, delivery vs pickup logic | Publishes `order.created`, `order.status_changed` |
| `payment-service` | Payment gateway integration, refunds | Consumes `order.created`, publishes `payment.success` / `payment.failed` |
| `product-service` | Product catalog, categories, search | Publishes `product.updated` |
| `user-service` | Profiles for customers, sellers, delivery partners | Consumes `user.registered` |

---

## 📱 Frontend apps

| App | Users | Key features |
|---|---|---|
| **Customer-app** | Shoppers | Category browsing, live nearby-shop map, delivery/pickup toggle per product, cart, checkout, real-time order tracking |
| **seller-app** | Shop owners | Revenue dashboard, pending orders, low-stock alerts, product & inventory management |
| **delivery-app** | Delivery partners | Online/offline toggle, accept delivery requests, live route map with distance & ETA, earnings & history |

---

## 🛠️ Tech Stack

<div align="center">

**Frontend**

<img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
<img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white" />
<img src="https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white" />

**Backend & Real-Time**

<img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
<img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" />
<img src="https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka" />

**Data & Cache**

<img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" />

**Infra & DevOps**

<img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white" />
<img src="https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white" />
<img src="https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white" />

</div>

---

## 🚀 Getting Started

```bash
# clone the repo
git clone https://github.com/rahulrao2-0/LocalMart.git
cd LocalMart

# start infra (Kafka, Redis, DB) — via docker-compose in infrastructure/
cd Backend/infrastructure
docker-compose up -d

# backend — run each service
cd ../Services/<service-name>
npm install
npm run dev

# frontend — customer app
cd Frontend/Customer-app
npm install
npm run dev

# frontend — seller app
cd Frontend/seller-app
npm install
npm run dev

# frontend — delivery app
cd Frontend/delivery-app
npm install
npm run dev
```

---

<div align="center">

### 👨‍💻 Built by

**Rahul Yadav** — Full-Stack Software Engineer

<a href="https://linkedin.com/in/rahul-yadav-073756289"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
<a href="mailto:yadavrahul81135@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" /></a>

</div>
