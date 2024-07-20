#![no_std]

multiversx_sc::imports!();

pub mod callee_proxy;
pub mod self_proxy;

#[multiversx_sc::contract]
pub trait Contract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint]
    fn x(
        &self,
        callers: ManagedVec<Self::Api, ManagedAddress>,
        callees: ManagedVec<Self::Api, ManagedAddress>,
    ) {
        let mut call_id: u64 = 1;

        for callee in &callees {
            self.tx()
                .to(callee.clone())
                .gas(10_000_000)
                .typed(callee_proxy::CalleeProxy)
                .iterate_on_callees(call_id.clone(), callees.clone())
                .callback(
                    self.callbacks()
                        .iterate_on_callers(call_id, callers.clone()),
                )
                .register_promise();

            call_id += 1u64;
        }
    }

    #[promises_callback]
    fn iterate_on_callers(&self, call_id: u64, callers: ManagedVec<Self::Api, ManagedAddress>) {
        for caller in callers.into_iter() {
            self.tx()
                .to(&caller)
                .gas(10_000_000)
                .typed(self_proxy::CallerProxy)
                .caller_iteration_event(call_id)
                .sync_call_same_context();
        }
    }

    #[endpoint]
    fn caller_iteration_event(&self, call_id: u64) {
        let caller = self.blockchain().get_caller();
        let callee = self.blockchain().get_sc_address();
        self.caller_iteration(&caller, &callee, call_id);
    }

    #[event("caller_iteration")]
    fn caller_iteration(
        &self,
        #[indexed] caller: &ManagedAddress,
        #[indexed] callee: &ManagedAddress,
        call_id: u64,
    );
}
