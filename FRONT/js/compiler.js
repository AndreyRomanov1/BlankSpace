class HTMLInclude extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute("src");
    const response = await fetch(src);
    this.innerHTML = await response.text();
    this.dispatchEvent(new Event("html-include-loaded"));
  }
}

customElements.define("html-include", HTMLInclude);
