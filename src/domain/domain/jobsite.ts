/**
 * Name: Jobsite domain class
 * Vers: 5.0.2
 * Date: 2018-01-26
 * Auth: David Sargeant
 * Logs: 5.0.2 2018-01-26: Forgot to actually set the new CLL values to the corresponding Jobsite property. D'OH!
 * Logs: 5.0.1 2018-01-26: Changed client, location, locID, and aux to represent full classes, now defined in config.types
 * Logs: 4.0.1 2018-01-24: Re-enabled loc2nd as aux; added types for client, location, locID, aux; added deserialize methods; changed .name to .code
 * Logs: 3.0.3 2018-01-20: Added siteClientAndLocation
 * Logs: 3.0.2 2018-01-16: Added lunch_hour_time property
 * Logs: 3.0.1 2017-12-15: Merged app and console classes
 * Logs: 2.2.1 2017-08-30: Updated with site_number and new methods
 */

import { Street                                                } from './street'  ;
import { Address                                               } from './address' ;
import { Log, moment, Moment, isMoment, oo                     } from '../config' ;
import { SESAClient, SESALocation, SESALocID, SESAAux, SESACLL } from '../config' ;

export class Jobsite {
  public _id                       : string  ;
  public _rev                      : string  ;
  public client                    : SESAClient   = new SESAClient();
  public location                  : SESALocation = new SESALocation();
  public locID                     : SESALocID    = new SESALocID();
  public aux                       : SESAAux      = new SESAAux();
  public address                   : Address ;
  public billing_address           : Address = this.address ;
  public latitude                  : number  ;
  public longitude                 : number  ;
  public within                    : number  ;
  public account_number            : string     ;
  public travel_time               : number  ;
  public per_diem_rate             : number  ;
  public lodging_rate              : number  ;
  public requires_preauth          : boolean =false        ;
  public requires_preauth_pertech  : boolean =false        ;
  public requires_invoice_woreports: boolean =false        ;
  public account_or_contract       : string  ='Contract'   ;
  public billing_rate              : number  =65           ;
  public site_active               : boolean =true         ;
  public divisions                 : any     ;
  public shiftRotations            : any     ;
  public hoursList                 : any     ;
  public techShifts                : any     ;
  public schedule_name             : string   = "" ;
  public has_standby               : boolean  = false;
  public sort_number               : number   = 0;
  public site_number               : number = -1001;
  public shift_start_times         : {AM:string, PM:string} = {"AM" :"06:00", "PM": "18:00"} ;
  public lunch_hour_time           : number = 1;

  constructor(inClient?:any, inLoc?: any, inLocID?:any, inAddress?:Address, inLat?:number, inLon?:number, inWI?:number) {
    this._id                        = ""         ;
    this.client                     = inClient   || null       ;
    this.location                   = inLoc      || null       ;
    this.locID                      = inLocID    || null       ;
    this.aux                        = null       ;
    this.address                    = inAddress  || new Address() || null       ;
    this.billing_address            = inAddress  || new Address() || null       ;
    this.latitude                   = inLat      || 26.17726   ;
    this.longitude                  = inLon      || -97.964594 ;
    this.within                     = inWI       || 500        ;
    this.account_number             = ''         ;
    this.travel_time                = 0          ;
    this.per_diem_rate              = 0          ;
    this.lodging_rate               = 0          ;
    this.requires_preauth           = false      ;
    this.requires_preauth_pertech   = false      ;
    this.requires_invoice_woreports = false      ;
    this.account_or_contract        = 'Contract' ;
    this.billing_rate               = 65         ;
    this.site_active                = true       ;
    this.divisions                  =            {           } ;
    this.shiftRotations             =            {           } ;
    this.hoursList                  =            {           } ;
    this.techShifts                 =            {           } ;
    this.schedule_name              = ""         ;
    this.has_standby                = false      ;
    this.sort_number                = 0          ;
    this.site_number                = -1001      ;
    this.lunch_hour_time            = 1          ;

    window['onsite'] = window['onsite'] || {};
    window['onsite']['Jobsite'] = Jobsite;

  }

  public setBilling(inAddr: Address) {
    this.billing_address = inAddr;
  }

  public setAddress(inAddr: Address) {
    this.address = inAddr;
  }

  public readFromDoc(doc:any) {
    if(typeof doc !== 'object') {
      Log.l("Can't read jobsite from:\n", doc);
      throw new Error("readFromDoc(): Jobsite cannot be read");
    }
    if (doc.address !== undefined) {
      this.address = new Address(new Street(doc.address.street.street1, doc.address.street.street2), doc.address.city, doc.address.state, doc.address.zipcode);
    } else {
      this.address = new Address(new Street('', ''), '', '', '');
    }
    if (doc.billing_address !== undefined) {
      this.billing_address = new Address(new Street(doc.billing_address.street.street1, doc.billing_address.street.street2), doc.billing_address.city, doc.billing_address.state, doc.billing_address.zipcode);
    } else {
      this.billing_address = new Address(new Street('', ''), '', '', '');
    }

    let docKeys = Object.keys(doc);
    let keys = Object.keys(this);
    for(let prop of docKeys) {
      if(prop === 'lodging_rate' || prop === 'per_diem_rate' || prop === 'site_number') {
        this[prop] = Number(doc[prop]);
      } else if(prop === 'client') {
        let item = new SESAClient();
        item.readFromDoc(doc[prop]);
        this[prop] = item;
      } else if(prop === 'location') {
        let item = new SESALocation();
        item.readFromDoc(doc[prop]);
        this[prop] = item;
      } else if(prop === 'locID') {
        let item = new SESALocID();
        item.readFromDoc(doc[prop]);
        this[prop] = item;
      } else if(prop === 'aux') {
        // let item = new SESAAux();
        // item.readFromDoc(doc[prop]);
        // this[prop] = item;
      } else if (prop !== 'address' && prop !== 'billing_address' && keys.indexOf(prop) > -1) {
        this[prop] = doc[prop];
      }
    }
    if(doc['schedule_name'] === undefined) {
      this.schedule_name = this.getSiteName();
    }
    if(!this._id) {
      this._id = this.getSiteID();
    } else {
      this._id = doc['_id'];
      if(doc['_rev']) {
        this._rev = doc['_rev'];
      }
    }
  }

  public serialize() {
    let keys = Object.keys(this);
    let doc:any = {};
    for(let key of keys) {
      doc[key] = JSON.stringify(this[key]);
    }
    return doc;
  }

  public static deserialize(doc:any) {
    let site = new Jobsite();
    site.deserialize(doc);
    return site;
  }

  public deserialize(doc:any) {
    let site = this;
    site.readFromDoc(doc);
    return site;
  }

  public getSiteName() {
    let cli = this.client.fullName.toUpperCase();
    let loc = this.location.fullName.toUpperCase();
    let lid = this.locID.fullName.toUpperCase();
    // let l2d = '';
    // let laux = "NA";
    // if (this.aux && this.aux.code) { laux = this.aux.code; }
    // if (laux !== "NA" && laux !== "N/A") {
    //   l2d = this.aux.fullName.toUpperCase();
    // }

    let siteName = '';
    if(this.client.code === "HB") {
      siteName = '';
    } else {
      siteName = `${cli} `;
    }

    siteName += `${loc}`;

    // if (laux !== "NA" && laux !== "N/A") {
    //   siteName += ` ${l2d}`;
    // }

    if(this.locID.code !== "MNSHOP") {
      siteName += ` ${lid}`
    }

    return siteName;
  }

  public getSiteSelectName() {
    // let cli = this.client.fullName.toUpperCase();
    let cli = this.client.code.toUpperCase();
    let loc = this.location.fullName.toUpperCase();
    let lid = this.locID.code.toUpperCase();
    // let l2d = '';
    // let laux = "NA";
    // if (this.aux && this.aux.code) { laux = this.aux.code; }
    // if (laux !== "NA" && laux !== "N/A") {
      // l2d = this.aux.fullName.toUpperCase();
    // }

    let siteName = `${cli}`;
    siteName    += ` ${loc}`;

    // if (laux !== "NA" && laux !== "N/A") {
      // siteName += ` ${l2d}`;
    // }

    siteName += ` ${lid}`;
    return siteName;
  }

  public getScheduleName() {
    return this.schedule_name;
  }

  public setScheduleName(name:string) {
    this.schedule_name = name;
  }

  public getInvoiceName() {
    let cli = this.client.fullName;
    let loc = this.location.fullName;
    let lid = this.locID.fullName;
    let out = `${cli} ${loc} ${lid}`;
    return out;
  }

  public getShiftTypes() {
    return Object.keys(this.shift_start_times);
  }

  public getShiftStartTimes() {
    return this.shift_start_times;
  }

  public getShiftStartTime(key:string) {
    if(this.shift_start_times[key] !== undefined) {
      return this.shift_start_times[key];
    } else {
      Log.e("getShiftStartTime(): Error, key was not found in start times object: ", key);
      return null;
    }
  }

  public getShiftRotations() {
    return this.shiftRotations;
  }

  public setShiftRotations(value:any) {
    this.shiftRotations = value;
    return this.shiftRotations;
  }

  public getSiteID() {
    if (this._id) {
      return this._id;
    } else {
      let siteid = '';
      let cli = this.client.code.toUpperCase();
      let loc = this.location.fullName.toUpperCase();
      let lid = this.locID.code.toUpperCase();
      // let laux = "NA";
    // if (this.aux && this.aux.code) { laux = this.aux.code; }
    // if (laux !== "NA" && laux !== "N/A") {
    //   l2d = this.aux.code.toUpperCase();
      // siteid = `${cli} ${loc} ${l2d} ${lid}`;
    // } else {
      siteid = `${cli} ${loc} ${lid}`;
    // }
      return siteid;
    }
  }

  public getShortID() {
    let siteid = '';
    let cli = this.client.code.toUpperCase();
    let loc = this.location.code.toUpperCase();
    let l2d = '';
    let lid = this.locID.code.toUpperCase();
    let laux = "NA";
    if (this.aux && this.aux.code) { laux = this.aux.code; }
    if (laux !== "NA" && laux !== "N/A") {
      l2d = this.aux.code.toUpperCase();
      siteid = `${cli} ${loc} ${l2d} ${lid}`;
    } else {
      siteid = `${cli} ${loc} ${lid}`;
    }
    return siteid;
  }

  // public updateSiteDivisions(rotations:any, hours:any) {
  //   let js = this;
  //   let cli = js.client.code;
  //   let loc = js.location.code;
  //   let sr = rotations;
  //   let sd = {};
  //   // let hasAux = js.aux.length;
  //   // sd[cli] = {};
  //   // sd[cli][loc] = {};
  //   // if (hasAux) {
  //   //   for (let loc2 of js.aux) {
  //   //     sd[cli][loc][loc2] = {};
  //   //     for (let locID of js.locID) {
  //   //       sd[cli][loc][loc2][locID] = {};
  //   //       for (let rotation of sr) {
  //   //         let rot = rotation.code;
  //   //         sd[cli][loc][loc2][locID][rot] = [];
  //   //       }
  //   //     }
  //   //   }
  //   // } else {
  //     for (let locID of js.locID) {
  //       sd[cli][loc][locID] = {};
  //       for (let rotation of sr) {
  //         let rot = rotation.code;
  //         sd[cli][loc][locID][rot] = [];
  //       }
  //     }
  //   // }
  //   this.divisions = sd;
  //   Log.l("JobSite.updateSiteDivisions(): Site divisions are now:\n", sd);
  // }

  public getFullHoursList() {
    return this.hoursList;
  }

  public getHoursList(shiftRotation:string|object, shiftTime?:string) {
    let match = "", oneHourList = null, singleShiftList = null;
    if(typeof shiftRotation === 'string') {
      match = shiftRotation;
    } else if(shiftRotation && typeof shiftRotation === 'object' && typeof shiftRotation['name'] === 'string') {
      match = shiftRotation['name'];
    }
    if(this.hoursList[match] !== undefined) {
      oneHourList = this.hoursList[match];
    } else {
      // if (shiftRotation === 'UNASSIGNED' || shiftRotation === 'DAYS OFF') {
      if (shiftRotation === 'UNASSIGNED') {
        oneHourList = { AM: ["0", "0", "0", "0", "0", "0", "0"], PM: ["0", "0", "0", "0", "0", "0", "0"] };
        return oneHourList;
      } else {
        Log.e("Jobsite.getHoursList('%s', '%s'): Index not found!", match, shiftTime);
        Log.l(this);
        return null;
      }
    }
    if(shiftTime) {
      singleShiftList = oneHourList[shiftTime];
      return singleShiftList;
    } else {
      return oneHourList;
    }
  }

  public getShiftLengthForDate(shiftRotation:string|object, shiftTime:string, date:Moment|Date):number {
    let list = this.getHoursList(shiftRotation, shiftTime);
    let day = moment(date);
    let dayIndex = day.isoWeekday();
    let hoursIndex = (dayIndex + 4) % 7;
    let shiftLength = list[hoursIndex];
    let output = shiftLength;
    if(shiftLength == 0) {
      output = "OFF";
    }
    return output;
  }

  public getSiteShiftLength(shiftType: string | object, shiftTime: string, date: Moment | Date) {
    return this.getShiftLengthForDate(shiftType, shiftTime, date);
  }

  public getSiteNumber() {
    return this.site_number;
  }

  public getLunchHour():number {
    return this.lunch_hour_time;
  }

  public setLunchHour(hours:number) {
    this.lunch_hour_time = hours;
  }

  public setSiteNumber(value:number) {
    this.site_number = value;
    return this.site_number;
  }

  public getSiteClientAndLocation():string {
    let out:string = "";
    let cli = this.client.code;
    let loc = this.location.fullName;
    out = cli + " " + loc;
    return out;
  }

  public toJSON() {
    return this.serialize();
  }

  public static fromJSON(doc:any) {
    return new Jobsite().readFromDoc(doc);
  }

}