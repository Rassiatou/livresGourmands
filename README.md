# #  Projet LivresGourmands.net  

## Équipe  
- Mamadou Woundé Barry  
- Rassiatou Coulibaly  

## Informations  
- Date : 10 septembre 2025  
- Cours : Programmation Web Avancée  
- Enseignant : Kahina Tamazouzt  

## Objectifs du projet  
Développer une plateforme e-commerce spécialisée dans la vente de livres de cuisine.  
Le site proposera :  
- La recherche et consultation d’ouvrages.  
- La gestion des paniers et commandes.  
- La création de listes de cadeaux.  
- La possibilité pour les clients de donner des avis et commentaires.  
- Une intégration d’un système de paiement sécurisé (ex. Stripe, PayPal).  

## Objectifs de la semaine   
- Mise en place du dépôt GitHub (commit initial).  
- Création de ce fichier README.  
- Réalisation d’un diagramme de cas d’utilisation.  
- Première ébauche du diagramme de classes.  
- Dépôt des diagrammes (PDF ou image exportée) sur GitHub.
- Mise en place du backend + structure du frontend  

## Répartition des rôles dans l’équipe  
- Mamadou Woundé Barry : Conception de l’ébauche du diagramme de classes.  
- Rassiatou Coulibaly : Conception du diagramme de cas d’utilisation.  
- Tous les deux : Validation des diagrammes, mise à jour du README, dépôt GitHub.
## Architecture du projet

  livresGourmands/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── db.js
│   │   └── app.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
## Base de données
Base : livresgourmands
## Tables :
-users
-categories
-ouvrages
-panier
-panier_items
-commandes
-commande_items
-avis
-commentaires
-listes_cadeaux
-liste_items
## Technologies utilisées
## Frontend
-React
-React Router
-Bootstrap
-Vite
-Axios
## Backend
-Node.js
-Express
-JWT Auth
-BCrypt
-MySQL / MariaDB
## Outils
-Git / GitHub
-Photoshop (maquettes)
-Postman
-DB Browser / MySQL Workbench
## Installation du projet
# Cloner le dépôt
-git clone https://github.com/Rassiatou/livresGourmands
-cd livresGourmands
# Backend
-cd backend
-npm install
# Créer un fichier .env 
-DB_HOST=localhost
-DB_USER=root
-DB_PASS=
-DB_NAME=livresgourmands
-PORT=3001
-JWT_SECRET=ton_secret
# Démarrer
-npm run dev
# Frontend
-cd frontend
-npm install
-npm run dev
# Le site démarre sur 
-http://localhost:5173
# L'API sur
-http://localhost:3001/api
##  Livrables attendus 
- URL du dépôt GitHub.  
- README.md complet.  
- Diagramme de cas d’utilisation (PDF ou image).  
- Diagramme de classes (première ébauche, PDF ou image).

##  Lien URL
https://github.com/Rassiatou/livresGourmands

