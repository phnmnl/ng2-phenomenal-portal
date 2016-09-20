import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: true
})
export class FilterPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (value === undefined || value === null) {
      return value;
    }
    let resultArray = [];

    for (let item of value) {
      if (args.length === 0) {
        resultArray.push(item);
      } else {
        let text: string;
        text = '';
        for (let i of args) {
          text += i;
        }
        if (item.name.toLowerCase().match('^.*' + text.toLowerCase() + '.*$')) {
          resultArray.push(item);
        }
      }
    }
    return resultArray;
  }

}
