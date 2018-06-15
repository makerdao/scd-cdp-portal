import { observable, decorate } from "mobx";

class ModalStore {
  show = false;

  // handleOpenModal = e => {
  //   e.preventDefault();
  //   this.show = true;
  // }
  //
  // handleCloseModal = e => {
  //   e.preventDefault();
  //   this.show = false;
  // }
}

decorate(ModalStore, {
  show: observable
});

const store = new ModalStore();
export default store;
