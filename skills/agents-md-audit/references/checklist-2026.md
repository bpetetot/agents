# Checklist — configuration Claude Code (état de l'art, novembre 2026)

Référentiel des skills `agents-md-audit`, `agents-md-migrate` et
`agents-md-tune`. Chaque critère est formulé pour être vérifiable par un agent.

Légende : **[MUST]** bloquant · **[SHOULD]** recommandé · **[MAY]** optionnel.

Convention : « fichier racine » désigne le fichier d'instructions à la racine du repo,
`AGENTS.md` ou `CLAUDE.md` (voir A1b).

---

## A. Fichiers d'instructions

- **A1 [MUST]** Un seul fichier d'instructions racine, source de vérité unique. Aucun autre
  (`.cursorrules`, `GEMINI.md`, `copilot-instructions.md`) ne porte de contenu dupliqué ;
  s'ils existent sans usage, les supprimer.
- **A1b [SHOULD]** Ce fichier s'appelle `AGENTS.md`, pas `CLAUDE.md`. Claude Code ≥ 2.1.277
  (sept. 2026) lit `AGENTS.md` nativement quand aucun `CLAUDE.md` n'existe dans le dossier ni
  dans un parent. Conditions : `claude --version` ≥ 2.1.277, aucun `CLAUDE.md` résiduel dans
  un parent (hors `~/.claude/CLAUDE.md`, mémoire utilisateur), vérification après renommage
  que les imports `@` sont résolus, sinon les convertir en liens Markdown. Version plus
  ancienne ou Bedrock/Vertex/Foundry : garder `CLAUDE.md`.
- **A2 [MUST]** `CLAUDE.local.md` et `.claude/settings.local.json` dans `.gitignore`.
- **A3 [SHOULD]** Fichier de sous-dossier (`apps/web/AGENTS.md`, même nom que le racine)
  pour ce qui ne concerne qu'une zone : chargé seulement quand Claude y travaille, jamais de
  répétition du racine. Ne jamais mélanger les deux noms dans un repo : un `CLAUDE.md`
  imbriqué fait ignorer `AGENTS.md` dans tout son sous-arbre.
- **A4 [MAY]** `~/.claude/CLAUDE.md` pour les préférences personnelles transverses ; rien de
  projet n'y vit.

## B. Taille, densité et style du fichier racine

- **B1 [MUST]** ≤ 150 lignes et ≤ ~100 instructions impératives. Au-delà, l'adhérence
  chute : ce qui est rarement utile part dans des fichiers chargés à la demande.
- **B2 [MUST]** Chaque instruction est spécifique et vérifiable. Interdit : « écris du code
  propre ». Attendu : « `pnpm test --filter <pkg>` avant tout commit », « jamais `any` sans
  commentaire `// why:` ».
- **B3 [SHOULD]** Supprimer toute instruction que Claude respecte déjà sans elle.
- **B4 [SHOULD]** Pas de duplication avec ce qui est lisible ailleurs (README, manifestes,
  schéma) : pointer vers le fichier.
- **B5 [SHOULD]** Instructions les plus importantes en tête ; formulation positive sauf
  interdits réels.
- **B6 [SHOULD]** Style des instructions (fichier racine, rules, corps des skills) :
  - une instruction par ligne, verbe à l'impératif en tête ;
  - aucun modalisateur (« si possible », « généralement », « il serait préférable »,
    « essaie de ») : soit c'est une règle, soit ça n'est pas écrit ;
  - voix active, pas de politesse, pas de phrase d'introduction ;
  - la raison reste, en une proposition courte après deux-points ou tiret
    (« jamais `any` — casse l'inférence en aval ») ;
  - commandes, chemins, noms exacts conservés ; un exemple do/don't vaut mieux qu'un adjectif.
  - **Garde-fous** : simplifier n'autorise jamais à (a) remplacer un détail concret par un
    terme générique, (b) supprimer la raison d'une règle, (c) fusionner deux règles en une
    phrase, (d) retirer un exemple. Si la version courte perd l'un de ces éléments, la longue
    reste.
- **B7 [MAY]** Docs chargées à la demande (`docs/**`, `references/` des skills) : ton
  explicatif autorisé, conclusion d'abord puis justification, paragraphes ≤ 5 lignes, un titre
  par idée.

## C. Structure attendue du fichier racine

Sections dans cet ordre (omettre celles vides) :

1. **Projet en une phrase** + stack (versions figées).
2. **Commandes** : install, dev, build, test (unitaire / e2e / un seul fichier), lint,
   typecheck, format. Exactes, copiables.
3. **Architecture** : carte des dossiers (5–15 lignes), points d'entrée, frontières.
4. **Conventions** : nommage, structure d'un module type, erreurs, logs.
5. **Workflow Git** : branches, format de commit, contenu d'une PR, jamais commité.
6. **Vérification** : comment Claude prouve que le travail est fini. Section la plus rentable.
7. **Workflow Claude Code** : plan mode pour les tâches > N fichiers, `/clear` entre tâches,
   commit par étape, quand solliciter quel sous-agent ou skill.
8. **Interdits** : liste courte, chaque ligne avec la raison.
9. **Où aller chercher plus** : `@docs/architecture.md`, rules, skills.

## D. Chargement progressif

- **D1 [MUST]** Les détails longs (guide de style complet, procédures, schémas) vivent dans
  `docs/` ou dans des skills ; le fichier racine y renvoie par `@chemin` (chargé toujours) ou
  lien Markdown (chargé à la demande).
- **D2 [SHOULD]** `.claude/rules/<sujet>.md` avec frontmatter `paths: ["src/api/**"]` :
  chargé seulement quand Claude touche ces fichiers. Sans `paths`, chargé à chaque session.
- **D3 [SHOULD]** Imports `@` : 3–5 maximum, uniquement ce qui sert à chaque session.
- **D4 [MAY]** Profondeur d'import ≤ 2.

## E. Skills de projet (`.claude/skills/<nom>/SKILL.md`)

- **E1 [MUST]** Frontmatter `name` (kebab-case = dossier) + `description`.
- **E2 [MUST]** `description` dit ce que fait le skill **et quand l'utiliser**.
- **E3 [SHOULD]** Corps < 500 lignes ; détail dans `references/`, `scripts/`, `assets/`.
- **E4 [SHOULD]** Candidats : procédure répétée > 2 fois. Les anciens `.claude/commands/*.md`
  sont migrés en skills.
- **E5 [MAY]** Pas de README dans un skill ; les scripts prennent des arguments.

## F. Déterminisme : hooks et permissions plutôt que prose

- **F1 [MUST]** Toute règle qui *doit* être respectée (formatage, push sur `main`, secrets,
  tests) est un hook ou un check CI dans `.claude/settings.json`, pas une phrase.
- **F2 [SHOULD]** `PostToolUse` (Edit|Write) → formateur ; `PreToolUse` (Bash) → bloque les
  commandes destructives ; `Stop` → tests si fichiers modifiés.
- **F3 [SHOULD]** `permissions.allow` / `deny` versionnées ; le personnel dans
  `settings.local.json`.
- **F4 [SHOULD]** Secrets et gros fichiers exclus de la lecture (`.claudeignore` ou `deny`).
- **F5 [MAY]** `SessionStart` qui affiche l'état du repo.

## G. Sous-agents (`.claude/agents/<nom>.md`)

- **G1 [SHOULD]** Un sous-agent par rôle répété : `name`, `description` (quand l'invoquer),
  `tools` restreints, `model` adapté.
- **G2 [SHOULD]** Une ligne par sous-agent dans la section 7 du fichier racine.

## H. Documentation projet orientée agent

- **H1 [MUST]** `docs/` contient au minimum `architecture.md` (décisions structurantes, pas
  un tutoriel), `conventions.md` (le guide complet que le racine résume), `testing.md`.
- **H2 [SHOULD]** Chaque doc commence par `> Lis ce fichier quand : …`.
- **H3 [SHOULD]** Aucune doc ne recopie le code (signatures, listes de fichiers).
- **H4 [MUST]** Aucun fichier de suivi (changelog, rapport, référentiel) n'est écrit dans le
  projet par ces skills. Seule exception : le plan de migration `CONFIG-MIGRATION-PLAN.md` à
  la racine, temporaire, jamais commité, supprimé par la restructuration. Les justifications
  vont dans les messages de commit.

## I. Hygiène et maintenance

- **I1 [MUST]** Fichier racine mis à jour dans le même commit que tout changement de
  commande, stack ou convention.
- **I2 [SHOULD]** Revue mensuelle : retirer les instructions non déclenchées, promouvoir en
  hook celles violées, convertir en skill les procédures répétées.
- **I3 [MAY]** Instructions ajoutées via `#` en session : les relire au prochain commit.

---

## Anti-patterns à signaler systématiquement

| Symptôme | Problème | Correctif |
|---|---|---|
| Fichier racine > 200 lignes | Règles noyées | Découper (D1, D2), élaguer (B3) |
| 10 imports `@` en tête | Contexte saturé à chaque session | Garder 3–5, le reste en lien (D3) |
| « Toujours lancer les tests » en prose, jamais fait | Pas déterministe | Hook (F1) |
| Liste de tous les fichiers du projet | Se périme | Carte des dossiers (H3) |
| Instructions vagues | Non vérifiables | Exemples do/don't (B2) |
| Skill de 1 200 lignes | Jamais lu en entier | Corps court + `references/` (E3) |
| `description` de skill = son nom | Jamais déclenché | « Fait X. Utiliser quand Y. » (E2) |
| `commands/` et `skills/` coexistent | Doublon | Migrer en skills (E4) |
| `CLAUDE.md` et `AGENTS.md` coexistent | `AGENTS.md` ignoré | Un seul nom (A1b) |
| « Il serait préférable de… » | Règle lue comme suggestion | Impératif ou suppression (B6) |
| Règle raccourcie en « fais des tests » | Précision perdue | Rétablir la commande (B6 garde-fous) |
| Interdit sans raison | Ne se généralise pas | Ajouter la raison (B6) |
