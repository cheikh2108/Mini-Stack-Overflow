# Mini Stack Overflow

Application full-stack type Stack Overflow avec React/Vite côté frontend et Express/MySQL côté backend.

## Prérequis

- Node.js 18+ 
- MySQL 8+

## Configuration

1. Copier les variables d'environnement backend depuis `backend/.env.example` vers `backend/.env`.
2. Copier les variables d'environnement frontend depuis `frontend/.env.example` vers `frontend/.env` si vous déployez le frontend séparément.
3. Vérifier que la base MySQL existe et que le schéma est prêt via `backend/db/recreate.sql` ou `npm run db:recreate`.

## Développement

Backend :

```bash
cd backend
npm install
npm run dev
```

Frontend :

```bash
cd frontend
npm install
npm run dev
```

## Production

Le frontend est prévu pour être servi par le backend après build.

1. Construire le frontend :

```bash
cd frontend
npm run build
```

2. Lancer le backend :

```bash
cd backend
npm start
```

Le serveur Express sert automatiquement `frontend/dist` quand il est présent et renvoie l'application React pour les routes non-API.
Le backend expose aussi `GET /api/health` pour vérifier rapidement l'état du service.

## Variables utiles

Backend :
- `PORT` : port HTTP du serveur
- `JWT_SECRET` : secret de signature JWT
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` : connexion MySQL
- `FRONTEND_URL` : origine autorisée en CORS
- `CORS_ORIGINS` : origines supplémentaires séparées par des virgules

Frontend :
- `VITE_API_URL` : base URL de l'API. En prod avec le backend servi sur le même domaine, laissez `/api`.
