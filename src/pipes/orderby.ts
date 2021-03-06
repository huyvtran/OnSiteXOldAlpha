import { Pipe, PipeTransform           } from '@angular/core'  ;
import { Log, moment, Moment, isMoment } from 'domain/onsitexdomain' ;

/*
 * Example use
 *		Basic Array of single type: *ngFor="#todo of todoService.todos | orderBy : '-'"
 *		Multidimensional Array Sort on single column: *ngFor="#todo of todoService.todos | orderBy : ['-status']"
 *		Multidimensional Array Sort on multiple columns: *ngFor="#todo of todoService.todos | orderBy : ['status', '-title']"
 */

@Pipe({ name: 'orderBy', pure: false })
export class OrderBy implements PipeTransform {

  static _orderByComparator(a: any, b: any): number {

    Log.l("orderBy._orderByComparator(): Now attempting to compare a and b:\n", a, b)
    if ((a === null || a === undefined) && (b === null || b === undefined))
      return 0;

    if (a === null || a === undefined)
      a = (isNaN(parseFloat(b)) || !isFinite(b)) ? '' : 0;

    if (b === null || b === undefined)
      b = (isNaN(parseFloat(a)) || !isFinite(a)) ? '' : 0;

    if(isMoment(a) && isMoment(b)) {
      let val = moment(a).isBefore(moment(b)) ? -1 : moment(a).isAfter(moment(b)) ? 1 : 0;
      return val;
    } else if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
      //Isn't a number so lowercase the string to properly compare
      if (a.toLowerCase() < b.toLowerCase()) return -1;
      if (a.toLowerCase() > b.toLowerCase()) return 1;
    }
    else {
      //Parse strings as numbers to compare properly
      if (parseFloat(a) < parseFloat(b)) return -1;
      if (parseFloat(a) > parseFloat(b)) return 1;
    }

    return 0;
  }

  transform(input: any, [config = '+']): any {

    Log.l("orderBy.transform(): input and config are:\n", input);
    Log.l(config);
    if (!Array.isArray(input)) return input;

    if (!Array.isArray(config) || (Array.isArray(config) && config.length == 1)) {
      var propertyToCheck: string = !Array.isArray(config) ? config : config[0];
      var desc = propertyToCheck.substr(0, 1) == '-';

      //Basic array
      if (!propertyToCheck || propertyToCheck == '-' || propertyToCheck == '+') {
        return !desc ? input.sort() : input.sort().reverse();
      }
      else {
        var property: string = propertyToCheck.substr(0, 1) == '+' || propertyToCheck.substr(0, 1) == '-'
          ? propertyToCheck.substr(1)
          : propertyToCheck;

        return input.sort(function (a: any, b: any) {
          return !desc
            ? OrderBy._orderByComparator(a[property], b[property])
            : -OrderBy._orderByComparator(a[property], b[property]);
        });
      }
    }
    else {
      //Loop over property of the array in order and sort
      return input.sort(function (a: any, b: any) {
        for (var i: number = 0; i < config.length; i++) {
          var desc = config[i].substr(0, 1) == '-';
          var property = config[i].substr(0, 1) == '+' || config[i].substr(0, 1) == '-'
            ? config[i].substr(1)
            : config[i];

          var comparison = !desc
            ? OrderBy._orderByComparator(a[property], b[property])
            : -OrderBy._orderByComparator(a[property], b[property]);

          //Don't return 0 yet in case of needing to sort by next property
          if (comparison != 0) return comparison;
        }

        return 0; //equal each other
      });
    }
  }
}
