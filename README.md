# FiveM ORGA – Gestionnaire de Projet

Application web de gestion de tâches conçue pour organiser le développement d'un serveur FiveM. Interface Kanban avec drag & drop, catégorisation, priorités et suivi de progression.

## Stack technique

- **Backend** : Node.js + Express + PostgreSQL
- **Frontend** : React 19 + Vite + Tailwind CSS
- **Auth** : JWT (login simple user/password)
- **Déploiement** : Docker + Docker Compose (compatible Coolify)

## Démarrage rapide (développement local)

### Prérequis

- Node.js 18+
- PostgreSQL 14+ (ou Docker)

### 1. Base de données avec Docker

```bash
docker compose up db -d
```

### 2. Installation des dépendances

```bash
npm install
cd client && npm install && cd ..
```

### 3. Initialisation de la base de données

```bash
npm run db:init
```

### 4. Données de démo (optionnel)

Charge toutes les tâches FiveM pré-organisées par catégorie :

```bash
npm run db:seed
```

Crée un compte `admin` / `admin` avec toutes les tâches.

### 5. Lancer en développement

```bash
npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3001

## Déploiement Coolify

### Option 1 : Docker Compose

1. Créer un nouveau service **Docker Compose** dans Coolify
2. Pointer vers le repo Git
3. Définir la variable d'environnement `JWT_SECRET`
4. Déployer

### Option 2 : Dockerfile seul

1. Créer un nouveau service **Dockerfile** dans Coolify
2. Configurer les variables d'environnement :
   - `DATABASE_URL` : URL PostgreSQL
   - `JWT_SECRET` : Clé secrète JWT
   - `PORT` : 3001
3. Exposer le port 3001

### Après déploiement

Initialiser la base et charger les données :

```bash
# Dans le conteneur de l'app
node server/models/init.js
node server/seed.js
```

## API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Utilisateur courant |
| GET | `/api/tasks` | Liste des tâches (filtres: `status`, `priority`, `category_id`, `search`) |
| POST | `/api/tasks` | Créer une tâche |
| PUT | `/api/tasks/:id` | Modifier une tâche |
| PATCH | `/api/tasks/:id/status` | Changer le statut |
| DELETE | `/api/tasks/:id` | Supprimer une tâche |
| GET | `/api/categories` | Liste des catégories |
| POST | `/api/categories` | Créer une catégorie |
| PUT | `/api/categories/:id` | Modifier une catégorie |
| DELETE | `/api/categories/:id` | Supprimer une catégorie |
| GET | `/api/stats` | Statistiques globales |

## Structure du projet

```
FiveMORGA/
├── server/
│   ├── index.js              # Point d'entrée Express
│   ├── config/database.js    # Pool PostgreSQL
│   ├── middleware/auth.js     # Middleware JWT
│   ├── models/init.js        # Création des tables
│   ├── seed.js               # Données initiales FiveM
│   └── routes/
│       ├── auth.js           # Authentification
│       ├── tasks.js          # CRUD tâches
│       ├── categories.js     # CRUD catégories
│       └── stats.js          # Statistiques
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/index.js      # Client API
│   │   ├── context/          # Auth context
│   │   └── components/       # Composants React
│   └── ...config files
├── docker-compose.yml
├── Dockerfile
└── README.md
```
