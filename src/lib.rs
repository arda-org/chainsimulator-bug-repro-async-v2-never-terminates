#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub trait Contract {
    #[init]
    fn init(&self) {}

    #[endpoint]
    fn caller_endpoint_async_v2(&self, callee: ManagedAddress, gas: u64) {
        self.tx()
            .to(callee)
            .gas(gas)
            .raw_call("nonExistentEndpoint")
            .register_promise();
    }

    #[endpoint]
    fn caller_endpoint_async_v1(&self, callee: ManagedAddress) {
        self.tx()
            .to(callee)
            .raw_call("nonExistentEndpoint")
            .async_call_and_exit();
    }
}
