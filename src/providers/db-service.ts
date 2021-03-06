import { Injectable, NgZone                          } from '@angular/core'                ;
import { Log, CONSOLE, moment, Moment, isMoment      } from 'domain/onsitexdomain'         ;
import { Storage                                     } from '@ionic/storage'               ;
import { NativeStorage                               } from '@ionic-native/native-storage' ;
import { PouchDBService                              } from './pouchdb-service'            ;
import { AuthSrvcs                                   } from './auth-srvcs'                 ;
import { AlertService                                } from './alerts'                     ;
import { ServerService                               } from './server-service'             ;
import { UserData                                    } from './user-data'                  ;
import { Preferences                                 } from './preferences'                ;
import { Employee, Jobsite, Report, ReportOther, oo, } from 'domain/onsitexdomain'         ;
import { Message, Comment, Shift, PayrollPeriod      } from 'domain/onsitexdomain'         ;

export const noDD = "_\uffff";
export const noDesign = { include_docs: true, startkey: noDD };
export const liveNoDesign = { live: true, since: 'now', include_docs: true, startkey: noDD };

@Injectable()
export class DBService {
  public data                 : any                                                ;
  public static db            : any                                                ;
  public static serverdb      : any                                                ;
  public username             : any                                                ;
  public password             : any                                                ;
  public remote               : any                                                ;
  public PouchDB              : any                                                ;
  public remoteDB             : any                                                ;
  public pdbOpts              : any                                                ;
  public static StaticPouchDB : any                                                ;
  public static pdb           : any = new Map()                                    ;
  public static rdb           : any = new Map()                                    ;
  public static ldbs          : any                                                ;
  public static rdbs          : any                                                ;
  public static PREFS         : any = new Preferences()                            ;
  public prefs                : any = DBService.PREFS                              ;

  constructor(
    public zone    : NgZone        ,
    public storage : Storage       ,
    public auth    : AuthSrvcs     ,
    public server  : ServerService ,
    public ud      : UserData      ,
  ) {
    DBService.StaticPouchDB = PouchDBService.PouchInit();
    this.PouchDB = DBService.StaticPouchDB;

    window["dbserv"] = this;
    window["sdb"] = DBService;

    DBService.addDB(this.prefs.DB.reports);
  }

  /**
   * Returns a copy of the PouchDB method, which can be used as normal.
   * @type {PouchDB}
   */
  public getAdapter() {
    return this.PouchDB;
  }

  public getThisDB() {
    return DBService.db;
  }

  public getDBs() {
    return DBService.pdb;
  }

  public getRDBs() {
    return DBService.rdb;
  }

  public getServerInfo() {
    return this.prefs.SERVER.protocol + "://" + this.prefs.SERVER.server;
  }

  public addDB(dbname:string) {
    return PouchDBService.addDB(dbname);
  }

  public static addDB(dbname:string) {
    return PouchDBService.addDB(dbname);
  }

  public addRDB(dbname:string) {
    return PouchDBService.addRDB(dbname);
  }

  public static addRDB(dbname:string) {
    return PouchDBService.addRDB(dbname);
  }

  public static getRDB(dbname:string) {
    return PouchDBService.addRDB(dbname);
  }

  public syncToServer(dbname:string) {
    Log.l(`syncToServer(): About to attempt replication of '${dbname}'->remote`);
    let ev1 = (a) => { Log.l(a.status); Log.l(a);};
    let db1 = DBService.addDB(dbname);
    let db2 = DBService.addRDB(dbname);
    let done = db1.replicate.to(db2, this.prefs.SERVER.repopts)
    .on('change'   , info => { Log.l("syncToServer(): change event fired. Status: ", info.status); Log.l(info);})
    .on('active'   , info => { Log.l("syncToServer(): active event fired. Status: ", info.status); Log.l(info);})
    .on('paused'   , info => { Log.l("syncToServer(): paused event fired. Status: ", info.status); Log.l(info);})
    .on('denied'   , info => { Log.l("syncToServer(): denied event fired. Status: ", info.status); Log.l(info);})
    .on('complete' , info => { Log.l("syncToServer(): complete event fired. Status: ", info.status); Log.l(info);})
    .on('error'    , info => { Log.l("syncToServer(): error event fired. Status: ", info.status); Log.l(info);})
    .on('cancel'   , info => { Log.l("syncToServer(): cancel event fired. Status: ", info.status); Log.l(info);});
    Log.l(`syncToServer(): Ran replicate, now returning cancel object.`);
    window["stat1"] = done;
    return done;
  }

  public syncFromServer(dbname:string) {
    Log.l(`syncFromServer(): About to attempt replication of remote->'${dbname}'`);
    let ev2 = (b) => { Log.l(b.status); Log.l(b);};
    let db1 = DBService.addRDB(dbname);
    let db2 = DBService.addDB(dbname);
    let done = db1.replicate.to(db2, this.prefs.SERVER.repopts)
      .on('change',   info => { Log.l("syncFromServer(): change event fired. Status: ", info.status); Log.l(info); })
      .on('active',   info => { Log.l("syncFromServer(): active event fired. Status: ", info.status); Log.l(info); })
      .on('paused',   info => { Log.l("syncFromServer(): paused event fired. Status: ", info.status); Log.l(info); })
      .on('denied',   info => { Log.l("syncFromServer(): denied event fired. Status: ", info.status); Log.l(info); })
      .on('complete', info => { Log.l("syncFromServer(): complete event fired. Status: ", info.status); Log.l(info); })
      .on('error',    info => { Log.l("syncFromServer(): error event fired. Status: ", info.status); Log.l(info); })
      .on('cancel',   info => { Log.l("syncFromServer(): cancel event fired. Status: ", info.status); Log.l(info); });
    Log.l(`syncFromServer(): Ran replicate, now returning cancel object.`);
    window["stat2"] = done;
    return done;
  }

  public syncSquaredToServer(dbname:string) {
    Log.l(`syncSquaredToServer(): About to attempt replication of '${dbname}'->remote`);
    // let ev2 = (b) => { Log.l(b.status); Log.l(b);};
    let db1 = this.addDB(dbname);
    let db2 = this.addRDB(dbname);
    // var done = DBService.StaticPouchDB.replicate(db1, db2, DBService.repopts);
    return new Promise((resolve, reject) => {
      db1.replicate.to(db2, this.prefs.SERVER.repopts).then((res) => {
        Log.l(`syncSquaredToServer(): Successfully replicated '${dbname}'->remote!`);
        Log.l(res);
        resolve(res);
      }).catch((err) => {
        Log.l(`syncSquaredToServer(): Failure replicating '${dbname}'->remote!`);
        Log.l(err);
        reject(err);
      });
    });
  }

  public syncSquaredFromServer(dbname:string) {
    Log.l(`syncSquaredFromServer(): About to attempt replication of remote->'${dbname}'`);
    let ev2 = (b) => { Log.l(b.status); Log.l(b);};
    let db1 = DBService.addRDB(dbname);
    let db2 = DBService.addDB(dbname);
    return new Promise((resolve, reject) => {
      db2.replicate.to(db1, this.prefs.SERVER.repopts).then((res) => {
        Log.l(`syncSquaredFromServer(): Successfully replicated remote->'${dbname}'`);
        Log.l(res);
        resolve(res);
      }).catch((err) => {
        Log.l(`syncSquaredFromServer(): Failure replicating remote->'${dbname}'`);
        Log.l(err);
        reject(err);
      });
    });
  }

  public syncReportsFromServer(dbname:string) {
    Log.l(`syncReportsFromServer(): Starting up...`);
    return new Promise((resolve,reject) => {
      let db1 = this.addDB(dbname);
      let db2 = this.addRDB(dbname);
      let user = this.ud.getUsername();
      db2.replicate.to(db1, {
        filter: 'ref/forTech',
        query_params: {username: user}
      }).then(res => {
        Log.l("syncReportsFromServer(): Successfully replicated filtered reports from server.\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("syncReportsFromServer(): Error during replication!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public async syncSchedulesFromServer(dbname:string) {
    try {
      Log.l(`syncSchedulesFromServer(): Starting up...`);
      let db1 = this.addDB(dbname);
      let db2 = this.addRDB(dbname);
      let user = this.ud.getUsername();
      let res:any = await db2.replicate.to(db1, {
        filter: 'ref/forTech',
        query_params: {username: user}
      });
      Log.l("syncSchedulesFromServer(): Successfully replicated filtered reports from server.\n", res);
      return res;
    } catch(err) {
      Log.l("syncSchedulesFromServer(): Error during replication!");
      Log.e(err);
      throw new Error(err);
    }
  }

  public addDoc(dbname:string, newDoc:any) {
    return new Promise((resolve, reject) => {
      Log.l(`addDoc(): Adding document to ${dbname}:\n`, newDoc);
      let db1 = this.addDB(dbname);
      // db1.put(doc).then((res) => {
      db1.upsert(newDoc._id, (doc) => {
        if(doc) {
          let rev = doc._rev;
          doc = newDoc;
          doc._rev = rev;
          return doc;
        } else {
          doc = newDoc;
          delete doc._rev;
          return doc;
        }
      }).then(res => {
        if(!res.ok && !res.updated) {
          reject(res);

        } else {
          let rev = res._rev;
          // Log.l("addDoc(): Successfully added document.");
          Log.l(res);
          newDoc['_rev'] = rev;
          resolve(res);
        }
      }).catch((err) => {
        Log.l(`addDoc(): Failed while trying to add document '${newDoc._id}'`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public getDoc(dbname:string, docID) {
    return new Promise((resolve, reject) => {
      let db1 = this.addDB(dbname);
      db1.get(docID).then((result) => {
        Log.l(`Got document ${docID}`);
        resolve(result);
      }).catch((error) => {
        Log.l("Error in DBService.getDoc()!");
        console.error(error);
        reject(error);
      });
    });
  }

  public updateDoc(dbname:string, newDoc) {
    return new Promise((resolve,reject) => {
      let db1 = this.addDB(dbname);
      // let newDoc = doc;
      // return db1.put(doc);
      // db1.get(newDoc._id).then(res => {
      db1.upsert(newDoc._id, (doc) => {
        if(doc) {
          let id = doc._id;
          let rev = doc._rev;
          doc = newDoc;
          doc._rev = rev;
          return doc;
        } else {
          doc = newDoc;
          delete doc._rev;
          return doc;
        }
      }).then(res => {
        if(!res.ok && !res.updated) {
          reject(res);
        } else {
          resolve(res);
        }
      }).catch((err) => {
        Log.l(`updateDoc(): Error updating document doc ${newDoc._id}.`);
        Log.e(err)
        reject(err);
      });
    });
  }

  public deleteDoc(dbname, newDoc) {
    return new Promise((resolve,reject) => {
      Log.l(`deleteDoc(): Attempting to delete doc ${newDoc._id}...`);
      let db1 = this.addDB(dbname);
      let i = 0;
      db1.putIfNotExists(newDoc).then(res => {
        return db1.upsert(newDoc._id, (doc) => {
          if(i++ > 5) { return false;}
          if(doc && doc._id) {
          //   let rev = doc._rev;
          //   doc = newDoc;
          // doc._rev = rev;
            Log.l("deleteDoc(): Doc exists.\n", doc);
            doc['_deleted'] = true;
            return doc;
          } else {
            Log.l("deleteDoc(): Doc does not exist:\n", doc);
            // doc = newDoc;
            // doc['_id'] = newDoc._id;
            // doc['_rev'] = newDoc._rev;
            newDoc['_deleted'] = true;
            delete newDoc._rev;
            // delete doc._rev;
            Log.l(`deleteDoc(): upsert will return doc:\n`, newDoc);
            return newDoc;
          }
          // return false;
          // doc._deleted = true;
        });
      }).then((res) => {
        if(!res.ok && !res.updated) {
          Log.l("deleteDoc(): soft upsert error:\n", res);
          reject(res);
        } else {
          Log.l("deleteDoc(): Success:\n", res);
          resolve(res);
        }
      }).catch((err) => {
        Log.l("deleteDoc(): Error!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public checkLocalDoc(dbname:string, docID:any) {
    return new Promise((resolve, reject) => {
      let db1 = this.addDB(dbname);
      db1.get(docID).then((result) => {
        Log.l(`Local doc ${docID} exists`);
        resolve(true);
      }).catch((error) => {
        Log.l(`Local doc ${docID} does not exist`);
        reject(false);
      });
    })
  }

  public async addLocalDoc(dbname:string, newDoc:any) {
    try {
      let db1 = this.addDB(dbname);
      let id;
      if(!(newDoc['_id'] && newDoc['_id'].indexOf('_local') !== -1)) {
        throw new Error("Can't add a local doc that doesn't have a valid ID that begins with _local");
      } else {
        id = newDoc['_id'];
      }
      Log.l(`addLocalDoc(): About to try adding document:\n`, newDoc);
      let res:any = await db1.upsert(id, (doc) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = newDoc;
          doc._rev = rev;
        } else {
          doc = newDoc;
          delete doc._rev;
        }
        return doc;
      });
      if(!res.ok && !res.updated) {
        throw new Error(`saveReport(): Upsert error for local doc '${id}'`);
      } else {
        return res;
      }
    } catch(err) {
      Log.l(`addLocalDoc(): Error adding local doc:\n`, newDoc);
      Log.e(err);
      throw new Error(err);
    }
    // return new Promise((resolve, reject) => {
    //   let db1 = this.addDB(dbname);
    //   Log.l("addLocalDoc(): 01) Now removing and adding local doc:\n", newDoc);
    //   db1.get(newDoc._id).then(res => {
    //     Log.l("addLocalDoc(): 02) Now removing result:\n",res);
    //     return db1.remove(res);
    //   }).catch((err) => {
    //     Log.l("addLocalDoc(): 03) Caught error removing res!");
    //     Log.e(err);
    //     Log.l("addLocalDoc(): 04) Now removing original doc:\n", newDoc);
    //     return db1.remove(newDoc);
    //   }).catch((err) => {
    //     Log.l("addLocalDoc(): 05) Caught error removing newDoc!");
    //     Log.e(err);
    //     Log.l("addLocalDoc(): 06) Now continuing to save doc.");
    //     return Promise.resolve();
    //   }).then(() => {
    //     Log.l("addLocalDoc(): 07) No more copy of local doc, now putting back:\n", newDoc);
    //     delete newDoc._rev;
    //     return db1.put(newDoc);
    //   }).then((res) => {
    //     Log.l(`addLocalDoc(): 08) Added local document '${newDoc._id}'.`)
    //     resolve(res);
    //   }).catch((err) => {
    //     Log.l(`addLocalDoc(): 09) Error adding local doc ${newDoc._id}.`);
    //     Log.e(err)
    //     reject(err);
    //   });
    // });
  }

  public deleteLocalDoc(dbname:string, doc) {
    Log.l("Attempting to delete local document...");
    let db1 = this.addDB(dbname);
    return db1.remove(doc).then((res) => {
      Log.l(`Successfully deleted local doc ${doc._id}`);
    }).catch((err) => {
      Log.l(`Error while deleting local doc ${doc._id}`);
      Log.e(err);
    });
  }

  public async saveReport(report:Report) {
    // return new Promise((resolve,reject) => {
    try {
      let reportDoc = report.serialize();
      let db1 = this.addDB(this.prefs.DB.reports);
      let res = await db1.upsert(report._id, (doc) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = reportDoc;
          doc._rev = rev;
        } else {
          doc = reportDoc;
          delete doc._rev;
        }
        return doc;
      });
      if(!res.ok && !res.updated) {
        throw new Error(`saveReport(): Upsert error for report '${report._id}'`);
      } else {
        return res;
      }
    } catch(err) {
      Log.l(`saveReport(): Error saving report '${report._id}'`);
      Log.e(err);
      throw new Error(err);
    }
  }

  // public async saveTechProfile(newDoc:any) {
  //   try {
  //     Log.l("Attempting to save local techProfile...");
  //     let dbname = this.prefs.DB.employee;
  //     let reportsDBName = this.prefs.DB.reports;
  //     let eDB = this.
  //     return this.saveLocalDoc(newDoc);

  //     return res;
  //   } catch(err) {
  //     Log.l(`saveTechProfile(): Error saving tech profile!`);
  //     Log.e(err);
  //     throw new Error(err);
  //   }
  // }

  public saveTechProfile(doc) {
    Log.l("Attempting to save local techProfile...");
    let rdb1, uid, newProfileDoc, strID, strRev;
    return new Promise((resolve, reject) => {
      this.getTechProfile().then((res) => {
        Log.l("saveTechProfile(): About to process old and new:");
        Log.l(res);
        Log.l(doc);
        strID = res['_id'];
        newProfileDoc = { ...res, ...doc, "_id": strID};
        let sstm = newProfileDoc['shiftStartTimeMoment'];
        if(sstm) {
          if(isMoment(sstm)) {
            newProfileDoc['shiftStartTimeMoment'] = sstm.format();
          }
        }
        Log.l("saveTechProfile(): Merged profile is:");
        Log.l(newProfileDoc);
        Log.l("saveTechProfile(): now attempting save doc:\n", newProfileDoc);
        return this.addLocalDoc(this.prefs.DB.reports, newProfileDoc);
      }).then((res) => {
        rdb1 = this.server.addRDB(this.prefs.DB.employees);
        let name = this.ud.getUsername();
        uid = `org.couchdb.user:${name}`;
        Log.l(`saveTechProfile(): Now fetching remote copy with id '${uid}'...`);
        return rdb1.get(uid);
      }).then((res) => {
        Log.l(`saveTechProfile(): Got remote user ${uid}:\n`, res);
        newProfileDoc._id = res._id;
        newProfileDoc._rev = res._rev;
        return rdb1.put(newProfileDoc);
      }).then((res) => {
        Log.l("saveTechProfile(): Saved updated techProfile:\n", res);
        this.ud.setTechProfile(doc);
        resolve(res);
      }).catch((err) => {
        Log.l("saveTechProfile(): Error saving to sesa-employees database!");
        Log.l("saveTechProfile(): Error merging or saving profile!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getTechProfile() {
    let documentID = "_local/techProfile";
    return new Promise((resolve, reject) => {
      this.checkLocalDoc(this.prefs.DB.reports, documentID).then((res) => {
        Log.l("techProfile exists, reading it in...");
        return this.getDoc(this.prefs.DB.reports, documentID);
      }).then((res) => {
        Log.l("techProfile read successfully:");
        Log.l(res);
        resolve(res);
      }).catch((err) => {
        Log.l("techProfile not found, user not logged in.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getConfigData() {
    let db1 = PouchDBService.addDB(this.prefs.DB.config);
    let clients = null, locations = null, locids = null, loc2nds = null, rotations = null, shiftTimes = null;
    db1.get('client').then(res => {
      clients = res;
      return db1.get('locations');
    }).then(res => {
      locations = res;
    }).then(res => {

    }).then(res => {

    }).then(res => {

    }).catch(err => {
      Log.l("getConfigData(): Error retrieving clients, locations, locids, loc2nds, rotations, or shiftTimes!");
      Log.e(err);

    });
  }

  public savePreferences(prefs:any) {
    return this.storage.set("PREFS", prefs).then((res) => {
      Log.l("savePreferences(): Successfully saved preferences:\n", prefs);
    }).catch((err) => {
      Log.l("savePreferences(): Error saving preferences!");
      Log.e(err);
    });
  }

  public getPreferences() {
    return this.storage.get("PREFS").then((prefs) => {
      if(prefs) {
        Log.l("getPreferences(): PREFS found, returning.")
        return prefs;
      } else {
        Log.l("getPreferences(): PREFS not found, returning null.");
        return null;
      }
    }).catch((err) => {
      Log.l("getPreferences(): Error trying to retrieve PREFS.");
      Log.e(err);
    });
  }

  public async saveReportOther(report:ReportOther) {
    try {
      let reportDoc = report.serialize();
      let db1 = this.addDB(this.prefs.DB.reports_other);
      let res = await db1.upsert(report._id, (doc) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = reportDoc;
          doc._rev = rev;
        } else {
          doc = reportDoc;
          delete doc._rev;
        }
        return doc;
      });
      Log.l("saveReportOther(): Save ReportOther via upsert, result:\n", res);
      if(!res.ok && !res.updated) {
        // throw new Error(`saveReportOther(): Upsert error for document '${report._id}'`)
        throw new Error(res);
      } else {
        res = await this.syncSquaredToServer(this.prefs.DB.reports_other);
        Log.l("saveReportOther(): Done synchronizing ReportOther to server.");
        return res;
      }
    } catch(err) {
      Log.l(`saveReportOther(): Error saving ReportOther '${report._id}'`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public async getReportsForTech(tech:string, dates?:any):Promise<Array<Report>> {
    let woArray:Array<Report> = [];
    let res:any = {};
    try {
      let u:string = this.ud.getUsername();
      let p:string = this.ud.getPassword();
      let query:any = {selector: {username: {$eq: tech}}, limit:10000};
      Log.l("getReportsForTech(): Using database: ", this.prefs.DB.reports);
      let db1 = this.addDB(this.prefs.DB.reports);
      if(dates) {
        if(dates.start !== undefined && dates.end === undefined) {
          query.selector = {$and: [{username: {$eq: tech}}, {rprtDate: {$eq: dates['start']}}]};
          let out:any = await db1.createIndex({
            index: {
              fields: [
                'username'
              ]
            }
          });
          Log.l("getReportsForTech(): created index, result:\n", out);
        } else if(dates.start !== undefined && dates.end !== undefined) {
          query.selector = { $and: [{ username: { $eq: tech } }, {rprtDate: { $geq: dates['start'] }}, {rprtDate: {$leq: dates['end']}}]};
          let out:any = await db1.createIndex({
            index: {
              fields: [
                'username',
                'rprtDate'
              ]
            }
          });
          Log.l("getReportsForTech(): created index, result:\n", out);
        }
      } else {
        let out:any = await db1.createIndex({
          index: {
            fields: [
              'username'
            ]
          }
        });
        Log.l("getReportsForTech(): created index, result:\n", out);
      }
      Log.l("getReportsForTech(): now running query:\n", query);
      res = await db1.find(query);
      Log.l(`getReportsForTech(): Got reports for '${tech}':\n`, res);
      // let woArray = new Array<Report>();
      for(let doc of res.docs) {
        let wo = new Report();
        wo.readFromDoc(doc);
        woArray.push(wo);
      }
      Log.l("getReportsForTech(): Returning final reports array:\n", woArray);
      return woArray;
    } catch(err) {
      Log.l(`getReportsForTech(): Error getting reports for '${tech}'.`);
      Log.l(err);
      return woArray;
    }
  }

  public async getReportsOtherForTech(tech:string, dates?:any):Promise<Array<ReportOther>> {
    let woArray:Array<ReportOther> = [];
    let res:any = {};
    try {
      let u:string = this.ud.getUsername();
      let p:string = this.ud.getPassword();
      let query:any = {selector: {username: {$eq: tech}}, limit:10000};
      Log.l("getReportsOtherForTech(): Using database: ", this.prefs.DB.reports_other);
      if(dates) {
        if(dates.start !== undefined && dates.end === undefined) {
          query.selector = {$and: [{username: {$eq: tech}}, {report_date: {$eq: dates.start}}]};
        } else if(dates.start !== undefined && dates.end !== undefined) {
          query.selector = { $and: [{ username: { $eq: tech } }, {report_date: { $geq: dates.start }}, {report_date: {$leq: dates.end}}]};
        }
      }
      let db1 = this.addDB(this.prefs.DB.reports_other);
      let out:any = await db1.createIndex({
        index: {
          fields: [
            'username',
            'rprtDate'
          ]
        }
      });
      res = await db1.find(query);
      Log.l(`getReportsOtherForTech(): Got reports for '${tech}':\n`, res);
      // let woArray = new Array<Report>();
      for(let doc of res.docs) {
        let wo = new ReportOther();
        wo.readFromDoc(doc);
        woArray.push(wo);
      }
      Log.l("getReportsOtherForTech(): Returning final reports array:\n", woArray);
      return woArray;
    } catch(err) {
      Log.l(`getReportsOtherForTech(): Error getting reports for '${tech}'.`);
      Log.l(err);
      return woArray;
    }
  }

  public async getAllData(tech:Employee):Promise<any> {
    // return new Promise((resolve, reject) => {
    try {
      let data = { employee: [], sites: [], reports: [], otherReports: [], payrollPeriods: [], shifts: [], messages: [], config: {} };
      let username = tech.getUsername();
      data.employee.push(tech);
        // this.getReportsForTech(username).then(res => {
      let reports:Report[] = await this.getReportsForTech(username);
      data.reports = reports;
      // for (let doc of res) {
      //   let report = new Report();
      //   report.readFromDoc(doc);
      //   data.reports.push(report);
      // }
      let others:ReportOther[] = await this.getReportsOtherForTech(username);
      data.otherReports = others;
      // for(let doc of res) {
      //   let other = new ReportOther();
      //   other.readFromDoc(doc);
      //   data.otherReports.push(other);
      // }
      let sites:Jobsite[] = await this.getJobsites();
      data.sites = sites;
      // for (let doc of res) {
      //   let site = new Jobsite();
      //   site.readFromDoc(doc);
      //   data.sites.push(site);
      // }
      let messages:Message[] = await this.getMessages();
      // for(let doc of res) {
      //   let msg = new Message();
      //   msg.readFromDoc(doc);
      //   data.messages.push(msg);
      // }
      data.messages = messages;
      let res:any = await this.getAllConfigData();
      let keys = Object.keys(res);
      for(let key of keys) {
        data.config[key] = res[key];
      }
      Log.l("getAllData(): Success, final data to be returned is:\n", data);
      return data;
    } catch(err) {
      Log.l("getAllData(): Error retrieving all data!");
      Log.e(err);
      throw new Error(err);
    }
  }

  public getReports(user: string) {
    return new Promise((resolve,reject) => {
      let u = this.ud.getUsername();
      let p = this.ud.getPassword();
      // this.loginToServer(u, p, this.prefs.DB.login).then((res) => {
      // 	if(res) {
      		let db1 = this.addDB(this.prefs.DB.reports);
          db1.allDocs({include_docs: true}).then((result) => {
		        let data = [];
						let docs = result.rows.map((row) => {
							if( row && row.id[0] !== '_' && row.doc && row.doc.username === user ) { data.push(row.doc); }
							resolve(data);
						});
					}).catch((error) => {
		      	Log.l("getReports(): Error getting reports for user.");
		      	Log.e(error);
		      	resolve([]);
		      });
      // 	} else {
      // 		resolve([]);
      // 	}
      // }).catch((err) => {
			// 	Log.l("getReports(): Error logging in to server.")
			// 	Log.e(err);
			// 	resolve([]);
			// });
		});
  }

  public getJobsites():Promise<Array<Jobsite>> {
    return new Promise((resolve,reject) => {
      let db1 = this.addDB(this.prefs.DB.jobsites);
      db1.allDocs({include_docs:true}).then(res => {
        let sites = new Array<Jobsite>();
        for(let row of res.rows) {
          let doc = row.doc;
          if (doc && row.id[0] !== '_') {
            let site = new Jobsite();
            site.readFromDoc(doc);
            sites.push(site);
          }
        }
        Log.l("getJobsites(): Success, final output array is:\n", sites);
        resolve(sites);
      }).catch(err => {
        Log.l("getJobsites(): Error getting all jobsites.");
        Log.e(err);
        reject(err);
      })
    });
  }

  public async getMessages():Promise<Array<Message>> {
    return this.fetchNewMessages();
  }

  public fetchNewMessages():Promise<Array<Message>> {
    Log.l('fetchNewMessages(): Getting messages...');
    let out = new Array<Message>();
    let remote = new Array<Message>();
    let local = new Array<Message>();
    let db = this.prefs.getDB();
    return new Promise((resolve, reject) => {
      let dbname = db.messages;
      let db1 = this.addDB(dbname);
      db1.allDocs({include_docs: true}).then(res => {
        for(let row of res.rows) {
          let doc = row.doc;
          if(doc && row.id[0] !== '_') {
            let msg = new Message();
            msg.readFromDoc(row.doc);
            let date = msg.getMessageDate().toExcel(true);
            let duration = msg.getMessageDuration();
            let expires = date + duration;
            let now = moment().toExcel();
            if (now <= expires) {
              out.push(msg);
            }
          }
          let _orderBy = function (a:Message, b:Message) {
            let tA = a.date;
            let tB = b.date;
            return tA < tB ? 1 : tA > tB ? -1 : 0;
          }
          out.sort(_orderBy);
        }
        // Log.l("fetchNewMessages(): Final remote messages array is:\n", remote);
        // Log.l("fetchNewMessages(): Now getting local messages...");
        // return db1.allDocs({include_docs:true});
      // }).then(res => {
        // Log.l("fetchNewMessages(): Done getting local messages:\n", res);
        // for(let row of res.rows) {
        //   let doc = row.doc;
        //   if(doc) {
        //     let msg = new Message();
        //     msg.readFromDoc(row.doc);
        //     local.push(msg);
        //   }
        // }
        // Log.l("fetchNewMessages(): Final output of local messages is:\n", local);
        // let j = -1;
        // let msg = null, lmsg = null;
        // for(msg of remote) {
        //   let i = 0, match = -1;
        //   j++;
        //   for(lmsg of local) {
        //     // Log.l(`fetchNewMessages():Index ${j}.${i} remote '${msg._id}' to local '${lmsg._id}'...`);
        //     if(msg._id === lmsg._id && lmsg.read == true) {
        //       // Log.l(`fetchNewMessages(): ======> Match at index ${j}.${i}!`);
        //       match = i;
        //     }
        //     i++;
        //   }
        //   if(match === -1) {
        //     out.push(msg);
        //     continue;
        //   } else {
        //     out.push(local[match]);
        //   }
        // }
        // Log.l("fetchNewMessages(): Final output of new messages is:\n", out);
        resolve(out);
      }).catch(err => {
        Log.l("fetchNewMessages(): Error retrieving messages from server.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveReadMessage(message:Message) {
    return new Promise((resolve, reject) => {
      let dbname = this.prefs.DB.messages;
      let db1 = this.addDB(dbname);
      let out = message.serialize();
      Log.l("saveReadMessage(): Now attempting to save serialized message:\n", out);
      // db1.putIfNotExists()
      db1.upsert(message._id, (doc) => {
        if(doc && doc._rev) {
          doc.read = true;
          return doc;
        } else {
          return message;
        }
      }).then(res => {
        Log.l("saveReadMessage(): Successfully saved message, result:\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("saveReadMessage(): Error saving message:\n", message);
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveComment(comment:Comment) {
    return new Promise((resolve,reject) => {
      let db1 = this.addDB(this.prefs.DB.comments);
      let newDoc = comment.serialize();
      Log.l("saveComment(): Attempting to save comment to server:\n", comment);
      Log.l(newDoc);
      db1.upsert(newDoc['_id'], (doc) => {
        if(doc) {
          let id = doc._id;
          let rev = doc._rev;
          doc = newDoc;
          doc._rev = rev;
        } else {
          doc = newDoc;
          delete doc['_rev'];
        }
        return doc;
      }).then(res => {
        Log.l("saveComment(): Succeeded in submitting comment!\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("saveComment(): Error submitting comment!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getAllConfigData() {
    Log.l("getAllConfigData(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, and shiftTimes...");
    let dbConfig = this.prefs.DB.config;
    let db1 = this.addDB(dbConfig);
    return new Promise((resolve, reject) => {
      // this.syncFromServer(dbConfig).then(res => {
        // return
        let keys:string[] = [ 'client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shiftstarttime', 'other_reports' ];
        db1.allDocs({ keys: keys, include_docs: true })
      // })
      .then((records) => {
        Log.l("getAllConfigData(): Retrieved documents:\n", records);
        let results = { client: [], location: [], locid: [], loc2nd: [], rotation: [], shift: [], shiftlength: [], shiftstarttime: [], report_types: [], training_types: [] };
        for (let record of records.rows) {
          let type = record.id;
          let types = record.id + "s";
          if (type === 'other_reports') {
            let doc = record.doc;
            let report_types = doc.report_types;
            let training_types = doc.training_types;
            results.report_types = report_types;
            results.training_types = training_types;
          } else {
            let doc = record.doc;
            if (doc) {
              if (doc[types]) {
                for (let result of doc[types]) {
                  results[type].push(result);
                }
              } else {
                for (let result of doc.list) {
                  results[type].push(result);
                }
              }
            }
          }
        }
        Log.l("getAllConfigData(): Final config data retrieved is:\n", results);
        resolve(results);
      }).catch((err) => {
        Log.l("getAllConfig(): Error getting all config docs!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public async savePhoneInfo(tech:Employee, data:any) {
    try {
      let dbs = this.prefs.getDB();
      let phone_db = this.prefs.DB.phoneInfo;
      let db1 = this.addDB(phone_db);
      let userid = tech.getUsername();
      let timestamp = moment();
      let id = `${userid}_${timestamp.format()}`;
      let phoneDoc = {'_id': id, 'username': tech.getUsername(), 'timestampM': timestamp.format(), 'timestamp': timestamp.toExcel(), 'device': data};
      let res:any = await db1.upsert(id, (doc) => {
        if(doc) {
          let rev = doc._rev;
          phoneDoc['_rev'] = rev;
          return phoneDoc;
        } else {
          doc = phoneDoc;
          delete doc['_rev'];
          return doc;
        }
      });
      if(!res.ok && !res.updated) {
        Log.l("savePhoneInfo(): Error updating user phone info!");
        throw new Error("Error updating user phone info");
      } else {
        Log.l("savePhoneInfo(): Successfully updated user phone info!");
        return res;
      }
    } catch(err) {
      Log.l(`savePhoneInfo(): Unable to save phone info.`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public async saveGeolocation(location:any) {
    try  {
      let db = this.prefs.getDB();
      let db1 = this.addDB(db.geolocation);
      let locDoc:any = oo.clone(location);
      let user = this.ud.getUsername();
      let ts   = moment();
      locDoc.username = user;
      let id = `${user}_${ts.format()}`;
      locDoc._id = id;
      let res = await db1.upsert(id, (doc) => {
        if(doc && doc._id && doc._rev) {
          let rev = doc._rev;
          doc = locDoc;
          doc._rev = rev;
        } else {
          doc = locDoc;
          delete doc._rev;
        }
        return doc;
      });
      if(!res.ok && !res.updated) {
        Log.l("saveGeolocation(): Upsert error!");
        Log.w(res);
        throw new Error(res);
      } else {
        Log.l("saveGeolocation(): Successfully saved!");
        return res;
      }
    } catch(err) {
      Log.l(`saveGeolocation(): Error saving location!`);
      Log.e(err);
      throw new Error(err);
    }

  }

  public async deleteAllLocalDatabases() {
    try {
      // let dbnames = await this.PouchDB.allDbs();
      // Log.l("resetAllAppData(): Got list of local databases:\n", dbnames);
      // let count = dbnames.length;
      // for(let dbname of dbnames) {
      //   let db = this.addDB(dbname);
      //   try {
      //     let res = await db.destroy();
      //     Log.l(`resetAllAppData(): Successfully destroyed database '${dbname}'`);
      //   } catch(err) {
      //     Log.l(`resetAllAppData(): Error resetting database '${dbname}'`);
      //     Log.e(err);
      //     throw new Error(err);
      //   }
      // }
      // return count;
      // // return res;
      Log.l(`deleteAllLocalDatabases(): This function is currently disabled due to pouchdb-all-dbs causing startup problems.`);
      return false;
    } catch(err) {
      Log.l(`deleteAllLocalDatabases(): Error resetting local data.`);
      Log.e(err);
      throw new Error(err);
    }
  }
}
