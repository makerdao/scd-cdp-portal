import network from './Network';
import profile from './Profile';
import transactions from './Transactions';
import system from './System';
import dialog from './Dialog';
import modal from './Modal';

const stores = { network, profile, transactions, system, dialog, modal };

transactions.network = network;
profile.transactions = transactions;
system.network = network;
system.profile = profile;
system.transactions = transactions;
system.dialog = dialog;
system.modal = modal;
transactions.system = system;
transactions.profile = profile;
network.profile = profile;
network.system = system;
network.transactions = transactions;

window.stores = stores;

export default stores;
