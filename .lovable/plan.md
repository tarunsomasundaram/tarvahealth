## 1. Remove the three features

These were only mentioned in the brainstorm reply — **none of them were ever implemented**. I checked the codebase:

- **Photo proof of dose** — no camera capture, no photo field on dose logs.
- **Symptom & side-effect journal** — no symptom check-in UI or table.
- **Drug interaction checker** — no interaction checks in `AddMedication.tsx` or anywhere else.

So there is nothing to delete for these. No code changes for this part.

## 2. Fix the alarm restarting after Snooze / Mark Taken

### Root cause

`src/hooks/use-alarm.ts` keeps a `checkedTimesRef` set of `medicationId_scheduledTime` keys so an already-fired alarm never re-triggers. That set is only populated inside `checkForDueAlarms` — **not** inside `triggerAlarm`.

Meanwhile `src/pages/Home.tsx` runs `checkForDueAlarms(upcomingDoses)` on a 10-second interval. After the user hits Snooze or Mark Taken on the alarm overlay:

- Snooze → `handleAlarmSnooze` only dismisses the alarm and opens the SnoozeSheet. The dose status stays `pending` until the user picks a duration. 10s later the interval sees it as still due and, because the key was never recorded, re-triggers the alarm.
- Mark Taken → `handleMarkTaken` is async (offline queue + cloud `logDose`). Until it resolves, the dose is still `pending`. Same retrigger path.
- Test Alarm button → calls `triggerAlarm` directly with `upcomingDoses[0]`, also never recording the key, so the same dose immediately re-arms.

### Fix

Edit `src/hooks/use-alarm.ts`:

1. In `triggerAlarm`, compute the same key (`${dose.medicationId}_${dose.scheduledTime.toISOString()}`) and add it to `checkedTimesRef.current` so any path that fires the alarm marks it as handled.
2. Guard `triggerAlarm` against double-start: if `isAlarmActive` (or an internal ref) is already true, call `stopSound()` / `stopVibration()` first before starting new ones, so we never leak a second AudioContext.
3. Also fix the unrelated runtime error `Failed to execute 'only' on 'IDBKeyRange'` in `src/lib/offlineDoseQueue.ts` `hasLocalAction` — `IDBKeyRange.only(medicationId)` is fine for strings, but the index `medication_id` may receive `undefined` during catch-up before data is ready. Add an early-return when `medicationId` is falsy.

### Files touched

- `src/hooks/use-alarm.ts` — register dose key on `triggerAlarm`; idempotent start.
- `src/lib/offlineDoseQueue.ts` — guard `hasLocalAction` against invalid keys.

No UI, schema, or business-logic changes beyond these.
