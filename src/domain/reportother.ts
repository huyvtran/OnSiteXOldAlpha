/**
 * Name: ReportOther domain class
 * Vers: 4.0.1
 * Date: 2017-12-15
 * Auth: David Sargeant
 * Logs: 4.0.1 2017-12-15: Combined app and console class; added getHoursNumeric() and getHoursString() methods
 * Logs: 3.1.2 2017-11-04: Added site_number property and setSite() method
 */

import { sprintf                       } from 'sprintf-js'                 ;
import { Log, isMoment, moment, Moment } from 'config/config.functions' ;
import { Employee, Jobsite             } from './domain-classes'           ;

export const fields = [
  "type",
  "training_type",
  "travel_location",
  "time",
  "notes",
  "report_date",
  "last_name",
  "first_name",
  "client",
  "location",
  "location_id",
  "location_2",
  "timestamp",
  "timestampM",
  "username",
  "shift_serial",
  "payroll_period",
  "flagged",
  "site_number",
  "_id",
  "_rev",
];

export class ReportOther {
  public type             : string = "";
  public training_type    : string = "";
  public travel_location  : string = "";
  public time             : number = 0 ;
  public notes            : string = "";
  public report_date      : Moment;
  public last_name        : string = "";
  public first_name       : string = "";
  public client           : string = "";
  public location         : string = "";
  public location_id      : string = "";
  public timestamp        : number = 0;
  public timestampM       : Moment;
  public username         : string = "";
  public shift_serial     : string = "";
  public payroll_period   : number = 0;
  public flagged          : boolean = false;
  public site_number      : number = -1001;
  public _id              : string = "";
  public _rev             : string = "";

  constructor() {
    this.type              = ""                    ;
    this.training_type     = ""                    ;
    this.time              = 0                     ;
    this.notes             = ""                    ;
    this.report_date       = null                  ;
    this.last_name         = ""                    ;
    this.first_name        = ""                    ;
    this.client            = ""                    ;
    this.location          = ""                    ;
    this.location_id       = ""                    ;
    this.shift_serial      = ""                    ;
    this.username          = ""                    ;
    this.shift_serial      = ""                    ;
    this.payroll_period    = 0                     ;
    this._id               = ""                    ;
    this._rev              = ""                    ;
    this.timestampM        = moment();
    this.timestamp         = this.timestampM.toExcel();
  }

  public readFromDoc(doc:any) {
    let len = fields.length;
    for(let i = 0; i < len; i++) {
      let key  = fields[i];
      this[key] = doc[key] ? doc[key] : this[key];
    }
    this.report_date = moment(this.report_date, "YYYY-MM-DD");
    this.timestampM  = moment(this.timestampM);
    return this;
  }

  public deserialize(doc:any) {
    return this.readFromDoc(doc);
  }

  public static deserialize(doc:any) {
    let other = new ReportOther();
    other.deserialize(doc);
    return other;
  }

  public serialize(tech:Employee) {
    Log.l("ReportOther.serialize(): Now serializing report...");
    // let ts = moment(this.timestamp);
    // Log.l("Report.serialize(): timestamp moment is now:\n", ts);
    // let XLDate = moment([1900, 0, 1]);
    // let xlStamp = ts.diff(XLDate, 'days', true) + 2;
    // this.timestamp = xlStamp;
    let newReport = {};
    this._id = this._id || this.genReportID(tech);
    let len = fields.length;
    for(let i = 0; i < len; i++) {
      let key = fields[i];
      if(key === 'report_date') {
        let date = this[key];
        if(isMoment(date)) {
          newReport[key] = this[key].format("YYYY-MM-DD");
        } else if(typeof date === 'string') {
          newReport[key] = this[key];
        } else {
          Log.w("ReportOther.serialize() called with 'report_date' that isn't a Moment or a string:\n", this);
          newReport[key] = this[key];
        }
      } else if(key === 'technician') {
        newReport[key] = tech.getTechName();
      } else {
        if(this[key] !== undefined && this[key] !== null) {
          newReport[key] = this[key];
        } else if(tech[key] !== undefined && tech[key] !== null) {
          newReport[key] = tech[key];
        }
      }
      newReport['username'] = tech['avatarName'];
    }
    let hrs = Number(newReport['time']);
    if(!isNaN(hrs)) {
      newReport['time'] = hrs;
    }
    newReport['notes'] = newReport['type'] + "";
    return newReport;
  }

  public clone() {
    let newWO = new ReportOther();
    for(let key of fields) {
      if(isMoment(this[key])) {
        newWO[key] = moment(this[key]);
      } else if(typeof this[key] === 'object') {
        newWO[key] = Object.assign({}, this[key]);
      } else {
        newWO[key] = this[key];
      }
    }
    return newWO;
  }

  public getReportID() {
    return this._id ? this._id : "";
  }

  public genReportID(tech:Employee) {
    let now = moment();
    // let idDateTime = now.format("YYYYMMDDHHmmss_ddd");
    let idDateTime = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
    let docID = tech.avatarName + '_' + idDateTime;
    Log.l("genReportID(): Generated ID:\n", docID);
    return docID;
  }

  public getTotalHours() {
    let hours:number|string = Number(this.time);
    if(!isNaN(hours)) {
      return hours;
    } else {
      let strHours = String(this.time);
      let loc = this.location.trim().toUpperCase();
      if(strHours === "V" || strHours === "H") {
        hours = 8;
      } else if(strHours === "S" && (loc === "DUNCAN" || loc === "DCN")) {
        hours = "S";
      } else {
        // Log.w("ReportOther.getTotalHours(): Total hours for this ReportOther was not a number or a recognized code: '%s'", this.time);
        hours = 0;
      }
      return hours;
    }
  }

  public getHoursNumeric():number {
    let hours:number = Number(this.time);
    if(!isNaN(hours)) {
      return hours;
    } else {
      return 0;
    }
  }

  public getHoursString():string {
    let time = Number(this.time);
    if(!isNaN(time)) {
      let hrs = Math.trunc(this.time);
      let min = 60*(time - hrs);
      let strTime = sprintf("%02d:%02d", hrs, min);
      return strTime;
    } else {
      return "00:00";
    }
  }

  public setSite(site:Jobsite) {
    let cli = site.client;
    let loc = site.location;
    let lid = site.locID;
    let sno = site.site_number;
    this.site_number = sno;
    this.client = cli.fullName.toUpperCase();
    this.location = loc.fullName.toUpperCase();
    this.location_id = lid.name.toUpperCase();
  }

}
