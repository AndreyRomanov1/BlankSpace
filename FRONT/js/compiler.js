class HTMLInclude extends HTMLElement {
  async connectedCallback() {
    const tag = this.getAttribute("tag");
    const src = `components/${tag}.html`;
    const response = await fetch(src);
    this.innerHTML = await response.text();
    this.dispatchEvent(new Event(`${tag}-loaded`, { bubbles: true }));
  }
}

customElements.define("html-include", HTMLInclude);
