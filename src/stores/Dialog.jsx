import { observable, decorate } from "mobx";

class DialogStore {
  show = false;
  method = null;
  cupId = false;

  handleOpenDialog = e => {
    e.preventDefault();
    this.show = true;
    this.method = e.target.getAttribute('data-method');
    this.cupId = e.target.getAttribute('data-cup') ? e.target.getAttribute('data-cup') : false;
  }

  handleCloseDialog = e => {
    e.preventDefault();
    this.show = false;
  }
}

decorate(DialogStore, {
  show: observable,
  method: observable,
  cupId: observable
});

const store = new DialogStore();
export default store;
