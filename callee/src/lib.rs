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
    fn iterate_on_callees(&self, call_id: u64, callees: ManagedVec<Self::Api, ManagedAddress>) {
        for callee in callees.into_iter() {
            self.tx()
                .to(&callee)
                .gas(10_000_000)
                .typed(self_proxy::CalleeProxy)
                .callee_iteration_event(call_id)
                .sync_call_same_context();
        }
    }

    #[endpoint]
    fn callee_iteration_event(&self, call_id: u64) {
        let caller = self.blockchain().get_caller();
        let callee = self.blockchain().get_sc_address();
        self.callee_iteration(&caller, &callee, call_id);
    }

    #[event("callee_iteration")]
    fn callee_iteration(
        &self,
        #[indexed] caller: &ManagedAddress,
        #[indexed] callee: &ManagedAddress,
        call_id: u64,
    );
}
