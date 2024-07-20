import { expect, test } from "vitest";
import { FSWorld, e } from "xsuite";

const egldUnit = 10n ** 18n;

for (let j = 6; j < 8; j++) {
  test(`Test: ${j} callees`, async () => {
    using world = await FSWorld.start();

    const wallet = await world.createWallet({
      address: { shard: 0 },
      balance: egldUnit,
    });
    const caller = await world.createContract({
      address: { shard: 0 },
      code: `file:caller/output/caller.wasm`,
      codeMetadata: [],
    });
    const callees = await world.createContracts(Array.from({ length: j }, () => ({
      address: { shard: 1 },
      code: `file:callee/output/callee.wasm`,
      codeMetadata: [],
    })))

    await wallet.callContract({
      callee: caller,
      funcName: "x",
      funcArgs: [e.List(caller), e.List(...callees)],
      gasLimit: 300_000_000,
    });

    expect(await caller.getAccountKvs()).toEqual({});
    for (const callee of callees) {
      expect(await callee.getAccountKvs()).toEqual({})
    }
  });
}
