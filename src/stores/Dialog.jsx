// Libraries
import {observable} from "mobx";

export default class DialogStore {
  @observable show = false;
  @observable method = null;
  @observable cupId = false;
  @observable error = "";
  @observable warning = "";

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  reset = () => {
    this.show = false;
    this.method = null;
    this.cupId = false;
    this.error = "";
    this.warning = "";
  }

  handleOpenDialog = e => {
    e.preventDefault();
    this.show = true;
    this.method = e.currentTarget.getAttribute("data-method");
    this.cupId = e.currentTarget.getAttribute("data-cup") ? e.currentTarget.getAttribute("data-cup") : false;
  }

  handleCloseDialog = e => {
    e.preventDefault();
    this.reset();
  }

  setError = e => {
    this.error = e;
  }
}
