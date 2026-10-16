# Secret Protection: find, block, and clean up secrets

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
  credentials. Provider-pattern exercises require an
  instructor-approved, already revoked/nonfunctional test credential; the
  custom-pattern exercise uses a completely inert marker.
- Do not paste test credentials into chat, screenshots, issue comments, terminal
  history, or support tickets. Enter the provider test credential using an editor.
- Keep Codespaces ports private. Do not disable organization protections or
  bypass push protection for a real secret.
- Revoke/rotate an exposed credential **first**. Deleting a file, dismissing an
  alert, and rewriting history do not revoke it or erase everyone else's copies.
- Commands below are for your **own disposable lab only**. History rewrites
  change commit IDs and can destroy collaborators' work.

## Before the session

### Instructor checklist

- [ ] Create disposable repositories and test the exercises using the same
  organization policies and participant permissions as the workshop.
- [ ] Confirm Codespaces access/quota and start or prebuild the environment;
  container creation and package downloads are outside the 60-minute agenda.
- [ ] Enable secret scanning and repository push protection under **Settings →
  Advanced Security**, in the **Security and quality** sidebar section (older
  interfaces use **Code security and analysis**).
  Ensure organization policy permits the required settings.
- [ ] Confirm entitlement: secret scanning is available on public repositories.
  Private/internal organization repositories require an appropriate paid plan
  and **GitHub Secret Protection** access. Do not assume an individual private
  repository has the full feature set.
- [ ] Enable validity checks, non-provider/generic patterns, and AI password
  detection where available. Check the feature table below.
- [ ] Prepare a nonfunctional provider test credential for each participant
  repository. Preflight that it triggers scanning and push protection, and
  confirm which validity result it produces. Use private disposable repositories;
  never use an active credential. Recognizable prefixes alone do not guarantee
  detection.
- [ ] Have redacted active/inactive/unknown validity examples ready for providers
  or plans that do not support participant verification. Never ask participants
  to create or commit a live token.
- [ ] Identify the custom-pattern administrator, an organization owner or security
  manager for dismissal review, and a participant account without either role.
- [ ] Prepare screenshots of features unavailable on the participants' plan and
  of delayed scans. Do not spend the session waiting for asynchronous results.
- [ ] Verify the organization allows force pushes in an isolated cleanup demo
  repository, if demonstrating the optional hosted cleanup. Never relax rules
  on the workshop template or a shared/production repository.

### Feature and permission map

Availability, preview status, UI labels, and organization policies can change.
Check the linked documentation and rehearse immediately before delivery.

| Feature | Exercise / required access | Important limitation |
| --- | --- | --- |
| Provider secret scanning | Participant views **Security → Secret scanning**; repository admin enables scanning | Placeholders are not provider test credentials; supported patterns may require additional context or pairs of values |
| Validity checks | Admin enables checks; participant inspects an alert's validity | GitHub token checks are on by default; other supported providers require enablement; `unknown` is not safe |
| Generic/non-provider patterns | Admin enables **Generic patterns**; participant views its alert category | No validity checks; optional push protection is configured separately at organization/enterprise level (public preview) |
| AI-detected passwords | Enable **Scan for AI-detected secrets** in an eligible organization repository | Context-dependent; no Copilot subscription required; passwords support neither push protection nor validity checks |
| Repository push protection | Admin enables it; participant attempts an authenticated push | Only supported push-protection patterns; user-level public push protection is a different setting |
| Custom patterns | Repository/organization admin or authorized security manager creates, dry-runs, and publishes a pattern | A dry run is not enforcement; enable its push protection separately after validation |
| Prevent direct alert dismissals | Admin enables the repository setting, or an organization applies a custom security configuration; participant requests dismissal | Organization owners/security managers review; distinct from delegated **push-protection bypass** |
| History cleanup | Anyone can do the local inert exercise; hosted rewrite requires repository owner coordination | Cleanup is not revocation and cannot purge third-party clones, forks, or GitHub PR refs by itself |

If an organization-only feature is unavailable, the instructor demonstrates it
in the prepared organization repository; participants observe and explain the
expected outcome. Public personal repositories are useful for the core labs,
but do not guarantee every organization feature.

### Participant setup (before the clock starts)

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

Each lab separates **Participant instructions** from **Instructor instructions**.
For self-paced use, follow the participant steps and use the instructor notes as
preparation and troubleshooting guidance. During facilitated delivery, instructors
prepare the repositories and permissions in advance, then let participants perform
the hands-on steps. Pair participants for organization administration/reviewer
roles. Keep installation, provisioning, and any active-token demonstration
outside the timed hands-on work.

## Lab 1 — orient and inspect (5 minutes)

### Participant instructions

1. Run the app's health/config requests from setup. Locate `server.js`,
   `.env.example`, and `labs/secrets.example.txt`.
2. Open your repository's **Settings → Advanced Security**.
   Confirm secret scanning and **repository** push protection are enabled.
3. Open **Security → Secret scanning**. Note the alert categories and who can
   view or manage alerts. Do not confuse dependency scanning or code scanning
   with secret scanning.

**Checkpoint:** explain why an empty/placeholder environment variable does not
trigger a provider alert, and why the app never echoes the value.

### Instructor instructions

Before the session, confirm participants have access to their own disposable
repositories and Codespaces. Ensure the repository settings are enabled, or
identify the prepared organization repository to use when a participant plan or
role does not expose them. Ask participants to describe the difference between
secret scanning and code/dependency scanning before moving on.

## Lab 2 — provider secrets, blocked pushes, and validity (10 minutes)

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

2. In the editor, replace **only** the provider placeholder with the approved
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
an alert yourself, use only the instructor-provided, nonfunctional provider test
credential in your **private disposable repository**. A randomly invented
provider-shaped string may not be detected or may report `unknown`; use the
preflighted value and never use an active credential.

1. After the prevention exercise, keep secret scanning enabled. If repository
   policy permits, temporarily turn off **repository push protection** for this
   private lab repository only. Do not change organization policy or bypass a
   blocked push. If you cannot change this setting, use the instructor's prepared
   alert or redacted screenshots.
2. Put the preflighted test credential in
   `.workshop-private/provider-secret.txt`, then commit and push it on the
   `lab/provider-push` branch. This intentionally lets scanning inspect the
   credential in the disposable repository:

   ```bash
   git add -f -- .workshop-private/provider-secret.txt
   git commit -m "Lab: scan revoked provider test credential"
   git push origin lab/provider-push
   ```

3. Open **Security → Secret scanning** and inspect the alert's type and location
   without copying or displaying the value. Check its validity state and use
   **Verify secret** if available. GitHub token checks are on by default; for
   other supported providers enable **Validity checks → Enable → Save changes**.
   Scanning and validity checks may take time, and provider/network limitations
   can result in `unknown`.
4. Restore repository push protection immediately. Remove the test credential
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
5. Explain the result: `inactive` means the provider reports that credential is
   no longer active; `unknown` is not proof that it is safe. Neither status
   proves the credential was never abused. Review exposure and access logs
   before resolving an incident. Custom tokens and generic passwords are not
   validatable just because scanning detects them.

**Checkpoint:** participant describes why revocation is urgent and why a
follow-up deletion commit does not remove a credential from earlier history.

### Instructor instructions

Before the session, preflight a revoked/nonfunctional provider test credential
in each participant repository, confirming it triggers scanning, push protection,
and the expected validity result. Never provide an active credential. Confirm
participants can change repository push protection; organization policy must
not be weakened for this exercise. Have a prepared alert or redacted screenshots
ready for unsupported providers, unavailable settings, or delayed scans.

During delivery, keep prevention and detection distinct: the blocked push
demonstrates prevention but may not create an alert; the second exercise lets
participants inspect a finding generated by scanning. Verify participants restore
push protection and remove the test credential from branch history before moving
on. Do not have them resolve the alert as a substitute for cleanup.

## Lab 3 — generic patterns versus AI-detected passwords (8 minutes)

### Participant instructions

These exercises use **synthetic, never-used values**, not account credentials.
Keep the categories distinct:

- **Generic/non-provider patterns** are recognizers for non-provider secrets
  such as supported connection strings or keys; they are not the custom-pattern
  engine and are not necessarily AI-based.
- **AI password detection** identifies potential passwords using context.
  It is not guaranteed to flag an arbitrary word or every example.

1. In your repository's security settings, locate **Generic patterns** and
   **Scan for AI-detected secrets**. Note which settings are enabled. Generic
   pattern push protection is not enabled by default: eligible organizations can
   configure it under **Advanced Security → Global settings → Additional settings
   → Secret scanning → Pattern configurations** (public preview). AI-detected
   passwords cannot be push-protected.
2. In your repository, create
   `$WORKSHOP_ROOT/labs/generic-demo.txt`. Paste the instructor's preflighted
   **synthetic connection-string example** for a currently supported generic
   pattern. Do not connect it to a real service.
3. Create `$WORKSHOP_ROOT/labs/password-demo.js` with a synthetic contextual
   password assignment. For example:

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
   is **not a guaranteed trigger**. If there is no alert within two minutes,
   use the prepared screenshots and discuss false positives/false negatives.
   No block on push is expected merely because password detection is enabled.
   If a generic example is blocked by an organization pattern configuration,
   do not bypass; inspect the rejection and use the prepared historical alert.
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

### Instructor instructions

Before delivery, enable the features where eligible and prepare a supported
synthetic connection-string example. Confirm the organization's generic-pattern
push-protection policy so you know whether a push is expected to be blocked.
Have redacted screenshots of the appropriate alert categories ready; AI password
detection is contextual and may not alert on the sample.

During delivery, explain that generic patterns and AI password detection are
separate detection paths. Timebox scans to two minutes; use the prepared
screenshots if no alert appears. Do not encourage bypassing a blocked push.

## Lab 4 — custom patterns and deterministic push protection (12 minutes)

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

#### B. Block a new occurrence

After the custom pattern is published and push protection is enabled, use a
**different** marker so the exercise is not an already-known occurrence. In a
facilitated session, wait for the instructor or repository administrator to
confirm setup is complete.

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

### Instructor instructions

Before delivery, identify a repository administrator who can create and publish
the custom pattern and enable its push protection. Confirm policy and entitlement.
If participants cannot administer their own repository, use a prepared
organization repository and let them observe the administrative steps before
trying the blocked occurrence in a participant repository where the pattern is
available.

For self-paced use, complete the pattern setup below yourself. In a facilitated
session, the instructor or repository administrator completes it after
participants seed the historical example and before they try the new occurrence.

#### Configure, dry-run, and publish the pattern

1. Under the repository's secret-scanning settings, create a **custom pattern**:

   | Field | Value |
   | --- | --- |
   | Name | `THS workshop inert token` |
   | Secret format | `THS_DEMO_[a-f0-9]{32}` |
   | Before secret / After secret | Keep the UI's default boundaries |
   | Additional match requirements | None |

   This intentionally narrow expression avoids real providers and ordinary text.
   Its 32 lowercase hex characters match both generated examples in this lab.
   The placeholders in this template do not match.
2. Run a **dry run**, select the seeded lab branch if prompted, and inspect the
   results. Confirm the location is `labs/custom-secret.txt`, not documentation.
   Dry runs may take time and do not create enforceable protection.
3. **Publish** the pattern and wait for its history scan. Inspect the resulting
   custom-pattern alert. Enable **push protection for this custom pattern**
   once it is published and eligible; merely publishing is not enough.
   If the UI requires an initial scan/dry run before enabling protection, follow
   that sequence and use a prepared pattern to stay on time.
4. Remove the seeded file in a new commit and push. The old marker remains
   in history; leave its alert open for Lab 5.

Keep the pattern narrow and use only the inert markers shown here. If propagation
or settings prevent a timely block, stop troubleshooting after confirming the
pattern is published and protection is enabled; demonstrate the prepared
rejection rather than weakening other protections.

## Lab 5 — prevent direct alert dismissals (7 minutes)

### Participant instructions

This is an **organization** exercise. Use the prepared organization repository
if a participant's personal repository does not expose this policy.

1. As a participant who is **neither an organization owner nor a security
   manager**, open the historical custom
   alert from Lab 4 (or the prepared alert). Attempt dismissal as a false positive.
   Explain that the inert training marker is not a live credential.
2. Confirm direct dismissal is prevented and a **dismissal request** with a
   reason is submitted instead. If this account can dismiss directly, verify
   that the policy applies and the account is not an organization owner/security
   manager. Repository admin status alone does not grant direct dismissal.
3. Ask an organization owner or security manager to inspect the pattern/location
   and approve or deny the request. Review the resulting status/audit trail.
   Denial leaves the alert open; unanswered requests expire after one week.
4. Contrast this with **delegated push-protection bypass**, which governs
   permission to push a detected secret, not dismissal of an existing alert.

**Checkpoint:** participants can explain who requested, who reviewed, and why
an approved dismissal neither revokes a token nor removes its historical content.

### Instructor instructions

Before the session, enable the setting in the prepared organization repository,
or apply a custom security configuration that enforces it. Confirm the reviewer
is an organization owner or security manager and the participant account has
neither role. Repository administrator status alone does not make a user an
authorized dismissal reviewer. Self-paced learners need a second authorized
reviewer; the requester cannot perform both roles. If none is available, use
the prepared screenshots and discuss the expected decision.

During delivery, have the participant submit the request first, then let the
reviewer decide and inspect the audit trail. If policy or entitlement is
unavailable, demonstrate with the prepared repository and explain that dismissal
controls and push-protection bypass are separate.

## Lab 6 — deletion is not cleanup (10 minutes)

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

### Instructor instructions

The local `/tmp` exercise is safe for participants to run independently because
it creates a fabricated repository containing only inert sample data. Before the
session, confirm `git-filter-repo` is installed and review the expected output.
Keep the hosted rewrite below optional and instructor-led; it is not required
for either self-paced completion or the timed participant lab.

### Optional instructor demonstration: hosted cleanup

Do this only in a separate, owned, disposable repository. This is **not**
required for the 60-minute participant lab and must not be run against this
template, a shared repository, or an existing Codespaces checkout.

1. Revoke/rotate first, freeze writes, notify collaborators, and record an
   access-controlled recovery plan. A recovery copy still contains the exposed
   data and must not be published. Review open PRs, tags, branches, signatures,
   renamed paths, forks, LFS, and caches.
2. Set `LAB_REPO_URL` explicitly to the approved disposable repository; do not
   guess it from the current checkout. Use a **fresh mirror clone**, outside
   the workshop root, and do not pass `--force` to bypass its safety checks:

   ```bash
   export LAB_REPO_URL="https://github.com/YOUR-OWNER/YOUR-DISPOSABLE-REPO.git"
   export CLEANUP_PARENT="$(mktemp -d /tmp/ths-hosted-cleanup.XXXXXX)"
   git clone --mirror "$LAB_REPO_URL" "$CLEANUP_PARENT/clean.git"
   cd "$CLEANUP_PARENT/clean.git"
   git filter-repo --sensitive-data-removal --invert-paths \
     --path labs/custom-secret.txt
   git log --all --oneline -- labs/custom-secret.txt
   git rev-list --objects --all | grep 'labs/custom-secret.txt'
   ```

   Add more `--path` arguments for other historical locations, including
   `.workshop-private/provider-secret.txt` if it actually landed. For keeping a
   file while replacing sensitive text, `--replace-text` is an alternative;
   store its replacement-expression file outside the repository, restrict its
   permissions, and never commit or show it. Do not assume path deletion removes
   secret text copied elsewhere or present in commit/tag messages.
3. Inspect `filter-repo/changed-refs` in the bare clone and the tool's
   first-changed-commit report. Confirm every relevant branch/tag is handled.
   Review the remote before any write; `git-filter-repo` may remove `origin`:

   ```bash
   git remote -v
   # ONLY if origin was removed:
   git remote add origin "$LAB_REPO_URL"
   ```

4. **Destructive boundary:** after ownership, scope, backup, and write-freeze
   checks, follow GitHub's documented procedure:

   ```bash
   git push --force --mirror origin
   ```

   A mirror push overwrites/deletes remote refs to match the local mirror.
   Branch/tag rules may block it; an authorized owner must coordinate any
   temporary exception and restore protections immediately. GitHub's
   `refs/pull/*` are read-only: rejection of those refs is expected, but rejection
   of writable branches/tags means cleanup is incomplete.
5. Verify using a **new clone** and the GitHub UI, not only the rewritten local
   copy. Coordinate fork owners and have collaborators re-clone; merging old
   history can reintroduce the data. Do not `git pull` the old Codespace and
   merge divergent history.
6. For genuine sensitive data that cannot be mitigated by rotation, follow
   GitHub Support's documented process for cached views/PR refs/LFS cleanup.
   Supply repository identity, affected PR count, and first changed commits,
   **not secret values**. GitHub Support does not purge inert training markers
   or other non-sensitive data.

#### Optional BFG equivalent (instructor-led, not part of the timed lab)

Use a separate fresh mirror of the same disposable repository, **not** the clone
already rewritten by `git-filter-repo`. Obtain BFG from its official project
and ensure Java is installed. Remove the sensitive file from the latest commit
on affected branches first: BFG's default blob protection can otherwise retain it.

```bash
# BFG_JAR is an absolute path to your verified official BFG JAR.
# BFG_MIRROR is an absolute path to your separate fresh disposable mirror.
java -jar "$BFG_JAR" --delete-files custom-secret.txt "$BFG_MIRROR"
cd "$BFG_MIRROR"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git log --all --oneline -- labs/custom-secret.txt
git rev-list --objects --all | grep 'custom-secret.txt'
```

BFG file deletion matches names, not the same exact-path semantics as
`git-filter-repo`: review collateral deletions. `--replace-text` is another BFG
option for an access-controlled replacement file. Do not disable blob protection
casually. Local garbage collection is **not** server-side purge; the same
coordinated hosted push, verification, fork/clone, and Support steps still apply.

## Debrief, teardown, and troubleshooting

### Instructor debrief and teardown (final three minutes)

Ask participants to state the incident-response order:
**revoke/rotate → assess exposure → remediate working tree/history as needed →
verify all copies/refs → resolve alerts with review → prevent recurrence**.

#### Participant cleanup

- [ ] Check no live credentials were used; revoke any inadvertently exposed ones.
- [ ] Restore any temporary protection exceptions; keep scanning/push protection on.
- [ ] Remove training files/patterns or delete disposable repositories according
  to organization policy; do not treat an alert dismissal as cleanup.
- [ ] Delete disposable Codespaces and temporary lab directories when finished.
- [ ] Do not reuse synthetic passwords for real accounts.

### Troubleshooting / facilitator pacing

| Symptom | Action |
| --- | --- |
| No scanning/settings UI | Check repository visibility, paid entitlement, admin role, and organization policy; use the prepared instructor repository |
| Provider placeholder not detected | Expected: replace it only with the preflighted revoked test credential, or demonstrate the prepared alert |
| Provider test credential not blocked | Check current supported push-protection patterns, context/pairs, policy, and enablement; do not substitute a live credential |
| Validity remains unknown | Verify provider support and settings; wait/recheck or use screenshots; handle it as potentially compromised |
| No generic/AI result | Check the separate settings/categories; scanning is asynchronous and AI is not deterministic; timebox to two minutes |
| Custom pattern did not block | Confirm dry run → publish → scan → enable custom-pattern push protection; use a new marker occurrence |
| Participant dismisses directly | Check policy scope and whether the participant is an authorized reviewer; test with a separate account |
| Push still blocked after deleting file | The secret is in an earlier commit; amend the one unpushed lab commit or coordinate cleanup |
| `git filter-repo` missing | Rebuild the Codespace or inspect the post-create log; check `/home/node/.local/bin` is on `PATH` |
| Cleanup refuses a non-fresh clone | In a real incident, create a fresh clone; `--force` is reserved here for the fabricated local `/tmp` exercise |
| Hosted cleanup cannot force push | Coordinate authorized repository owner/ruleset changes; restore immediately; never weaken a shared repository for this lab |
| Port 3000 in use | Stop the earlier `npm start` process; keep one app instance running |

For a large group, instructor-administer the policies and pattern publishing
while participants perform pushes in assigned repositories. Prepare the
historical custom alert beforehand as a fallback. Do not turn asynchronous
scanning delays into extra time or silently omit a requested feature.

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
