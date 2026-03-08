#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DEFAULT_COLLECTION = "big2LeaderboardPlayers";
const BATCH_SIZE = 400;

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 1) {
    const raw = rest[i];
    if (!raw.startsWith("--")) {
      throw new Error(`Unexpected argument: ${raw}`);
    }
    const key = raw.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    i += 1;
  }
  return { command, options };
}

function toAbs(p) {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function encodeSpecial(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(encodeSpecial);

  if (typeof value === "object") {
    if (typeof value.toDate === "function" && typeof value.toMillis === "function") {
      return { __type: "timestamp", ms: value.toMillis() };
    }
    if (value instanceof Date) return { __type: "date", ms: value.getTime() };
    if (
      Object.prototype.hasOwnProperty.call(value, "latitude") &&
      Object.prototype.hasOwnProperty.call(value, "longitude")
    ) {
      return { __type: "geopoint", latitude: value.latitude, longitude: value.longitude };
    }
    if (typeof value.path === "string" && typeof value.id === "string") {
      return { __type: "docref", path: value.path };
    }

    const out = {};
    Object.entries(value).forEach(([k, v]) => {
      out[k] = encodeSpecial(v);
    });
    return out;
  }

  if (typeof value === "bigint") {
    throw new Error("BigInt is not supported for Firestore JSON export.");
  }
  return value;
}

function decodeSpecial(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(decodeSpecial);
  if (typeof value !== "object") return value;

  if (value.__type === "timestamp" || value.__type === "date") return new Date(value.ms);
  if (value.__type === "geopoint") {
    return { latitude: value.latitude, longitude: value.longitude };
  }
  if (value.__type === "docref") return value.path;

  const out = {};
  Object.entries(value).forEach(([k, v]) => {
    out[k] = decodeSpecial(v);
  });
  return out;
}

async function createFirestoreFromServiceAccount(serviceAccountPath, appName) {
  const serviceAccount = await readJson(serviceAccountPath);
  const app = initializeApp(
    {
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id
    },
    appName
  );
  return {
    db: getFirestore(app),
    projectId: serviceAccount.project_id
  };
}

async function exportCollection({ sourceKey, collection, outFile }) {
  const { db, projectId } = await createFirestoreFromServiceAccount(sourceKey, "source-app");
  const snapshot = await db.collection(collection).get();
  const docs = snapshot.docs.map((doc) => ({
    id: doc.id,
    data: encodeSpecial(doc.data())
  }));

  const payload = {
    meta: {
      exportedAt: new Date().toISOString(),
      sourceProjectId: projectId,
      collection,
      count: docs.length
    },
    docs
  };
  await writeJson(outFile, payload);
  return payload.meta;
}

async function importCollection({ targetKey, collection, inFile }) {
  const payload = await readJson(inFile);
  if (!payload || !Array.isArray(payload.docs)) {
    throw new Error("Invalid input JSON. Expected top-level 'docs' array.");
  }

  const { db, projectId } = await createFirestoreFromServiceAccount(targetKey, "target-app");
  let imported = 0;
  for (let i = 0; i < payload.docs.length; i += BATCH_SIZE) {
    const slice = payload.docs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    slice.forEach((doc) => {
      const ref = db.collection(collection).doc(String(doc.id));
      batch.set(ref, decodeSpecial(doc.data), { merge: false });
    });
    await batch.commit();
    imported += slice.length;
  }

  return {
    imported,
    targetProjectId: projectId,
    collection
  };
}

async function cloneCollection({ sourceKey, targetKey, collection, tempFile }) {
  const exportMeta = await exportCollection({
    sourceKey,
    collection,
    outFile: tempFile
  });
  const importMeta = await importCollection({
    targetKey,
    collection,
    inFile: tempFile
  });
  return { exportMeta, importMeta };
}

function printUsage() {
  console.log(`
Firestore migration helper

Commands:
  export --source-key <path> [--collection <name>] --out <path>
  import --target-key <path> [--collection <name>] --in <path>
  clone  --source-key <path> --target-key <path> [--collection <name>] [--temp <path>]

Examples:
  npm run migrate:firestore -- export --source-key ./.secrets/seedservices-sa.json --out ./tmp/seedservices-lb.json
  npm run migrate:firestore -- import --target-key ./.secrets/four-leaf-x-sa.json --in ./tmp/seedservices-lb.json
  npm run migrate:firestore -- clone --source-key ./.secrets/seedservices-sa.json --target-key ./.secrets/four-leaf-x-sa.json
`);
}

function requireOption(options, key) {
  const v = options[key];
  if (!v || v === true) throw new Error(`Missing required option --${key}`);
  return String(v);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === "help" || command === "--help") {
    printUsage();
    return;
  }

  if (command === "export") {
    const sourceKey = toAbs(requireOption(options, "source-key"));
    const outFile = toAbs(requireOption(options, "out"));
    const collection = String(options.collection ?? DEFAULT_COLLECTION);
    const meta = await exportCollection({ sourceKey, collection, outFile });
    console.log(
      `Exported ${meta.count} docs from ${meta.sourceProjectId}/${meta.collection} -> ${outFile}`
    );
    return;
  }

  if (command === "import") {
    const targetKey = toAbs(requireOption(options, "target-key"));
    const inFile = toAbs(requireOption(options, "in"));
    const collection = String(options.collection ?? DEFAULT_COLLECTION);
    const meta = await importCollection({ targetKey, collection, inFile });
    console.log(
      `Imported ${meta.imported} docs into ${meta.targetProjectId}/${meta.collection} from ${inFile}`
    );
    return;
  }

  if (command === "clone") {
    const sourceKey = toAbs(requireOption(options, "source-key"));
    const targetKey = toAbs(requireOption(options, "target-key"));
    const collection = String(options.collection ?? DEFAULT_COLLECTION);
    const tempFile = toAbs(
      String(options.temp ?? `./tmp/firestore-migration-${collection}.json`)
    );
    const meta = await cloneCollection({ sourceKey, targetKey, collection, tempFile });
    console.log(
      `Cloned ${meta.exportMeta.count} docs from ${meta.exportMeta.sourceProjectId}/${collection} to ${meta.importMeta.targetProjectId}/${collection}`
    );
    console.log(`Temporary export file: ${tempFile}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
