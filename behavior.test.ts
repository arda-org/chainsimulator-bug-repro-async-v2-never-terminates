import { expect, test } from "vitest";
import { FSWorld, e } from "xsuite";

const wasmCodePath = "file:output/contract.wasm";
const egldUnit = 10n ** 18n;

test("Test: Sufficient gas for async execution", async () => {
  using world = await FSWorld.start();

  const wallet = await world.createWallet({
    address: { shard: 0 },
    balance: egldUnit,
  });
  const caller = await world.createContract({
    address: { shard: 0 },
    code: wasmCodePath,
    codeMetadata: [],
  });
  const callee = await world.createContract({
    address: { shard: 1 },
    code: wasmCodePath,
    codeMetadata: [],
  });

  await wallet.callContract({
    callee: caller,
    funcName: "caller_endpoint",
    funcArgs: [e.Addr(callee), e.U64(10_000_000)],
    gasLimit: 100_000_000,
  });

  expect(await caller.getAccountKvs()).toEqual({});
  expect(await callee.getAccountKvs()).toEqual({});
});

test("Test: Insufficient gas for async execution", async () => {
  using world = await FSWorld.start();

  const wallet = await world.createWallet({
    address: { shard: 0 },
    balance: egldUnit,
  });
  const caller = await world.createContract({
    address: { shard: 0 },
    code: wasmCodePath,
    codeMetadata: [],
  });
  const callee = await world.createContract({
    address: { shard: 1 },
    code: wasmCodePath,
    codeMetadata: [],
  });

  await wallet.callContract({
    callee: caller,
    funcName: "caller_endpoint",
    funcArgs: [e.Addr(callee), e.U64(1_000_000)],
    gasLimit: 100_000_000,
  });

  expect(await caller.getAccountKvs()).toEqual({});
  expect(await callee.getAccountKvs()).toEqual({});
});
