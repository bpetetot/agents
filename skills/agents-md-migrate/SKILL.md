---
name: agents-md-migrate
description: Exécute le plan écrit par agents-md-audit pour restructurer la configuration Claude Code du repo courant — AGENTS.md court et vérifiable, rules par périmètre, skills, hooks et permissions, sous-agents, docs/ orientée agent. Un commit par étape, justifications dans les commits, aucun fichier de suivi dans le projet. Lancer après agents-md-audit.
disable-model-invocation: true
---

# Restructuration de la configuration Claude Code

Prérequis : `CONFIG-MIGRATION-PLAN.md` existe à la racine. Sinon, dis de lancer
`/agents-md-audit` et arrête-toi. Ce fichier n'est jamais commité : exclus-le de chaque
`git add` (ajoute les fichiers explicitement, pas `git add -A`).

Lis `~/.claude/skills/agents-md-audit/references/checklist-2026.md` (le référentiel est porté par le skill `agents-md-audit` ; s'il est absent, dis d'installer ce skill et arrête-toi). Respecte tous les MUST ; signale
chaque SHOULD non respecté et pourquoi.

## Règles d'exécution

1. **Une étape du plan = un commit.** Message : celui du plan.
2. **Jamais de perte de contenu.** Chaque instruction existante est conservée, déplacée
   (docs/, rules/, skill, hook) ou retirée. Toute instruction retirée ou réécrite est
   justifiée dans le **corps du message de commit** de l'étape (« retiré : “X” — Claude le
   fait déjà / doublon de Y / remplacé par le hook Z » ; « réécrit : “X” → “Y”, conservé :
   commande, raison »). Aucun fichier de suivi dans le projet (H4).
3. **Ne tranche pas les « Décisions à prendre par l'humain ».** Si une étape en dépend sans
   réponse dans le plan, pose la question et attends.
4. **Vérifie chaque étape** avec son critère avant la suivante.
5. Branche `chore/claude-config` si le repo est propre ; sinon demande.

## Ordre de référence (adapter au plan)

### Étape 1 — Fichier racine
- Si le plan a validé le renommage (A1b) : `git mv CLAUDE.md AGENTS.md`, idem pour les
  sous-dossiers. Vérifie qu'aucun `CLAUDE.md` ne subsiste dans le repo ni dans un parent,
  lance une session de test, confirme que les instructions sont chargées et les imports `@`
  résolus ; sinon convertis-les en liens Markdown.
- Réécris le fichier à partir du brouillon du plan. ≤ 150 lignes, sections C1→C9.
  Commandes vérifiées dans les manifestes. Imports `@` : 3–5 max.
- Supprime les fichiers d'instructions d'autres outils orphelins si le plan le prévoit.
- `CLAUDE.local.md` et `.claude/settings.local.json` dans `.gitignore`.

### Étape 1b — Passe de réécriture (B6)
Sur chaque fichier d'instructions écrit ou déplacé (racine, sous-dossiers, rules, corps des
skills) ; jamais sur les commandes, les exemples de code, ni les docs (B7 à la place).

Ligne par ligne :
1. Commande, chemin, titre, tableau ou raison rattachée à la ligne précédente : ne touche à rien.
2. Sinon réécris : verbe impératif en tête, une seule instruction, voix active, sans
   modalisateur ni politesse, raison conservée en une proposition courte.
3. Avant de valider, vérifie que la nouvelle ligne contient encore **chaque** commande,
   chemin, nombre, nom, exemple et raison de l'ancienne. Un élément manque → reprends. Deux
   règles → deux lignes.
4. Une ligne qui reste vague après réécriture n'est pas raccourcie : remplace-la par un
   exemple do/don't tiré du repo, ou retire-la (justification dans le commit).


### Étape 2 — Chargement progressif
- `.claude/rules/<sujet>.md` avec frontmatter `paths:` pour chaque candidat du plan.
- Fichiers de sous-dossiers en monorepo, sans répéter le racine.

### Étape 3 — Docs orientée agent
- `docs/architecture.md`, `docs/conventions.md`, `docs/testing.md` : créer ou refondre.
  Première ligne `> Lis ce fichier quand : …`. Style B7.
- Tout paragraphe > 10 lignes de l'ancien fichier racine migre ici ; le racine garde résumé +
  lien ou import.
- Aucune doc ne recopie signatures ou listes de fichiers.

### Étape 4 — Skills de projet
- Migre `.claude/commands/*.md` en `.claude/skills/<nom>/SKILL.md`, supprime `commands/`.
- Crée les skills du plan : `name` = dossier, `description` « Fait X. Utiliser quand Y. »,
  corps < 500 lignes, `references/` et `scripts/` pour le détail.

### Étape 5 — Hooks et permissions
- `.claude/settings.json` versionné, modèle à adapter :
  ```json
  {
    "permissions": {
      "allow": ["Bash(pnpm test*)", "Bash(pnpm lint*)", "Bash(git status*)", "Bash(git diff*)"],
      "deny": ["Read(.env*)", "Bash(git push --force*)"]
    },
    "hooks": {
      "PostToolUse": [
        { "matcher": "Edit|Write",
          "hooks": [{ "type": "command",
                      "command": "jq -r '.tool_input.file_path' | xargs -r <formatter> 2>/dev/null || true" }] }
      ],
      "PreToolUse": [
        { "matcher": "Bash",
          "hooks": [{ "type": "command", "command": ".claude/hooks/guard-bash.sh" }] }
      ]
    }
  }
  ```
  Scripts dans `.claude/hooks/`, exécutables, testés avec un JSON d'exemple sur stdin.
- Retire du racine toute phrase désormais garantie par un hook ; remplace par une mention
  d'une ligne.

### Étape 6 — Sous-agents
- `.claude/agents/<nom>.md` : `name`, `description`, `tools` restreints, `model`. Corps :
  mission, entrées, format de sortie, interdits.
- Une ligne par agent dans la section « Workflow Claude Code » du racine.

## Vérification finale

Relis le fichier racine en entier et les fichiers créés. Vérifie à la lecture : ≤ 150
lignes, aucun `CLAUDE.md` résiduel si renommage, 3–5 imports `@` au plus, aucun modalisateur,
hooks testés, `git status` propre.

Puis, en ne lisant que le fichier racine, réponds à « commande pour lancer un seul test ? »
et « où ajouter un endpoint ? ». Si tu ne peux pas, corrige-le.

Supprime `CONFIG-MIGRATION-PLAN.md` et vérifie qu'il n'apparaît dans aucun commit
(`git log --all --oneline -- CONFIG-MIGRATION-PLAN.md` vide).

Conclus en 5 lignes dans la conversation : commits, fichiers supprimés, nombre
d'instructions retirées et réécrites, SHOULD non respectés et pourquoi.
