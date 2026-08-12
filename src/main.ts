import { initializeUi } from "./ui/ui.js";

const root = document.querySelector<HTMLElement>("#app");

if (root === null) {
  throw new Error("Käyttöliittymän juurielementtiä #app ei löytynyt");
}

initializeUi(root);
