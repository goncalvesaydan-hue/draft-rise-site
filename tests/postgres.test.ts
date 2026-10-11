import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { makeSnapshot } from "../src/lib/portal/questionnaire";
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
const team = "00000000-0000-4000-8000-000000000003";
test("PostgreSQL: RLS, restricted RPC, revisions, atomic submission and immutability", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth,public to authenticated,anon,service_role;
      grant select on auth.users to service_role;
      insert into auth.users values('${a}'),('${b}'),('${team}');`);
    await db.exec(
      readFileSync("supabase/migrations/202610110001_portal.sql", "utf8"),
    );
    await db.query("insert into portal_team values($1)", [team]);
    for (const id of [a, b])
      await db.query("select portal_open($1,$2,$3)", [
        id,
        "1.0.0",
        "fake@example.test",
      ]);
    await db.query("select portal_open($1,$2,$3)", [
      a,
      "1.0.0",
      "fake@example.test",
    ]);
    const rows = await db.query<{ id: string; owner: string }>(
      "select id,owner from portal_intakes",
    );
    assert.equal(
      rows.rows.length,
      2,
      "repeated access must not duplicate intake",
    );
    const ia = rows.rows.find((r) => r.owner === a)!.id,
      ib = rows.rows.find((r) => r.owner === b)!.id;
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [a]);
    assert.equal(
      (await db.query("select * from portal_intakes")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from portal_intakes where id=$1", [ib])).rows
        .length,
      0,
    );
    await assert.rejects(
      () => db.query("select portal_save($1,$2,0,$3)", [a, ia, "{}"]),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query("update portal_intakes set answers='{}'"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query("insert into portal_team values($1)", [a]),
      /permission denied/,
    );
    await db.exec("reset role; set role anon");
    await assert.rejects(
      () => db.query("select * from portal_intakes"),
      /permission denied/,
    );
    await db.exec("reset role; set role service_role");
    await assert.rejects(
      () => db.query("select portal_save($1,$2,0,$3)", [a, ib, "{}"]),
      /portal_not_found/,
    );
    await db.query("select portal_save($1,$2,0,$3)", [a, ia, "{}"]);
    await assert.rejects(
      () => db.query("select portal_save($1,$2,0,$3)", [a, ia, "{}"]),
      /portal_conflict/,
    );
    const key = "10000000-0000-4000-8000-000000000001";
    const snapshot = JSON.stringify(makeSnapshot({}));
    // App validates required fields before service-role RPC; SQL checks permissions, revision and atomicity.
    await db.exec("reset role");
    await db.exec(`create function fail_outbox() returns trigger language plpgsql as $$begin raise exception 'injected failure'; end;$$;
      create trigger fail_outbox before insert on portal_outbox for each row execute function fail_outbox();`);
    await db.exec("set role service_role");
    await assert.rejects(
      () =>
        db.query("select portal_submit($1,$2,1,$3,$4)", [a, ia, key, snapshot]),
      /injected failure/,
    );
    assert.equal(
      (await db.query("select * from portal_submissions")).rows.length,
      0,
    );
    assert.equal((await db.query("select * from portal_audit")).rows.length, 0);
    assert.equal(
      (
        await db.query<{ status: string }>(
          "select status from portal_intakes where id=$1",
          [ia],
        )
      ).rows[0].status,
      "draft",
    );
    await db.exec(
      "reset role; drop trigger fail_outbox on portal_outbox; set role service_role",
    );
    const first = await db.query("select portal_submit($1,$2,1,$3,$4) as s", [
      a,
      ia,
      key,
      snapshot,
    ]);
    const retry = await db.query("select portal_submit($1,$2,1,$3,$4) as s", [
      a,
      ia,
      key,
      snapshot,
    ]);
    assert.deepEqual(retry.rows, first.rows);
    assert.equal(
      (await db.query("select * from portal_outbox")).rows.length,
      2,
    );
    await assert.rejects(
      () =>
        db.query("select portal_submit($1,$2,1,$3,$4)", [
          a,
          ia,
          "10000000-0000-4000-8000-000000000002",
          snapshot,
        ]),
      /portal_conflict/,
    );
    await assert.rejects(
      () => db.query("update portal_submissions set snapshot='{}'"),
      /immutable/,
    );
    await assert.rejects(
      () => db.query("delete from portal_submissions"),
      /immutable/,
    );
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [b]);
    assert.equal(
      (await db.query("select * from portal_submissions")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from portal_outbox")).rows.length,
      0,
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      team,
    ]);
    assert.equal(
      (await db.query("select * from portal_submissions")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from portal_intakes")).rows.length,
      2,
    );
    assert.equal(
      (await db.query("select * from portal_outbox")).rows.length,
      2,
    );
  } finally {
    await db.close();
  }
});
