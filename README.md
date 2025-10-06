<<<<<<< HEAD
<<<<<<< HEAD
# Apollon

[![GitHub Actions Status](https://github.com/ls1intum/Apollon/workflows/Build/badge.svg)](https://github.com/ls1intum/Apollon/actions?query=branch%3Adevelop+workflow%3ABuild)
[![Dependencies status](https://img.shields.io/david/ls1intum/Apollon)](package.json)
[![DevDependencies status](https://img.shields.io/david/dev/ls1intum/Apollon)](package.json)
[![Documentation Status](https://readthedocs.org/projects/apollon-library/badge/?version=latest)](https://apollon-library.readthedocs.io/en/latest/?badge=latest)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ff48bab36a924471abcf61566563ffe6)](https://app.codacy.com/gh/ls1intum/Apollon?utm_source=github.com&utm_medium=referral&utm_content=ls1intum/Apollon&utm_campaign=Badge_Grade_Dashboard)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/9bbbff1e8475480d92c80615ac2eddf6)](https://www.codacy.com/gh/ls1intum/Apollon?utm_source=github.com&utm_medium=referral&utm_content=ls1intum/Apollon&utm_campaign=Badge_Coverage)

[![Latest version)](https://img.shields.io/npm/v/@ls1intum/apollon)](https://www.npmjs.com/package/@ls1intum/apollon)

A UML modeling editor written in React and TypeScript.

## Main Features

### Easy to use editor
The user interface of Apollon is simple to use. 
It works just like any other office and drawing tool that most users are familiar with. 

-   Select the diagram type you want to draw from the `Diagram Type` menu. This selection determines the availability of elements that the user can use while drawing their diagram, making it easier for users who are newly introduced to modeling.
-   Adding the element is as easy as dragging it from the elements menu and dropping it to the canvas. So is drawing the connection between them, simply drag and connect two or multiple elements.
-   Edit the text of any element by double-clicking on it. An easy-to-use menu will allow you to do so.
-   Supports dark/light themes for the editor.
-   Supports two languages: `German` and `English`.
-   Supports exporting the entire diagram or just selected elements of it.

![Apollon features](/docs/images/features.gif "Apollon features")

### Flexible layout features while drawing
Apollon allows user to draw their diagram more flexibly.
You can use keyboard shortcuts to copy, paste, delete and move the elements throughout the canvas.
The layout of the connection is drawn automatically by the editor. 
However, if you want to manually layout the relationship path, use the existing waypoints feature to do so.
All you have to do is to hover over the relationship, and simply drag the displayed waypoint as required. 
Elements of diagram can also be resized from all of its four corner.

### Infinite Canvas
Apollon provides an infinite canvas.
With the availability of this canvas, you will never feel you're out of space while drawing your diagram.
It also provides positioning rulers (grid) which can be used as a guideline to place your elements.
All the elements are snapped perfectly to the grid.

### Wide range of UML diagrams
Apollon allows you to create a wide range of UML diagrams.
Currently, it supports creating 11 different UML diagrams.
The list of UML diagrams includes:
-   `Class Diagram`
-   `Object Diagram`
-   `Activity Diagram`
-   `Use Case Diagram`
-   `Communication Diagram`
-   `Component Diagram`
-   `Deployment Diagram`
-   `Petri Net Diagram`
-   `Reachability Graph`
-   `Syntax Tree`
-   `Flowchart`

### Integrate Apollon with other software
Apollon can be integrated to any other Javascript application.
It serves as the modeling editor for the widely used interactive learning platform called [Artemis](https://artemis.ase.in.tum.de/).  
It also provides the standalone version of the editor.
You can try the standalone version of Apollon completey free and without the necessity of creating any account. 
It is a web application that allows users to use Apollon editor directly from their browser with additional features, including but not limited to, sharing and exporting the diagram.
It can be accessed via https://apollon.ase.in.tum.de.

The GitHub repository of its Standalone version is https://github.com/ls1intum/Apollon_standalone

## Usage

Install the `@ls1intum/apollon` npm package using either [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/):

```sh
yarn add @ls1intum/apollon
```

```sh
npm install @ls1intum/apollon
```

Import the `ApollonEditor` class, which is the default export of the npm package:

```js
import ApollonEditor from '@ls1intum/apollon';
```

Get hold of a DOM node and mount a new instance of the Apollon editor into it:

```js
const container = document.getElementById("...");
const editor = new ApollonEditor(container);
```

To unmount the editor instance, call its `destroy()` method:

```js
editor.destroy();
```

For a complete overview of the API, please refer to the [lib/es6/index.d.ts] file.

### ESModules and CommonJs

Apollon provides both an ESModules, as well as CommonJS version to be included.
They lay in `lib/es6` and `lib/es5` and the correct version should be resolved automatically.

## Development Setup

Clone the repository and change into the `Apollon` directory:

```
git clone https://github.com/ls1intum/Apollon.git
cd Apollon
```

Install all node dependencies:

```
npm install
```

Launch the webpack-dev-server:

```
npm run start
```

The webpack-dev-server is now listening on [http://localhost:8888](http://localhost:8888). If you change a TypeScript file, webpack will automatically compile the code, bundle the application, and refresh the page in your browser.

### Update dependencies

```
npm install -g npm-check-updates
npm run update
```

### Building the Docs

To build the docs, you need [pip installed](https://pip.pypa.io/en/stable/installation/#). You neeed to build Apollon's type definitions before you can build the docs:

```bash
npm run prepare
```

Then install necessary dependencies for the docs:

```bash
npm run docs:prepare
```

You can now build the docs:

```bash
npm run docs:build
```

The docs will be built and put into `docs/build/html`.

You can also serve the docs locally:

```bash
npm run docs:watch
```

The docs will be served on `localhost:8088`. This script will also watch for changes in the docs and rebuild them automatically.
=======
# uml-visualizer
Application web pour concevoir et manipuler des diagrammes UML (Use Case, Class, Sequence…) de façon visuelle et interactive. Export PNG/SVG, sauvegarde JSON, glisser-déposer, multi-thèmes.
>>>>>>> c7bf4a7e26717f20bd3705f06db4e37b37315a02
=======
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
>>>>>>> d7e625fa6c6282dada87c059dd85809f5e541f78
