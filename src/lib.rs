#![no_std]

multiversx_sc::imports!();

pub mod self_proxy;

#[multiversx_sc::contract]
pub trait Contract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint]
    fn caller_endpoint(&self, callee: ManagedAddress, gas: u64) {
        self.tx()
            .to(callee)
            .gas(gas)
            .typed(self_proxy::SelfProxy)
            .callee_endpoint()
            .callback(self.callbacks().caller_callback())
            .register_promise();
    }

    #[promises_callback]
    fn caller_callback(&self) {}

    #[endpoint]
    fn callee_endpoint(&self) {}
}
