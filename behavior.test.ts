import { expect, test } from "vitest";
import { FSWorld, e } from "xsuite";

const wasmCodePath = "file:output/contract.wasm";
const egldUnit = 10n ** 18n;

test("Test: Make async v2 execution fail by calling a non-existent endpoint on the callee", async () => {
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
    funcName: "caller_endpoint_async_v2",
    funcArgs: [e.Addr(callee), e.U64(10_000_000)],
    gasLimit: 100_000_000,
  }); // Should fail as the async v2 execution has failed. Currently, it does not fail.

  // A closure is stored in the caller's storage as the async v2 execution has failed.
  expect(await caller.getAccountKvs()).toEqual({
    "454c524f4e44564d404153594e43deb963905a63eba86d6d8e7169016f3fc87ce24223cbc6a667d0e2c1212bf0b2":
      "0a2000000000000000000500000000020000000000000000000000000000000000001220deb963905a63eba86d6d8e7169016f3fc87ce24223cbc6a667d0e2c1212bf0b2222001000000010000000000000000000000000000000000000000000000000000002a20010000000100000000000000000000000000000000000000000000000000000062622a600a20ec253581719ab36de89658af62dd8b171fb458c656a5ee55b5f0a9ef87dbb0d418042a20000000000000000005000000000300000000000000000000000000000000000132136e6f6e4578697374656e74456e64706f696e743880ade20468017001",
  });
});

test("Test: Make async v1 execution fail by calling a non-existent endpoint on the callee", async () => {
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
    funcName: "caller_endpoint_async_v1",
    funcArgs: [e.Addr(callee)],
    gasLimit: 100_000_000,
  }); // Should fail as the async v1 execution has failed. Currently, it does not fail.

  // A closure is stored in the caller's storage as the async v1 execution has failed
  expect(await caller.getAccountKvs()).toEqual({
    "454c524f4e44564d404153594e43bf28ae5201a6dca77ea60502655ea37d261803b4f4ac64de53bb7ef8e490df3b":
      "0a2000000000000000000500000000050000000000000000000000000000000000001220bf28ae5201a6dca77ea60502655ea37d261803b4f4ac64de53bb7ef8e490df3b222001000000040000000000000000000000000000000000000000000000000000002a200100000004000000000000000000000000000000000000000000000000000000628801220b4c65676163794173796e632a790a204cfaba7296ebdd57f475352063365d6fb37cf48832f9330bc86003c35aae43dc18042a20000000000000000005000000000600000000000000000000000000000000000132136e6f6e4578697374656e74456e64706f696e7438a48cf82c40a0a08202520863616c6c4261636b5a0863616c6c4261636b68017001",
  });
});
