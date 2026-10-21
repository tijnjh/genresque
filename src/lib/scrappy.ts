import { createWindow } from "domino";

interface ScrappyMethods {
  find<T extends Element = HTMLElement>(
    selector: string,
  ): ChainableElement<T> | undefined;
  findAll<T extends Element = HTMLElement>(selector: string): T[];
}

// scraping helper class
// derived partially from tijnjh/echoscrape
export class Scrappy implements ScrappyMethods {
  private root?: Document;

  static async init({ raw }: { raw: string }): Promise<Scrappy>;
  static async init(url: string): Promise<Scrappy>;
  static async init(arg: string | { raw: string }) {
    const scraper = new Scrappy();

    let html: string;

    if (typeof arg === "string") {
      html = await (await fetch(arg)).text();
    } else {
      html = arg.raw;
    }

    const dom = createWindow(html).document;

    scraper.root = dom;
    return scraper;
  }

  find<T extends Element = HTMLElement>(selector: string) {
    const element = this.root?.querySelector<T>(selector);
    return element ? new ChainableElement(element) : undefined;
  }

  findAll<T extends Element = HTMLElement>(selector: string) {
    const elements = this.root?.querySelectorAll<T>(selector);
    if (!elements?.length) return [];
    return Array.from(elements);
  }
}

class ChainableElement<
  T extends Element = HTMLElement,
> implements ScrappyMethods {
  constructor(public el: T) {}

  find<T extends Element = HTMLElement>(selector: string) {
    const element = this.el.querySelector<T>(selector);
    return element ? new ChainableElement(element) : undefined;
  }

  findAll<T extends Element = HTMLElement>(selector: string) {
    const elements = this.el.querySelectorAll<T>(selector);
    if (!elements?.length) return [];
    return Array.from(elements);
  }
}
