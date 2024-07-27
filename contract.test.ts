import { expect, test } from "vitest";
import { FSWorld, e } from "xsuite";

test("shard 0 -> shard 0 -> shard 1 - async v2 (fails)", async () => {
  using world = await FSWorld.start();

  const wallet = await world.createWallet({
    address: { shard: 0 },
    balance: 10n ** 18n,
  });
  const caller = await world.createContract({
    address: { shard: 0 },
    code: "file:output/contract.wasm",
    codeMetadata: [],
  });
  const callee = await world.createContract({
    address: { shard: 1 },
    code: "file:output/contract.wasm",
    codeMetadata: [],
  });

  await wallet.callContract({
    callee: caller,
    funcName: "call_callee_async_v2",
    funcArgs: [callee, e.U64(10_000_000)],
    gasLimit: 100_000_000,
  });
  await world.generateBlocks(20);

  expect(await caller.getAccountKvs()).toEqual({});
});

test("shard 0 -> shard 0 -> shard 1 - async v1 (succeeds)", async () => {
  using world = await FSWorld.start();

  const wallet = await world.createWallet({
    address: { shard: 0 },
    balance: 10n ** 18n,
  });
  const caller = await world.createContract({
    address: { shard: 0 },
    code: "file:output/contract.wasm",
    codeMetadata: [],
  });
  const callee = await world.createContract({
    address: { shard: 1 },
    code: "file:output/contract.wasm",
    codeMetadata: [],
  });

  await wallet.callContract({
    callee: caller,
    funcName: "call_callee_async_v1",
    funcArgs: [callee],
    gasLimit: 100_000_000,
  });
  await world.generateBlocks(20);

  expect(await caller.getAccountKvs()).toEqual({});
});
