import * as Alchemy from "alchemy";

// Mirrors outputs of the `dekin-infrastructure` stack in the
// Dekin-Ydays/infrastructure repo; keep both in sync.
export class Infrastructure extends Alchemy.Stack<
  Infrastructure,
  { frontendWorkerName: string; frontendOrigin: string }
>()("dekin-infrastructure") {}
