
## Comptes de démonstration

| Email                          | Mot de passe | Rôle            |
|---------------------------------|---------------|-----------------|
| khaled@demo.net                 | Demo@1234     | Owner (Admin)   |
| abdessamad@demo.net             | Demo@1234     | Project Manager |
| salah@demo.net                  | Demo@1234     | Member          |

Ces comptes et les données associées (1 workspace, 2 projets, ~26 tâches, quelques commentaires)
sont créés automatiquement au démarrage de l'API en environnement **Development** uniquement.
[![CI](https://github.com/Taskmanager-team/taskmanager/actions/workflows/ci.yml/badge.svg)](https://github.com/Taskmanager-team/taskmanager/actions/workflows/ci.yml)

# TaskManager

## Authentification cote client

### Ou sont stockes les jetons, et pourquoi

| Jeton | Stockage | Duree de vie |
| --- | --- | --- |
| Access token | En memoire (variable de module, jamais ecrite dans le navigateur) | 15 min cote serveur |
| Refresh token | `localStorage`, cle `taskmanager.refreshToken` | 7 jours, tourne a chaque usage |

Tout passe par `frontend/src/auth/tokenStorage.ts`. C'est le seul fichier a
modifier pour changer de strategie.

### Pourquoi pas un cookie httpOnly

Un cookie `httpOnly` est par definition invisible pour le JavaScript de la page :
c'est le serveur qui le pose via `Set-Cookie`, et le navigateur le renvoie seul.

Or l'API renvoie ses jetons **dans le corps JSON** de la reponse (schema
`AuthResponse` dans `openapi.yaml`, et `return Ok(new { accessToken, refreshToken })`
dans `AuthController`). Le front les recoit donc comme des donnees ordinaires.

Le cookie httpOnly n'est pas un choix frontend : il demanderait de modifier le
contrat, le backend (`Set-Cookie`, `SameSite`, CORS avec `AllowCredentials`) et
d'ajouter une protection CSRF, puisque le navigateur joindrait alors le cookie
automatiquement a toute requete, y compris celles declenchees par un autre site.

### Le risque assume, et ce qui l'atténue

Le risque est le XSS : du code injecte dans la page peut lire ce que le
JavaScript peut lire. Trois choix limitent la surface d'attaque :

1. **L'access token ne touche jamais le stockage du navigateur.** Il vit dans une
   variable de module. Un XSS qui inspecte `localStorage` n'y trouve aucun jeton
   utilisable directement contre l'API.
2. **Le refresh token tourne a chaque usage** et le backend detecte sa
   reutilisation : il revoque alors toute la famille de jetons
   (`RevokeFamilyAsync`). Un refresh token vole a une fenetre d'usage courte, et
   son usage par l'attaquant coupe la session de la victime, ce qui rend
   l'intrusion visible.
3. **Un point de stockage unique**, donc une migration peu couteuse le jour ou le
   backend posera des cookies.

Le compromis : l'access token etant en memoire, un rechargement de page le perd.
Au demarrage, l'application tente donc un refresh silencieux a partir du refresh
token, et n'affiche `/login` que si celui-ci echoue.

### Renouvellement automatique

Le middleware de `frontend/src/api/client.ts` intercepte les reponses `401` :

- il declenche un refresh, puis **rejoue la requete une seule fois** ;
- le retry part par un `fetch` direct, sans repasser par le middleware, ce qui
  garantit structurellement qu'il n'y a pas de seconde tentative ;
- la requete est clonee **avant** l'envoi, car `fetch` consomme le corps : sans
  ce clone, le retry d'un `POST` partirait avec un corps vide ;
- si le refresh echoue, les jetons sont effaces et `ProtectedRoute` renvoie vers
  `/login`.

Des que la session tombe, a la deconnexion comme sur un refresh echoue,
`AuthProvider` vide aussi le cache TanStack Query. Sans cela les donnees du
compte precedent resteraient en memoire pendant la duree du `staleTime` et
s'afficheraient brievement a la personne suivante qui se connecte sur le meme
navigateur.

`refreshSession` (`frontend/src/auth/session.ts`) est en *single-flight* : plusieurs
`401` simultanes partagent le meme appel reseau. Ce n'est pas une optimisation.
Comme le backend revoque la famille de jetons a la moindre reutilisation, deux
refresh en parallele deconnecteraient l'utilisateur au lieu de le maintenir
connecte.

Les endpoints `/auth/*` utilisent un client separe (`api/authClient.ts`) sans
middleware : un `401` sur `/auth/login` signifie « mauvais mot de passe » et doit
remonter au formulaire, et intercepter le `401` de `/auth/refresh` provoquerait
une boucle infinie.

### Erreurs de validation : limite connue

`toFormErrors` (`frontend/src/auth/authErrors.ts`) produit deux listes : les
messages rattaches a un champ et les messages globaux.

Aujourd'hui `AuthController` renvoie `{ message, errors: string[] }`, une liste
plate de phrases produites par Identity, **sans nom de champ**. Rien ne permet
donc de savoir qu'un message concerne le mot de passe plutot que l'email : ces
messages s'affichent en tete de formulaire.

L'affichage par champ est deja branche et attend le format
`ValidationProblemDetails` de **SCRUM-33**. Quand il arrivera, seule la premiere
branche de `toFormErrors` sera a adapter, aucun composant ne bougera.

### Developpement avec les mocks

Avec `VITE_USE_MOCKS=true`, MSW simule l'API.

Compte de test toujours valable : n'importe quel email avec le mot de passe
`Demo1234!`.

Un compte cree via `/register` est memorise pour la duree de la session et peut
ensuite se connecter avec son propre mot de passe. Reinscrire le meme email
renvoie un 409, tout comme `taken@test.com`.

Les mocks reproduisent la rotation du refresh token et refusent un jeton deja
consomme, comme le vrai backend. L'access token expire au bout de
`ACCESS_TOKEN_TTL_SECONDS` (60 s dans `mocks/handlers.ts`) : baisse cette valeur
a 5 pour observer le cycle `401` -> refresh -> retry immediatement.
