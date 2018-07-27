import DialogStore from "./Dialog";
import NetworkStore from "./Network";
import ProfileStore from "./Profile";
import SystemStore from "./System";
import TransactionsStore from "./Transactions";
import ContentStore from "./Content";

class RootStore {
  constructor() {
    this.dialog = new DialogStore(this);
    this.network = new NetworkStore(this);
    this.profile = new ProfileStore(this);
    this.system = new SystemStore(this);
    this.transactions = new TransactionsStore(this);
    this.content = new ContentStore(this);
  }
}

const store = new RootStore();
export default store;
