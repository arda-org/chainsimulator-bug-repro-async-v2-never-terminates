import { expect, test } from "vitest";
import { FSWorld, e } from "xsuite";

const egldUnit = 10n ** 18n;
const callerWasmCodePath = "caller/output/caller.wasm"
const calleeWasmCodePath = "callee/output/callee.wasm";

for (let i = 1; i < 6; i++) {
  for (let j = 1; j < 6; j++) {
    test(`Test: ${i} caller and ${j} callee`, async () => {
      using world = await FSWorld.start();

      const wallet = await world.createWallet({
        address: { shard: 0 },
        balance: egldUnit,
      });
      const callers = await world.createContracts(Array.from({ length: i }, () => ({
        address: { shard: 0 },
        code: `file:${callerWasmCodePath}`,
        codeMetadata: [],
      })))
      const callees = await world.createContracts(Array.from({ length: j }, () => ({
        address: { shard: 1 },
        code: `file:${calleeWasmCodePath}`,
        codeMetadata: [],
      })))

      await wallet.callContract({
        callee: callers[0],
        funcName: "x",
        funcArgs: [e.List(...callers.map(v => e.Addr(v))), e.List(...callees.map(v => e.Addr(v)))],
        gasLimit: 100_000_000,
      });

      for (const caller of callers) {
        expect(await caller.getAccountKvs()).toEqual({})
      }
      for (const callee of callees) {
        expect(await callee.getAccountKvs()).toEqual({})
      }
    });
  }
}