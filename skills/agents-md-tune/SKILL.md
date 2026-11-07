---
name: agents-md-tune
description: Entretien périodique de la configuration Claude Code du repo courant — détecte la dérive entre AGENTS.md/docs et le code, élague les instructions inutiles, réécrit celles mal formulées, promeut en hook les règles violées, propose skills et sous-agents pour les procédures répétées. Rapport dans la conversation, aucun fichier de suivi dans le projet. Lancer après un changement de stack, chaque mois, ou quand Claude répète les mêmes erreurs.
disable-model-invocation: true
---

# Maintenance de la configuration Claude Code

Lis `~/.claude/skills/agents-md-audit/references/checklist-2026.md` (le référentiel est porté par le skill `agents-md-audit` ; s'il est absent, dis d'installer ce skill et arrête-toi). Ce skill suppose un fichier racine
déjà structuré ; sinon dis de lancer `/agents-md-audit` et arrête-toi.

Le rapport s'affiche **dans la conversation** ; rien n'est écrit dans le projet hors les
corrections de configuration elles-mêmes (H4). Les corrections appliquées vont dans un seul
commit `chore: maintenance config Claude Code` dont le corps liste chaque changement et sa raison.

## 0. Nom du fichier racine

`CLAUDE.md` encore présent et `claude --version` ≥ 2.1.277 → propose le renommage (A1b).
`CLAUDE.md` et `AGENTS.md` coexistent → signale-le en premier, `AGENTS.md` est ignoré.

## 1. Dérive commandes et stack

Compare chaque commande et version citée dans le racine, ses imports, `.claude/rules/**`,
les skills et `docs/**` avec les manifestes et la CI. Vérifie chaque import `@` et lien.

## 2. Dérive architecture

`git log --since="60 days ago" --name-only --format=''` → dossiers apparus/disparus. La carte
des dossiers du racine et `docs/architecture.md` doivent les refléter.

## 3. Charge par session

Racine + imports + rules sans `paths:`. Si > 200 lignes, propose ce qui part en lien, en rule
avec `paths:` ou en skill.

## 4. Élagage, réécriture, promotion

Pour chaque instruction du racine et des rules :

- **Inutile ?** Claude la respecterait sans elle → candidate au retrait.
- **Violée ?** Preuve dans l'historique récent → si impérative, promouvoir en hook/check CI,
  réduire à une ligne.
- **Vague ?** Reformuler en instruction vérifiable avec exemple.
- **Mal écrite (B6) ?** Pas de verbe impératif, modalisateur, deux règles par phrase, interdit
  sans raison → réécrire ligne par ligne en vérifiant que la version réécrite garde chaque
  commande, chemin, nombre, exemple et raison. Une ligne vague qui ne peut pas devenir
  vérifiable n'est pas raccourcie : elle est remplacée par un exemple du repo ou proposée au
  retrait.
- **Mal placée ?** Concerne un sous-dossier → `.claude/rules/` avec `paths:`.
- **Ajoutée via `#` en session ?** Vérifier qu'elle mérite de rester.

## 5. Procédures répétées → skills et sous-agents

Motifs ≥ 2 occurrences dans l'historique récent sans skill existant → propose `name`,
`description` « Fait X. Utiliser quand Y. », étapes. Crée seulement si entièrement
reconstituable depuis le code/CI. Tâches de revue/exploration répétées sans sous-agent →
propose `.claude/agents/<nom>.md`.

## 6. Skills, agents, hooks

À la lecture : chaque description dit quand utiliser le skill ou l'agent, corps < 500 lignes,
commandes et chemins cités existent encore, scripts de hooks présents. `.claude/commands/`
n'existe plus. Racine ≤ 150 lignes.

## Autonomie

Applique **sans demander** : correction de commandes/versions/imports/liens, réécriture B6
d'une ligne quand la version réécrite contient encore toutes ses informations, mise à jour de
la carte des dossiers, réparation d'un hook cassé sans changer son comportement.

**Demande avant** : retirer une instruction, créer ou modifier un hook ou une permission,
créer un skill ou un sous-agent, déplacer une règle. Regroupe ces demandes en une seule
question à cases à cocher en fin de rapport, puis applique ce qui est coché dans le même commit.

## Rapport (dans la conversation)

```markdown
## Appliqué
- …
## Proposé (cochez ce que j'applique)
### Instructions à retirer
### Règles à promouvoir en hook
### Skills / sous-agents à créer
### Règles à déplacer
## Résumé
Lignes du racine et lignes chargées par session, avant → après.
```

Conclus en 3 lignes : corrigé, en attente, prochaine échéance suggérée.
