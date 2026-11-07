---
name: agents-md-audit
description: Audite la configuration Claude Code du repo courant (AGENTS.md/CLAUDE.md, .claude/rules, skills, agents, commands, settings/hooks, docs/) contre la checklist 2026 et écrit un plan de migration hors du projet, sans rien modifier. Lancer avant toute refonte du fichier d'instructions, ou quand Claude semble ignorer les instructions.
disable-model-invocation: true
---

# Audit de la configuration Claude Code

Tu es en **lecture seule** sur le projet : tu ne modifies aucun fichier existant. Ton seul
livrable est `CONFIG-MIGRATION-PLAN.md` à la racine du repo. Il est temporaire : ne le
commite pas (ne l'ajoute à aucun `git add`), la restructuration le supprime.

Lis d'abord `references/checklist-2026.md` (à côté de ce fichier) intégralement. Chaque
constat cite l'identifiant du critère (`B1`, `F1`…).

## 1. Inventaire

Localise et lis, s'ils existent :

- Racine : `AGENTS.md`, `CLAUDE.md`, `CLAUDE.local.md`, `.claudeignore`, fichiers d'autres
  outils (`.cursorrules`, `GEMINI.md`, `.github/copilot-instructions.md`)
- `.claude/` : `settings.json`, `settings.local.json`, `rules/`, `skills/`, `agents/`,
  `commands/`
- Fichiers d'instructions imbriqués :
  `find . \( -name AGENTS.md -o -name CLAUDE.md \) -not -path '*/node_modules/*'`
- Fichiers importés par `@` (profondeur 2)
- `README.md`, `CONTRIBUTING.md`, `docs/**`
- Manifestes (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`), CI, `Makefile`/`justfile`

Pour chaque fichier d'instructions : lignes, instructions impératives, imports `@`, doublons
avec un autre fichier (paragraphe par paragraphe).

## 2. Nom du fichier racine

- `claude --version`. Si ≥ 2.1.277 et que le racine s'appelle `CLAUDE.md` : note la
  recommandation A1b et ses conditions (aucun `CLAUDE.md` dans un parent, imports résolus
  après renommage, pas de Bedrock/Vertex/Foundry).
- Si `CLAUDE.md` et `AGENTS.md` coexistent : bloquant, `AGENTS.md` est ignoré.

## 3. Charge par session

Racine + imports `@` + `.claude/rules/*.md` sans `paths:`. Total en lignes et tokens
approximatifs (lignes × 12). Conclus : « à chaque session Claude charge X lignes, dont Y
rarement utiles ».

## 4. Évaluation critère par critère

Sections A → I. Chaque MUST/SHOULD : ✅ / ⚠️ / ❌ / — avec preuve d'une ligne (chemin:ligne
ou commande). Teste, ne suppose pas :

- commandes citées présentes dans les manifestes (n'exécute rien de destructif) ;
- imports `@` et liens internes valides ;
- descriptions de skills et d'agents disent *quand* les utiliser ;
- règles « doit toujours » sans hook ni check CI ;
- hooks déclarés dans `settings.json` : scripts présents ;
- style B6 : relève les instructions mal formulées (pas de verbe impératif, modalisateur,
  deux règles par phrase, interdit sans raison) et donne deux exemples réécrits qui
  conservent commande, raison et exemple.

## 5. Candidats à extraction

À partir du contenu et de `git log --oneline -200` :

- procédures répétées et `.claude/commands/*.md` → skills de projet (nom + « Fait X.
  Utiliser quand Y. ») ;
- rôles répétés → sous-agents (nom, tools, model) ;
- règles par zone → rules avec `paths:` ;
- règles impératives → hooks (événement, matcher, commande) ;
- contenu long → `docs/` (fichier cible, ligne « Lis ce fichier quand… », import ou lien).

## 6. Livrable

Écris `CONFIG-MIGRATION-PLAN.md` à la racine :

```markdown
# Plan de migration — configuration Claude Code — <date>
Fichier temporaire : ne pas commiter, supprimé par la restructuration.

## Résumé (5 lignes max)
## Score par section
| Section | MUST ok/total | SHOULD ok/total | Points bloquants |
## Constats
<un bloc par ❌/⚠️ : critère, preuve, correctif concret>
## Arborescence cible
<tree de AGENTS.md, .claude/ et docs/ après migration>
## Étapes ordonnées
<titre, fichiers touchés, commandes, critère de vérification, message de commit incluant
la justification de chaque instruction retirée ou réécrite>
## Contenu proposé pour le fichier racine
<brouillon complet ≤ 150 lignes, sections C1→C9, basé sur l'existant>
## Décisions à prendre par l'humain
<renommer en AGENTS.md oui/non avec la version constatée, garder/supprimer tel fichier,
import vs lien, modèle par agent…>
```

## 7. Fin

Affiche dans la conversation : le résumé, le score par section, la liste des décisions à
prendre, et le nom du plan. Rappelle qu'il ne doit pas être commité, que la restructuration
le lira puis le supprimera, et qu'il faut d'abord trancher les décisions dedans.

Interdit : recommandations génériques ; chaque ligne du plan nomme un fichier de ce repo.
