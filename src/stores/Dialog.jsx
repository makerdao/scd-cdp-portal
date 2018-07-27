// Libraries
import { observable, decorate } from "mobx";

export default class DialogStore {
  show = false;
  method = null;
  cupId = false;
  error = "";
  warning = "";

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  handleOpenDialog = e => {
    e.preventDefault();
    this.show = true;
    this.method = e.currentTarget.getAttribute("data-method");
    this.cupId = e.currentTarget.getAttribute("data-cup") ? e.currentTarget.getAttribute("data-cup") : false;
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
