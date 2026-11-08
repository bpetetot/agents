# Ben skills

Personal skills, agents and hooks for Claude Code, packaged as a single plugin.
Skills follow the [Agent Skills](https://agentskills.io) format, so other agents can use them too.

## Skills

| Skill                   | Description                                                                                                    | Source          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- | --------------- |
| `ben:unslop`            | Cut AI tells from any writing.                                                                                 | pstack (poteto) |
| `ben:agents-md-audit`   | Audit the repo's Claude Code setup against the 2026 checklist and write a migration plan, without changes.     | bpetetot        |
| `ben:agents-md-migrate` | Run the audit plan: short AGENTS.md, scoped rules, skills, hooks, permissions, subagents. One commit per step. | bpetetot        |
| `ben:agents-md-tune`    | Periodic upkeep: detect drift, prune or rewrite instructions, promote violated rules to hooks.                 | bpetetot        |

## Mods

| Mod   | Description                                                                                                                  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| Usage | Subscription rate limits (`5h 48% · 7j 12%`) at the right of the prompt footer. Reset time and color from 70%, red from 90%. |

## Install

### Claude Code

```
/plugin marketplace add bpetetot/skills
/plugin install ben@ben-skills
```

Enable auto-update for the `ben-skills` marketplace in `/plugin` to get every new commit.

### Other agents

```
npx skills add bpetetot/skills
```

## Development

Load the plugin from the working copy, without pushing:

```
claude --plugin-dir ~/dev/oss/skills
```

Validate before pushing:

```
claude plugin validate .
claude plugin test .
```
