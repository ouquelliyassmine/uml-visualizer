# TechOuasis — Gestion du parc & Helpdesk Plateforme web pour déclarer/suivre des tickets, gérer le parc (matériel/logiciels/licences), centraliser fournisseurs/contrats et consulter une base de connaissances avec chatbot. Sécurisée par RBAC (Admin/Technicien/Utilisateur) et JWT.

✨ Fonctionnalités

Tickets : création, priorisation, assignation au technicien, commentaires, pièces jointes, notifications.

Parc : inventaire (postes, imprimantes, serveurs, réseau), affectation aux utilisateurs, import/export.

Logiciels & licences : suivi, alertes d’expiration, conformité.

Fournisseurs & contrats : référentiel central.

Base de connaissances & chatbot : auto-assistance.

KPI : TTFR, MTTR, conformité licences.

🧱 Stack technique

Front-end : React/Next.js + Tailwind CSS

Back-end : Spring Boot (API REST) + Spring Security (JWT, RBAC, CORS)

Base de données : PostgreSQL

Outillage : Jira (sprints), GitHub, Postman

📦 Arborescence . ├─ frontend/ # React/Next.js (UI) ├─ backend/ # Spring Boot (API REST) └─ README.md

🚀 Démarrage rapide (local) Prérequis

Node.js ≥ 18, npm ≥ 9

JDK ≥ 17 & Maven

PostgreSQL ≥ 14

Backend cd backend
variables d'environnement (exemple PowerShell/Windows)
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/techoasis" $env:SPRING_DATASOURCE_USERNAME="postgres" $env:SPRING_DATASOURCE_PASSWORD="postgres" $env:JWT_SECRET="change-me"

build & run
mvn spring-boot:run

API par défaut : http://localhost:8080
Frontend cd frontend npm install
variables d'env (fichier .env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev

UI : http://localhost:3000
⚠️ Ne committe jamais tes secrets (.env). Ajoute-les dans .gitignore.

🧪 Tests (Postman)

Importer postman/TechOasis.postman_collection.json

Définir l’environnement JWT_TOKEN après login (/api/auth/login)

🔐 Rôles & accès (RBAC)

/admin/ : Admin uniquement

/technicien/ : Technicien (+ Admin si souhaité)

/utilisateur/ : Authentifié

Public : /api/auth/, /public/

🔧 Configuration

backend/src/main/resources/application.yml : ports, CORS, logs

CORS : autoriser http://localhost:3000 en dev

JWT : durée, secret, cookie HttpOnly

🗺️ API (exemples rapides) POST /api/auth/login # login -> cookie JWT GET /api/utilisateur/me # profil GET /api/tickets # liste des tickets POST /api/tickets # créer un ticket GET /api/materiels # inventaire GET /api/licences # licences + statuts

📸 Captures (à insérer)

Accueil / Connexion

Dashboard utilisateur / technicien

Inventaire / Licences

Tickets (liste + détail)

Base de connaissances / Chatbot
