import { Injectable, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import * as PouchDB from 'pouchdb';
import { NativeStorage } from 'ionic-native';


@Injectable()
export class AddUsersSrvc {

  data: any;
  db: any;
  username: any;
  password: any;
  remote: any;
  options: Object;
  _docs: Array<Object>;


  constructor(public http: Http, public zone: NgZone) {

    // this.db = new PouchDB('_users');
    // this.username = 'mike';
    // this.password = 'Dorothyinkansas4life';
    // this.remote = 'http://martiancouch.hplx.net/_users';
    
    this.db = new PouchDB('reports');
    this.username = 'mike';
    this.password = 'q1G92147wS794s630Z96ZRX3IGQOI';
    this.remote = 'http://192.168.0.140:5984/reports';

    this.options = {
      live: true,
      retry: true,
      continuous: false,
      auth: { username: this.username, password: this.password }
    };

    this.db.sync(this.remote, this.options);
  }

  postDbDocs(docs) { 
    this._docs = docs;
    this.db.bulkDocs(this._docs) }
}
