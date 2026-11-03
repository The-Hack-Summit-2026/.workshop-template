# Instructor Guide: Secret Protection Workshop

An instructor-led hands-on workshop for GitHub Advanced Security (GHAS),
focusing on **GitHub Secret Protection**: secret scanning, validity checks,
generic patterns, AI-detected passwords, push protection, custom patterns,
controlled alert dismissal, and Git history cleanup.

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

## Before the session

### Instructor checklist

- [ ] Create disposable repositories and test the exercises using the same
  organization policies and participant permissions as the workshop.
- [ ] Confirm participants are eligible for Codespaces and quota is available,
  and that the workshop repositories/devcontainer are ready. Participants
  create their Codespaces at the start of the workshop; reserve the opening
  block for setup and use a prepared fallback if startup exceeds the slot.
- [ ] Enable **GitHub Advanced Security** first, then **Secret Protection**
  (which turns on secret scanning), then repository push protection under
  **Settings → Advanced Security**, in the
  **Security and quality** sidebar section (older interfaces use **Code security
  and analysis**).
  Ensure organization policy permits the required settings.
- [ ] Confirm entitlement: secret scanning is available on public repositories.
  Private/internal organization repositories require an appropriate paid plan
  and **GitHub Secret Protection** access. Do not assume an individual private
  repository has the full feature set.
- [ ] Enable validity checks, non-provider/generic patterns, and AI password
  detection where available. Check the feature table below.
- [ ] Prepare the disposable, minimal-scope, short-lived GitHub personal access
  token you will use for the live validity demonstration. Preflight that it
  triggers scanning and push protection and reports `active`, and plan to
  **revoke it during the detection exercise**. Use private disposable
  repositories; never use a real, shared, or long-lived credential. Recognizable
  prefixes alone do not guarantee detection.
- [ ] Have redacted active/inactive/unknown validity examples ready for providers
  or plans that do not support participant verification. Participants must not
  create or commit their own live tokens; only the instructor-provided demo token
  is used, and the instructor revokes it during the exercise.
- [ ] Identify the custom-pattern administrator, an organization owner or security
  manager for dismissal review, and a participant account without either role.
- [ ] Prepare screenshots of features unavailable on the participants' plan and
  of delayed scans. Do not spend the session waiting for asynchronous results.
- [ ] Preflight the Lab 4 custom-pattern alert and a force-with-lease update of
  the dedicated `lab/custom-pattern` branch in each isolated participant repo,
  or prepare an instructor-controlled disposable fallback. Never relax rules
  on the workshop template or a shared/production repository.

### Feature and permission map

Availability, preview status, UI labels, and organization policies can change.
Check the linked documentation and rehearse immediately before delivery.

| Feature | Exercise / required access | Important limitation |
| --- | --- | --- |
| Provider secret scanning | Participant views **Security → Secret scanning**; repository admin enables scanning | Placeholders are not provider test credentials; supported patterns may require additional context or pairs of values |
| Validity checks | Admin enables checks; participant inspects an alert's validity | GitHub token checks are on by default; other supported providers require enablement; `unknown` is not safe |
| Generic/non-provider patterns | Admin enables **Generic patterns**; participant views its alert category | No validity checks; optional push protection is configured separately at organization/enterprise level (public preview) |
| AI-detected passwords | Enable **AI-detected secrets** in an eligible organization repository | Context-dependent; no Copilot subscription required; passwords support neither push protection nor validity checks |
| Repository push protection | Admin enables it; participant attempts an authenticated push | Only supported push-protection patterns; user-level public push protection is a different setting |
| Custom patterns | Repository/organization admin or authorized security manager creates, dry-runs, and publishes a pattern | A dry run is not enforcement; enable its push protection separately after validation |
| Prevent direct alert dismissals | Admin enables the repository setting, or an organization applies a custom security configuration; participant requests dismissal | Organization owners/security managers review; distinct from delegated **push-protection bypass** |
| History cleanup | Anyone can do the local inert exercise; hosted rewrite requires repository owner coordination | Cleanup is not revocation and cannot purge third-party clones, forks, or GitHub PR refs by itself |

If an organization-only feature is unavailable, the instructor demonstrates it
in the prepared organization repository; participants observe and explain the
expected outcome. Public personal repositories are useful for the core labs,
but do not guarantee every organization feature.

## Agenda

| Guided activity | Evidence / checkpoint |
| --- | --- |
| Threat model, participant setup, and Lab 1: orient and inspect | Explain scanning vs prevention vs revocation vs cleanup; Codespace and app are ready; correct repository settings are enabled |
| Lab 2: provider scanning, push protection, validity | Blocked push; participant inspects their own alert and validity state |
| Lab 3: generic patterns and AI passwords | Distinguish the two detection paths and their limitations |
| Lab 4: custom pattern | Dry run, publish, and an inert marker blocked by push protection |
| Lab 5: prevent direct dismissal | Non-reviewer requests dismissal; reviewer decides |
| Lab 6: cleanup with `git-filter-repo` | Rewrite and verify the remote lab branch; close its test alert after review |
| Debrief and teardown | Revoke first, verify cleanup, restore protections, delete labs |

Use the companion [Participant Guide](PARTICIPANT-GUIDE.md) for learner steps
and checkpoints. Prepare repositories, permissions, examples, and fallbacks in
advance, then have participants perform the hands-on steps. Pair participants
for organization administration/reviewer roles. Keep instructor-side repository
provisioning and any active-token demonstration separate from participant
activities.
Participants create their Codespaces and complete Lab 1 setup in the opening
block; do not assume they have repository access beforehand.

## Lab 1 — orient and inspect

Participant exercise: Follow the corresponding lab in the Participant Guide.

### Instructor instructions

Before the session, prepare disposable repositories and confirm they will be
available to participants when access is granted. At the start of the session,
guide participants through opening their repositories, creating Codespaces,
and following the setup steps in the Participant Guide. Ensure the repository
settings are enabled, or identify the prepared organization repository to use
when a participant plan or role does not expose them. Ask participants to
describe the difference between secret scanning and code/dependency scanning
before moving on.

## Lab 2 — provider secrets, blocked pushes, and validity

Participant exercise: Follow the corresponding lab in the Participant Guide.

### Instructor instructions

Before the session, prepare a disposable, minimal-scope, short-lived GitHub
personal access token for the live validity demonstration, and confirm it
triggers scanning, push protection, and an `active` validity result. You will
**revoke this token during the detection exercise** so participants see the
status change to `inactive`/`unknown`; never use a real, shared, or long-lived
credential. Confirm participants can change repository push protection;
organization policy must not be weakened for this exercise. Have a prepared alert
or redacted screenshots ready for unsupported providers, unavailable settings, or
delayed scans.

During delivery, keep prevention and detection distinct: the blocked push
demonstrates prevention but may not create an alert; the second exercise lets
participants inspect a finding generated by scanning. Have participants
**Verify secret** while the token is still active, then revoke the token
(**Settings → Developer settings → Personal access tokens → Delete**) and have
them verify again to watch the validity transition. Verify participants restore
push protection and remove the test credential from branch history before moving
on. Do not have them resolve the alert as a substitute for cleanup.

## Lab 3 — generic patterns versus AI-detected passwords

Participant exercise: Follow the corresponding lab in the Participant Guide.

### Instructor instructions

Before delivery, enable the features where eligible and prepare a supported
synthetic connection-string example. Confirm the organization's generic-pattern
push-protection policy so you know whether a push is expected to be blocked.
Have redacted screenshots of the appropriate alert categories ready; AI password
detection is contextual and may not alert on the sample.

During delivery, explain that generic patterns and AI password detection are
separate detection paths. Use the prepared screenshots if no alert appears.
Do not encourage bypassing a blocked push.
If the participant's push succeeds, have them remove the examples in a normal
follow-up commit, then use `git show HEAD~1:labs/password-demo.js` and revisit
the alert to show that deletion from the current version does not erase the
historical commit or automatically resolve the alert. If the push is rejected,
explain that the rejected commit never reached GitHub and use a prepared example
for this history demonstration.

## Lab 4 — custom patterns and deterministic push protection

Participant exercise: Follow the corresponding lab in the Participant Guide.

### Instructor instructions

Before delivery, identify a repository administrator who can create and publish
the custom pattern and enable its push protection. Confirm policy and entitlement.
If participants cannot administer their own repository, use a prepared
organization repository and let them observe the administrative steps before
trying the blocked occurrence in a participant repository where the pattern is
available.

In a facilitated session, complete this setup after participants seed the
historical example and before they try the new occurrence. Self-paced learners
can follow these steps in their own repository if they have repository
administrator permissions.

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

## Lab 5 — prevent direct alert dismissals

Participant exercise: Follow the corresponding lab in the Participant Guide.

### Instructor instructions

Before the session, open the prepared repository's **Settings → Code security**
and check **Prevent direct alert dismissals**. If it is **Off**, enable it. If
the setting is managed by an organization security configuration, have an
organization owner enable it in that configuration instead. Confirm the
reviewer is an organization owner or security manager and the participant
account has neither role. Repository administrator status alone does not make a
user an authorized dismissal reviewer. Self-paced learners need a second
authorized reviewer; the requester cannot perform both roles. If none is
available, use the prepared screenshots and discuss the expected decision.

The participant may see the standard **Close alert** dialog, not a separately
labeled request button. Have them proceed only after you verify the policy is
active and enforced for that repository; confirm the alert remains open and the
dismissal request is pending. If the policy or entitlement is unavailable, do
not have them submit the close action. Demonstrate with the prepared repository
and explain that dismissal controls and push-protection bypass are separate.

## Lab 6 — deletion is not cleanup

Participant exercise: Follow the corresponding lab in the Participant Guide.

### Instructor instructions

The participant exercise rewrites only the dedicated `lab/custom-pattern`
branch in each participant's disposable repository, using the inert marker
seeded in Lab 4. It runs in place in the participant's Codespace checkout with
`git filter-repo --force --no-fetch --refs refs/heads/lab/custom-pattern`, so
no separate cleanup clone is needed; only verification uses a fresh clone. Before the session, confirm `git-filter-repo` is installed,
preflight the branch rewrite and force-with-lease push with participant-level
permissions, and verify the custom-pattern alert is open. If a participant
cannot safely rewrite that branch, use the instructor-prepared disposable
repository for the demonstration; never redirect them to a shared repository.

After the rewritten branch is verified from a fresh clone and GitHub's scan has
finished, have participants review and manually close the test alert as **Used
in tests**. GitHub does not automatically close secret-scanning alerts when
history is rewritten. The alert should disappear from the open-alert list after
it is closed. Make clear that alert closure does not revoke a real secret.

### Optional instructor demonstration: cleanup of genuine exposed data

Do this only in a separate, owned, disposable repository. This is optional and
must not be run against this template, a shared repository, or an existing
Codespaces checkout.

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

#### Optional BFG equivalent (instructor-led)

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

### Instructor debrief and teardown

Ask participants to state the incident-response order:
**revoke/rotate → assess exposure → remediate working tree/history as needed →
verify all copies/refs → resolve alerts with review → prevent recurrence**.



### Troubleshooting / facilitator pacing

| Symptom | Action |
| --- | --- |
| No scanning/settings UI | Check repository visibility, paid entitlement, admin role, and organization policy; use the prepared instructor repository |
| Provider placeholder not detected | Expected: replace it only with the preflighted revoked test credential, or demonstrate the prepared alert |
| Provider test credential not blocked | Check current supported push-protection patterns, context/pairs, policy, and enablement; do not substitute a live credential |
| Validity remains unknown | Verify provider support and settings; wait/recheck or use screenshots; handle it as potentially compromised |
| No generic/AI result | Check the separate settings/categories; scanning is asynchronous and AI is not deterministic; use the prepared screenshots |
| Custom pattern did not block | Confirm dry run → publish → scan → enable custom-pattern push protection; use a new marker occurrence |
| Participant dismisses directly | Check policy scope and whether the participant is an authorized reviewer; test with a separate account |
| Push still blocked after deleting file | The secret is in an earlier commit; amend the one unpushed lab commit or coordinate cleanup |
| `git filter-repo` missing | Rebuild the Codespace or inspect the post-create log; check `/home/node/.local/bin` is on `PATH` |
| Cleanup refuses a non-fresh clone | In the participant lab, confirm the command includes `--force` together with `--refs refs/heads/lab/custom-pattern` and `--no-fetch`, run from the disposable Codespace checkout; never use `--force` without `--refs`. For the instructor demonstration, use a fresh mirror clone instead |
| Lab 6 prints `STOP` | The local `lab/custom-pattern` differs from `origin`, so nothing was rewritten or pushed. Inspect with `git log --oneline origin/lab/custom-pattern..HEAD` and the reverse range; once nothing local is needed, run `git reset --hard origin/lab/custom-pattern` and restart Lab 6 section A |
| Lease push rejected in Lab 6 | The remote `lab/custom-pattern` changed since `ORIGINAL_TIP` was recorded; re-fetch, inspect the difference, and restart Lab 6 section A |
| Lab 6 cannot force-push its branch | Use the instructor-prepared disposable repository; never weaken protections on a shared repository |
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
