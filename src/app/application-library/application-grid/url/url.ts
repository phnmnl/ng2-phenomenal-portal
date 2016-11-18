export class Url {
  text: string;
  title: string;
  type: string;

  constructor(_item) {
    this.loadParameterAsRequired(_item);
  }

  loadParameterAsRequired(_item) {
    this.text = _item['#text'];
    this.title = _item['@title'];
    this.type = _item['@type'];
  }
}
