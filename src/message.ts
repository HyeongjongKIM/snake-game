export class Message {
  container: HTMLElement;
  heading: HTMLElement;
  constructor() {
    const container = document.getElementById('message')!;
    this.container = container;
    const heading = container.querySelector('h5')!;
    this.heading = heading;
    this.container.style.display = 'none';
  }

  show(message: string) {
    this.heading.innerText = message;
    this.container.style.display = 'flex';
  }

  hide() {
    this.container.style.display = 'none';
  }
}
