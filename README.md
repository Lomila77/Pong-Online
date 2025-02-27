# Pong Web Application

## Description

![Home Page](./images/home_page.png)

Cette application web permet d'organiser et de participer à des tournois de Pong en ligne. Elle intègre un système d'authentification sécurisé via l'API de l'école 42 Paris et un second facteur d'authentification (2FA). L'application propose également une messagerie instantanée et une gestion avancée des utilisateurs.

## Fonctionnalités

- **Authentification et sécurité**
  - Connexion via l'API de l'école 42
  - Authentification à deux facteurs (2FA) avec Google Authentificator
- **Gestion des utilisateurs**
  - Blocage et invitation des utilisateurs
  - Création et gestion de channels de conversation
- **Tournois de Pong en ligne**
  - Organisation et participation à des matches
  - Affichage du leaderboard
  - Personnalisation des paramètres
- **Messagerie instantanée**
  - Communication en temps réel via WebSockets
  - Gestion des conversations privées et de groupe
GBubul77@gbubulubuntuGBubul77@gbubulubuntu
## Stack Technique

- **Backend** : NestJS (REST API et WebSockets)
- **Frontend** : React
- **Base de données** : PostgreSQL avec Prisma ORM
- **Protocoles de communication** : REST API et WebSockets

## Installation et Exécution

### Prérequis

- Docker et Docker Compose
- Node.js (version compatible avec NestJS et React)
- PostgreSQL

### Lancer l'application

L'application peut être démarrée via un `Makefile` contenant des règles spécifiques. Pour exécuter le projet :

```sh
make
```

### Autres commandes utiles

- **Arrêter l'application** :
  ```sh
  make down
  ```
- **Nettoyer les images** :
  ```sh
  make rmi
  ```
- **Nettoyer et relancer l'application** :
  ```sh
  make re
  ```

## Configuration

Les variables d'environnement nécessaires doivent être définies dans un fichier `.env`. Exemple de variables :

```
DATABASE_URL=postgresql://user:password@localhost:5432/database
JWT_SECRET=your_secret_key
SCHOOL_API_URL=https://api.school.com
```

## Déploiement

L'application peut être déployée via Docker et un orchestrateur adapté. Les configurations spécifiques sont définies dans les fichiers `docker-compose.yml` et `Dockerfile`.

## Contributions

Ce projet a été développé en collaboration avec d'autres personnes. Toute contribution est la bienvenue via des pull requests et des discussions sur l'organisation du code et des fonctionnalités.

## Licence

N/A.

