import { observable, decorate } from "mobx";

class DialogStore {
  show = false;
  method = null;
  cupId = false;
  error = '';
  warning = '';


  handleOpenDialog = e => {
    e.preventDefault();
    this.show = true;
    this.method = e.currentTarget.getAttribute('data-method');
    this.cupId = e.currentTarget.getAttribute('data-cup') ? e.currentTarget.getAttribute('data-cup') : false;
  }

  handleCloseDialog = e => {
    e.preventDefault();
    this.show = false;
  }
}

decorate(DialogStore, {
  show: observable,
  method: observable,
  cupId: observable,
  error: observable,
  warning: observable
});

const store = new DialogStore();
export default store;
