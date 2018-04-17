import { observable, decorate } from "mobx"

class DialogStore {
  dialog = {
    show: false
  };

  handleOpenDialog = e => {
    e.preventDefault();
    const method = e.target.getAttribute('data-method');
    const cupId = e.target.getAttribute('data-cup') ? e.target.getAttribute('data-cup') : false;
    this.dialog = {show: true, method, cup: cupId};
  }

  handleCloseDialog = e => {
    e.preventDefault();
    this.dialog = {show: false};
  }
}

decorate(DialogStore, {
  dialog: observable
});

const store = new DialogStore();
export default store;
