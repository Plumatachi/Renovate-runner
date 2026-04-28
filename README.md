# Renovate Runner

Projet dédié à l'automatisation des mises à jour de dépendances et aux scans de sécurité sur les projets de l'organisation, via Renovate self-hosted et Trivy.

---

## Sommaire

* [Vue d'ensemble](#vue-densemble)
* [Structure du projet](#structure-du-projet)
* [Prérequis](#prerequis)
* [Configuration](#configuration)
* [Utilisation](#utilisation)
* [Comportement de Renovate](#comportement-de-renovate)
* [Scans de sécurité avec Trivy](#scans-de-securite-avec-trivy)

---

## Vue d'ensemble

Ce projet runner orchestre deux outils :

* [Renovate](https://docs.renovate.com/) - détecte les dépendances outdatées ou vulnérables et ouvre des PR de mise à jour sur les projets cibles.
* [Trivy](https://trivy.dev/docs/latest/guide/) - scanner de sécurité (secrets, vulnérabilités dans les artéfacts)

La pipeline est configurée pour se déclencher chaque semaine, ou bien manuellement à la demande.

---

## Structure du projet

```bash
renovate-runner/
├── .github/
│   └── workflows/
│       └── renovate.yml     # Pipeline GitHub Actions
├── renovate-config/
│   └── config.js            # Configuration Renovate
├── .gitlab-ci.yml           # Pipeline GitLab
└── README.md
```

---

## Prérequis
### Token d'accès

Un **Personal Access Token** (classic) GitHub avec le scope `repo` est nécessaire.

Il doit être stocké dans les secrets du projet :

**Settings → Secrets and variables → Actions → New repository secret**

| Name             | Description                    |
|------------------|--------------------------------|
| `RENOVATE_TOKEN` | Token GitHub avec scope `repo` |

> ⚠️ Bien utiliser la section **Secrets** et non **Variables** — sinon le token ne sera pas transmis correctement à la pipeline.
 
---

## Configuration
### `config.js` — Configuration Renovate

```js
module.exports = {
  platform: 'github',
  repositories: [
    'organisation/projet-a',
    'organisation/projet-b',
  ],
  onboarding: false,
  requireConfig: 'optional',
  automerge: false,           // validation manuelle de toutes les PR
  labels: ['renovate'],
  schedule: ['on monday'],    // exécution chaque lundi
 
  // Regroupement des PR par type de mise à jour
  packageRules: [
    {
      matchUpdateTypes: ['patch'],
      groupName: 'patch updates',
    },
    {
      matchUpdateTypes: ['minor'],
      groupName: 'minor updates',
    },
    {
      matchUpdateTypes: ['major'],
      groupName: 'major updates',
    },
  ],
};
```

### Ajouter ou retirer un projet

Il suffit d'éditer le tableau `repositories` dans `config.js` :

```js
repositories: [
  'organisation/nouveau-projet',  // ← ajouter ici
],
```

### Autodiscovery (optionnel)

Pour scanner automatiquement tous les repos accessibles avec le token, sans les lister manuellement :

```js
autodiscover: true,
autodiscoverFilter: ['organisation/*'],  // filtre recommandé
```

> ⚠️ Sans filtre, Renovate analysera **tous** les repos accessibles par le token.
 
---

## Utilisation
### Déclenchement automatique

La pipeline tourne chaque **lundi** via le schedule GitHub Actions (défini dans `renovate.yml`).

### Déclenchement manuel

Dans l'onglet **Actions** du projet runner :

1. Sélectionner le workflow **Renovate & Security**
2. Cliquer sur **Run workflow**

### PR générées par Renovate

Renovate crée au maximum **3 PR par projet cible**, regroupées par type :

| PR              | Contenu                                    | Attention requise |
|-----------------|--------------------------------------------|-------------------|
| `patch updates` | Corrections de bugs                        | Faible            |
| `minor updates` | Nouvelles fonctionnalités rétrocompatibles | Modérée           |
| `major updates` | Breaking changes                           | Élevée            |

Toutes les PR sont à **valider manuellement** — aucun automerge n'est configuré.

### Dependency Dashboard

Renovate crée automatiquement une issue **Dependency Dashboard** sur chaque projet cible. Elle sert de tableau de bord : état des dépendances, PR ouvertes, mises à jour disponibles.
 
---

## Comportement de Renovate
### PR fermées sans merge

Si une PR est fermée manuellement, Renovate considère la mise à jour comme rejetée et **ne la reouvre pas automatiquement**.

Pour forcer la recréation d'une PR :

- **Via le Dependency Dashboard** — cocher la dépendance concernée dans l'issue
- **En supprimant la branche** — Renovate la recrée au prochain run (ex: `renovate/lodash-4.x`)
- **Via la config** *(tests uniquement)* — ajouter temporairement `recreateClosed: true` dans `config.js`

### Détection des vulnérabilités

Renovate consulte les bases de données de CVE (GitHub Advisory Database, OSV...) et signale les dépendances vulnérables directement dans les PR, avec le niveau de sévérité.
 
---

## Scans de sécurité avec Trivy

Trivy est configuré pour scanner chaque projet cible en mode filesystem (`fs`).

Il remonte les vulnérabilités de sévérité **CRITICAL** et **HIGH** dans les logs de la pipeline.

> 💡 Trivy et Renovate sont complémentaires :
> - **Renovate** détecte les vulnérabilités dans les dépendances déclarées (`package.json`, `requirements.txt`...)
> - **Trivy** scanne les artefacts compilés, les images Docker, et détecte les secrets committés par erreur

La pipeline ne fail pas en cas de vulnérabilité détectée (`exit-code: 0`) — les résultats sont à consulter dans les logs.

---

## Migration vers GitLab

Quand le projet sera migré sur GitLab CE, les changements à effectuer sont minimes :

**Dans `config.js` :**

```js
platform: 'gitlab',                              // github → gitlab
endpoint: 'https://ton-gitlab.com/api/v4',       // à ajouter
```

**Remplacer `.github/workflows/renovate.yml` par `.gitlab-ci.yml` :**

```yaml
stages:
  - renovate
  - security
 
renovate:
  stage: renovate
  image: renovate/renovate:latest
  variables:
    RENOVATE_TOKEN: $RENOVATE_TOKEN
    RENOVATE_CONFIG_FILE: config.js
  script:
    - renovate
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
    - if: $CI_PIPELINE_SOURCE == "web"
 
trivy:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --severity CRITICAL,HIGH .
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
    - if: $CI_PIPELINE_SOURCE == "web"
```

**Stocker le token** dans **Settings → CI/CD → Variables** (avec l'option Mask activée).

> Le token GitLab devra avoir le scope **`api`** (et non `repo` comme sur GitHub).
 