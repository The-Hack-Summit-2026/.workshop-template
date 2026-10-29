# Participant Guide: Secret Protection Workshop

A **60-minute, instructor-led hands-on workshop** for GitHub Advanced Security
(GHAS), focusing on **GitHub Secret Protection**: secret scanning, validity
checks, generic patterns, AI-detected passwords, push protection, custom
patterns, controlled alert dismissal, and Git history cleanup.

The Node.js app is intentionally tiny. The learning goal is the security
workflow, not application development.

## Safety rules

- Use a **disposable repository created from this template**, not a production
  repository or a fork of one. Each participant should own their lab repository.
  Organization-only exercises use instructor-provisioned organization repositories.
- Never use real personal, customer, or production credentials. This template
  contains only **placeholders and explicitly synthetic examples**, not functional
  credentials. The provider prevention exercise requires an
  instructor-approved, already revoked/nonfunctional test credential; the live
  validity exercise uses a disposable, minimal-scope instructor token that the
  **instructor revokes during the exercise**; the custom-pattern exercise uses a
  completely inert marker.
- Do not paste test credentials into chat, screenshots, issue comments, terminal
  history, or support tickets. Enter the provider test credential using an editor.
- Keep Codespaces ports private. Do not disable organization protections or
  bypass push protection for a real secret.
- Revoke/rotate an exposed credential **first**. Deleting a file, dismissing an
  alert, and rewriting history do not revoke it or erase everyone else's copies.
- Commands below are for your **own disposable lab only**. History rewrites
  change commit IDs and can destroy collaborators' work.

## Participant setup (before the clock starts)

1. Open **Code → Codespaces → Create codespace**. The devcontainer supplies
   Node.js 22 and `git-filter-repo` 2.47.0 via `pipx` (Python is installed by
   the `pipx` system package). No app dependencies or Java runtime are needed.

2. In the Codespaces terminal, set the workshop root once:

   ```bash
   export WORKSHOP_ROOT="$PWD"
   node --version
   git filter-repo --version
   npm run check
   cp "$WORKSHOP_ROOT/.env.example" "$WORKSHOP_ROOT/.env"
   npm start
   ```

3. Open port **3000**, retaining **Private** visibility, or use another terminal:

   ```bash
   curl http://127.0.0.1:3000/health
   curl http://127.0.0.1:3000/config
   ```

   Expect `{"status":"ok"}` and three `false` configuration-presence flags.
   The app uses only Node's standard library, binds to loopback, never contacts
   a provider, and never returns environment values. Stop it with **Ctrl+C**.

For a non-Codespaces environment, use Node.js 22.9+ and install
`git-filter-repo` 2.47.0 with `pipx install git-filter-repo==2.47.0`.
The app has no build step or dependency-install step. `npm run check` checks
JavaScript syntax; use the HTTP requests above for the smoke test.

## 60-minute agenda

| Time | Guided activity | Evidence / checkpoint |
| --- | --- | --- |
| 00–05 | Threat model and incident response | Explain scanning vs prevention vs revocation vs cleanup |
| 05–10 | Lab 1: app and repository settings | Health endpoint works; correct repository settings are enabled |
| 10–20 | Lab 2: provider scanning, push protection, validity | Blocked push; participant inspects their own alert and validity state |
| 20–28 | Lab 3: generic patterns and AI passwords | Distinguish the two detection paths and their limitations |
| 28–40 | Lab 4: custom pattern | Dry run, publish, and an inert marker blocked by push protection |
| 40–47 | Lab 5: prevent direct dismissal | Non-reviewer requests dismissal; reviewer decides |
| 47–57 | Lab 6: cleanup with `git-filter-repo` | Deleted marker still exists in history, then is removed |
| 57–60 | Debrief and teardown | Revoke first, verify cleanup, restore protections, delete labs |

This agenda is for facilitated delivery. For self-paced use, complete the labs
in order and use the checkpoints to confirm your understanding. Some features
require organization-level access or a second reviewer; those labs include a
prepared-example fallback.

## Lab 1 — orient and inspect

### Participant instructions

1. Start the app. Locate `server.js`, `.env.example`, and `labs/secrets.example.txt`.

   ```bash
   cd "$WORKSHOP_ROOT"
   npm start
   ```

2. In another terminal (or after opening port **3000** with **Private**
   visibility), send the health/config requests, then stop the app with
   **Ctrl+C**:

   ```bash
   curl http://127.0.0.1:3000/health
   curl http://127.0.0.1:3000/config
   ```

   Expect `{"status":"ok"}` and three `false` configuration-presence flags.

3. Open your repository's **Settings → Advanced Security** and enable the
   protections in this order (skip any that are already enabled):
   - Click **Enable** next to **GitHub Advanced Security** and confirm if prompted.
   - Click **Enable** next to **Secret Protection** (confirm with
     **Enable Secret Protection**). This turns on secret scanning.
   - Turn on **repository push protection**.

**Checkpoint:** explain why an empty/placeholder environment variable does not
trigger a provider alert, and why the app never echoes the value.

**Where to look:** the three variables — `GH_PROVIDER_TOKEN`,
`DATABASE_PASSWORD`, and `INTERNAL_SERVICE_TOKEN` — are defined empty in
`.env.example`, with matching placeholders in `labs/secrets.example.txt`. The
`/config` handler in `server.js` wraps each value in `Boolean(...)`, so the
response reports only `true`/`false` presence and never the secret itself.

## Lab 2 — provider secrets, blocked pushes, and validity

### Participant instructions

#### A. Prevention: observe push protection

Only use an instructor-approved, already revoked/nonfunctional test credential
that was preflighted for the selected provider. If no approved value is
available, observe the prepared blocked-push demonstration; do not generate a
live token.

1. Create the private lab file from the template:

   ```bash
   cd "$WORKSHOP_ROOT"
   mkdir -p "$WORKSHOP_ROOT/.workshop-private"
   cp "$WORKSHOP_ROOT/labs/secrets.example.txt" \
     "$WORKSHOP_ROOT/.workshop-private/provider-secret.txt"
   ```

2. In the editor, replace **only** the provider_token placeholder with the approved
   test credential. Leave the other placeholders unchanged.

3. Deliberately stage just that ignored lab file (this is not normal practice):

   ```bash
   git switch -c lab/provider-push
   git add -f -- .workshop-private/provider-secret.txt
   git commit -m "Lab: attempt to push a revoked provider test credential"
   git push -u origin lab/provider-push
   ```

4. Inspect the rejection and the file/commit location. **Do not use the bypass
   link.** A blocked push has not landed on GitHub and is not a guaranteed new
   secret-scanning alert. Organization policies or delegated bypass may limit
   who can bypass; never assume a participant can self-approve.

5. Remove the test credential from the **unpushed commit**, not merely a new commit:

   ```bash
   git rm -- .workshop-private/provider-secret.txt
   git commit --amend --no-edit --allow-empty
   git push -u origin lab/provider-push
   ```

   Expect the amended push to succeed. `--allow-empty` preserves the lab commit
   when removing the test credential leaves no other changes. These commands
   assume exactly the one new, blocked commit above. If multiple commits contain
   the test credential, stop and ask the instructor: deleting it at the tip will
   not fix the history.
   Do not display old commit contents or continue if the first push unexpectedly
   succeeded; report it and use the incident-response/cleanup procedure.

#### B. Detection and validity: inspect your own alert

A blocked push is not guaranteed to create a secret-scanning alert. To inspect
an alert yourself — and watch its validity change live — this exercise uses an
**instructor-provided GitHub personal access token** that is **active** at the
start and that the **instructor revokes during the exercise**. Use it only in
your **private disposable repository**, and never substitute a real, shared, or
long-lived credential of your own. A randomly invented provider-shaped string
may not be detected or may report `unknown`; use the token your instructor
provides.

1. After the prevention exercise, keep secret scanning enabled. If repository
   policy permits, temporarily turn off **repository push protection** for this
   private lab repository only. Do not change organization policy or bypass a
   blocked push. If you cannot change this setting, use the instructor's prepared
   alert or redacted screenshots.

2. Recreate `.workshop-private/provider-secret.txt` from
   `labs/secrets.example.txt` and replace only its provider placeholder with the
   instructor-provided GitHub token (active at this point). Then commit and push
   it on the `lab/provider-push` branch. This intentionally lets scanning
   inspect the credential in the disposable repository:

   ```bash
   # Recreate the .workshop-private directory; the previous exercise's `git rm`
   # removed it once it became empty.
   mkdir -p "$WORKSHOP_ROOT/.workshop-private"
   cp "$WORKSHOP_ROOT/labs/secrets.example.txt" \
     "$WORKSHOP_ROOT/.workshop-private/provider-secret.txt"
   # Edit the file and replace only the provider_token placeholder.
   git add -f -- .workshop-private/provider-secret.txt
   git commit -m "Lab: scan provider test credential"
   git push origin lab/provider-push
   ```

3. Open **Security → Secret scanning** and inspect the alert's type and location
   without copying or displaying the value. Check its validity state and use
   **Verify secret**. Because the instructor's token is still active, GitHub
   reports the credential as **active** (token checks are on by default). For
   other supported providers, enable **Validity checks → Enable → Save changes**.
   Scanning and validity checks may take time, and provider/network limitations
   can result in `unknown`.

4. Watch the validity change live. The **instructor now revokes the token** in
   GitHub (**Settings → Developer settings → Personal access tokens → Delete**).
   Wait briefly, then use **Verify secret** again on the same alert. The validity
   state changes from **active** to **inactive** (or `unknown` if the provider or
   network cannot confirm). This shows that validity reflects the provider's live
   answer at check time, not a fixed property of the alert.

5. Restore repository push protection immediately. Remove the test credential
   from the working tree and amend it out of the lab commit before continuing:

   ```bash
   git rm -- .workshop-private/provider-secret.txt
   git commit --amend --no-edit --allow-empty
   git push --force-with-lease origin lab/provider-push
   ```

   The force push is only for this participant-owned disposable branch, after
   confirming no one else uses it. If repository rules prohibit it, stop and ask
   the instructor; do not push a follow-up deletion commit and assume that
   removed the credential from history.
6. Explain the result: `active` means the provider confirms the credential still
   works, so exposure is urgent; after revocation, `inactive` means the provider
   reports it is no longer active, and `unknown` is not proof that it is safe.
   None of these statuses proves the credential was never abused. Review exposure
   and access logs before resolving an incident. Custom tokens and generic
   passwords are not validatable just because scanning detects them.

**Checkpoint:** participant describes why an `active` validity result makes
revocation urgent, how the status changed to `inactive`/`unknown` once the token
was revoked, and why a follow-up deletion commit does not remove a credential
from earlier history.

## Lab 3 — generic patterns versus AI-detected passwords

### Participant instructions

These exercises use **synthetic, never-used values**, not account credentials.
Keep the categories distinct:

- **Generic/non-provider patterns** are recognizers for non-provider secrets
  such as supported connection strings or keys; they are not the custom-pattern
  engine and are not necessarily AI-based.
- **AI password detection** identifies potential passwords using context.
  It is not guaranteed to flag an arbitrary word or every example.

1. Open **Settings → Advanced Security** and find the **Secret Protection**
   section. Locate **Generic patterns** and **AI-detected secrets**, and note
   which are enabled (each is a separate scanning category). The repository
   **Push protection** toggle only turns enforcement on; *which* patterns it
   blocks — including whether non-provider/generic patterns are included — is
   chosen at the **organization** level under **Settings → Advanced Security →
   Global settings → Secret scanning → Push protection → Pattern configurations**
   (public preview). AI-detected passwords cannot be push-protected.
2. Create the empty file, then open it in the editor and paste a **synthetic
   connection-string example** for a currently supported generic pattern (use the
   instructor's preflighted value). Do not connect it to a real service:

   ```bash
   touch "$WORKSHOP_ROOT/labs/generic-demo.txt"
   ```

   Example content to paste (synthetic — never a real service):

   ```text
   mongodb://demo_user:Workshop-synthetic-NOT-real-2026@db.example.invalid:27017/demo
   ```

3. Create the empty file, then open it and add a synthetic contextual password
   assignment (the `databasePassword` name gives AI detection its context):

   ```bash
   touch "$WORKSHOP_ROOT/labs/password-demo.js"
   ```

   Example content to add:

   ```javascript
   // Workshop-only password; never used for an account or service.
   const databasePassword = 'WorkshopOnly-not-a-real-password-2026!';
   ```

4. Commit only those two files on a lab branch and push:

   ```bash
   cd "$WORKSHOP_ROOT"
   git switch -c lab/generic-ai
   git add -- labs/generic-demo.txt labs/password-demo.js
   git commit -m "Lab: synthetic non-provider detection examples"
   git push -u origin lab/generic-ai
   ```

5. Observe the alert categories once scanning finishes. The example password
   is **not a guaranteed trigger**.
   No block on push is expected merely because password detection is enabled.
   If the push was rejected, remove both files from this **unpushed** commit
   and retry so the rejected commit is not left in branch history:

   ```bash
   git rm -- labs/generic-demo.txt labs/password-demo.js
   git commit --amend --no-edit --allow-empty
   git push -u origin lab/generic-ai
   ```

   If the push succeeds, inspect any alerts, then remove the two synthetic files
   in a follow-up commit and push. They are never-used examples, not credentials;
   the deletion removes them from the current tree but not history. If a retry is
   blocked, stop and ask the instructor before proceeding:

   ```bash
   git rm -- labs/generic-demo.txt labs/password-demo.js
   git commit -m "Lab: remove synthetic detection examples"
   git push origin lab/generic-ai
   ```

**Checkpoint:** identify which examples are provider patterns, generic
patterns, AI-detected passwords, and custom patterns, and why each needs
different validation.

## Lab 4 — custom patterns and deterministic push protection in Secret Protection

### Participant instructions

This is the repeatable hands-on fallback when provider test credentials or AI
features are unavailable. The marker is **not a credential**, has no privileges,
and is not used by the app.

#### A. Seed an inert historical example

Before publishing the pattern, in your disposable repository:

```bash
cd "$WORKSHOP_ROOT"
git switch -c lab/custom-pattern
printf 'THS_DEMO_%032d\n' 0 > "$WORKSHOP_ROOT/labs/custom-secret.txt"
git add -- labs/custom-secret.txt
git commit -m "Lab: inert marker before custom pattern exists"
git push -u origin lab/custom-pattern
```

#### Configure the custom pattern (repository admin)

In a self-paced session, complete this setup yourself if you have repository
administrator permissions. During facilitated delivery, wait for the instructor
or repository administrator to confirm the pattern is published and push
protection is enabled before continuing.

1. Open **Settings → Advanced Security → Secret Protection → Custom patterns** and create
   a **custom pattern**:

   | Field | Value |
   | --- | --- |
   | Name | `THS workshop inert token` |
   | Secret format | `THS_DEMO_[a-f0-9]{32}` |
   | Before secret / After secret | Keep the UI's default boundaries |
   | Additional match requirements | None |

   This intentionally narrow expression avoids real providers and ordinary text.
   Its 32 lowercase hex characters match both generated examples in this lab.
   The placeholders in this template do not match.
2. In **Test string**, enter
   `THS_DEMO_0123456789abcdef0123456789abcdef` and verify that the pattern
   matches before saving. This confirms the expression works with an example
   before the repository scan.
3. Run a **dry run**, select the `lab/custom-pattern` branch if prompted, and
   inspect the results. Confirm the location is `labs/custom-secret.txt`, not
   documentation. Dry runs may take time and do not create enforceable protection.
4. **Publish** the pattern and wait for its history scan. Inspect the resulting
   custom-pattern alert. Enable **push protection for this custom pattern** once
   it is published and eligible; merely publishing it is not enough.
5. Remove the seeded file in a new commit and push. From the repository root,
   run:

   ```bash
   cd "$WORKSHOP_ROOT"
   git rm labs/custom-secret.txt
   git commit -m "Lab: remove seeded custom-pattern marker"
   git push
   ```

   This removes the file from the latest commit but leaves the original marker
   in branch history. Leave its alert open for Lab 5.

#### B. Block a new occurrence

After the custom pattern is published and push protection is enabled, use a
**different** marker so the exercise is not an already-known occurrence.

```bash
printf 'THS_DEMO_%032d\n' 1 > "$WORKSHOP_ROOT/labs/custom-secret.txt"
git add -- labs/custom-secret.txt
git commit -m "Lab: new inert custom-pattern occurrence"
git push
```

Expect rejection naming the custom pattern. Do not bypass. Remove the marker
from that one unpushed commit and retry:

```bash
git rm -- labs/custom-secret.txt
git commit --amend --no-edit --allow-empty
git push
```

If it is not blocked, stop and check publication, push protection enablement,
matching boundaries, propagation delay, and whether the occurrence was already
known. Do not widen the pattern indiscriminately or disable global protections.

**Checkpoint:** a dry-run result, historical alert, blocked new marker, and
successful corrected push. Explain how broad patterns can create false positives.

## Lab 5 — prevent direct alert dismissals

### Participant instructions

This is an **organization** exercise. Use the prepared organization repository
if a participant's personal repository does not expose this policy.

1. Before starting, ask the instructor or repository administrator to check
   **Settings → Code security → Prevent direct alert dismissals**. The setting
   must show **On** for this repository. If it shows **Off**, ask them to enable
   it before continuing; participants who lack repository administration
   permission cannot turn it on themselves. If the setting is managed by an
   organization security configuration, an organization owner must enable it
   there.
2. In the organization repository, open **Security and quality → Secret
   scanning alerts**. Find and click the open alert named **THS workshop inert
   token** (or the instructor-identified prepared alert). On its details page,
   click **Close alert**, choose **False positive**, and explain that the inert
   training marker is not a live credential. The close dialog may still show a
   **Close alert** button rather than a separate “Submit dismissal request”
   option. Do not click it unless the instructor has confirmed the policy is
   active for this repository and account.
3. With the policy confirmed, submit the close flow. Verify that the alert stays
   open and a dismissal request is pending review. If you cannot confirm the
   policy, or if the alert closes instead of creating a request, cancel/stop and
   ask the instructor to check the setting and account roles. If the alert is
   missing, confirm you are in the prepared organization repository and that
   the custom-pattern history scan has finished; ask the instructor for the
   prepared alert if needed. Repository admin status alone does not grant direct
   dismissal.
4. Ask an organization owner or security manager to inspect the pattern/location
   and approve or deny the request. Review the resulting status/audit trail.
   Denial leaves the alert open; unanswered requests expire after one week.
5. Contrast this with **delegated push-protection bypass**, which governs
   permission to push a detected secret, not dismissal of an existing alert.

**Checkpoint:** participants can explain who requested, who reviewed, and why
an approved dismissal neither revokes a token nor removes its historical content.

## Lab 6 — deletion is not cleanup

### Participant instructions

#### Why `git-filter-repo` in Codespaces?

| Tool | Trade-off |
| --- | --- |
| **`git-filter-repo` (chosen)** | Python-based, no Java required, supports exact paths and text replacement; GitHub documents `--sensitive-data-removal` (requires version 2.47+) |
| **BFG Repo-Cleaner** | Fast JVM-based file/text cleanup; needs Java and a downloaded JAR; protects the latest commit by default, so first remove secrets from the tip |
| `git filter-branch` | Legacy, error-prone and slow; Git itself recommends alternatives; not used here |

For this short Codespaces workshop, use the already installed `git-filter-repo`.
BFG remains useful in teams with JVM tooling, but switching tools does not remove
the need for revocation, coordination, and hosted-reference cleanup.

#### A. Safe, local, reproducible cleanup (all participants)

This creates a **new local repository in `/tmp`**, not a clone, not a remote,
and not your Codespaces workshop checkout. It contains only an inert marker.
No authentication or force push is needed.

```bash
export HISTORY_LAB="$(mktemp -d /tmp/ths-history-lab.XXXXXX)"
git init -b main "$HISTORY_LAB"
cd "$HISTORY_LAB"
git config user.name "Workshop Demo"
git config user.email "workshop@example.invalid"

printf 'Safe workshop content\n' > "$HISTORY_LAB/app.txt"
git add -- app.txt
git commit -m "Safe baseline"

mkdir -p "$HISTORY_LAB/labs"
printf 'THS_DEMO_%032d\n' 0 > "$HISTORY_LAB/labs/custom-secret.txt"
git add -- labs/custom-secret.txt
git commit -m "Add inert marker"
git rm -- labs/custom-secret.txt
git commit -m "Delete marker from current tree only"

# Expected: the two marker-related commits are still present.
git log --all --oneline -- labs/custom-secret.txt

# --force bypasses the fresh-clone guard ONLY for this newly fabricated local lab.
# Never use it to rescue an unexpected refusal in a real repository.
git filter-repo --sensitive-data-removal --invert-paths \
  --path labs/custom-secret.txt --force

# Expected: no output for either history check.
git log --all --oneline -- labs/custom-secret.txt
git rev-list --objects --all | grep 'labs/custom-secret.txt'
# grep exits 1 when no matching object path is found: that is expected.
git log --oneline
cat "$HISTORY_LAB/app.txt"
cd "$WORKSHOP_ROOT"
```

**Checkpoint:** the deleted path is gone from reachable history, while the safe
baseline and `app.txt` survive. Review the tool's changed-commit report.
These checks validate the removed path, not every possible copy of a secret.
If a file was renamed or copied, include **every historical path** in the rewrite.

## Participant cleanup

- [ ] Check no live credentials were used; revoke any inadvertently exposed ones.
- [ ] Restore any temporary protection exceptions; keep scanning/push protection on.
- [ ] Remove training files/patterns or delete disposable repositories according
  to organization policy; do not treat an alert dismissal as cleanup.
- [ ] Delete disposable Codespaces and temporary lab directories when finished.
- [ ] Do not reuse synthetic passwords for real accounts.

## Official references

- [GitHub Secret Protection](https://docs.github.com/en/code-security/getting-started/github-security-features)
- [Supported secret scanning patterns and feature support](https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns)
- [Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning)
- [Push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)
- [Validity checks](https://docs.github.com/en/code-security/concepts/secret-security/validity-checks)
- [Enable validity checks](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/customize-leak-detection/enable-validity-checks)
- [Enable generic patterns](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/detect-secret-leaks/enabling-secret-scanning-for-generic-patterns)
- [Enable AI-detected secrets](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/detect-secret-leaks/enabling-secret-scanning-for-ai-detected-secrets)
- [Configure organization push-protection patterns (public preview)](https://docs.github.com/en/code-security/how-tos/secure-at-scale/configure-organization-security/establish-complete-coverage/configure-global-settings#specifying-patterns-to-include-in-push-protection)
- [Custom patterns](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/customize-leak-detection/define-custom-patterns)
- [Delegated alert dismissal](https://docs.github.com/en/code-security/how-tos/manage-security-alerts/manage-secret-scanning-alerts/enable-delegated-dismissal)
- [Delegated push-protection bypass](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/manage-bypass-requests/enable-delegated-bypass)
- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [`git-filter-repo` project and manual](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
