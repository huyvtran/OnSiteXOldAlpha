import { Http                                         } from '@angular/http'                     ;
import { Component, ViewChild                         } from '@angular/core'                     ;
import { Platform, Nav, ToastController, Events, App  } from 'ionic-angular'                     ;
import { StatusBar                                    } from '@ionic-native/status-bar'          ;
import { SplashScreen                                 } from '@ionic-native/splash-screen'       ;
import { Storage                                      } from '@ionic/storage'                    ;
import { Push, PushObject, PushOptions                } from '@ionic-native/push'                ;
import { LocalNotifications                           } from '@ionic-native/local-notifications' ;
import { AppVersion                                   } from '@ionic-native/app-version'         ;
import { AppUpdate                                    } from '@ionic-native/app-update'          ;
import { UserData                                     } from '../providers/user-data'            ;
import { PouchDBService                               } from '../providers/pouchdb-service'      ;
import { DBSrvcs                                      } from '../providers/db-srvcs'             ;
import { SrvrSrvcs                                    } from '../providers/srvr-srvcs'           ;
import { AuthSrvcs                                    } from '../providers/auth-srvcs'           ;
import { AlertService                                 } from '../providers/alerts'               ;
import { NetworkStatus                                } from '../providers/network-status'       ;
import { GeolocService                                } from '../providers/geoloc-service'       ;
import { Log, CONSOLE, moment, Moment                 } from '../config/config.functions'        ;
import { DOMTimeStamp, Coordinates, Position          } from '../config/geoloc'                  ;
import { HomePage                                     } from '../pages/home/home'                ;
import { MessageService                               } from '../providers/message-service'      ;
import { TabsComponent                                } from '../components/tabs/tabs'           ;
import { Preferences                                  } from '../providers/preferences'          ;
import { TranslateService                             } from '@ngx-translate/core'               ;
import { SmartAudio                                   } from '../providers/smart-audio'          ;
import { Jobsite                                      } from '../domain/jobsite'                 ;
import { ReportOther                                  } from '../domain/reportother'             ;
import { WorkOrder                                    } from '../domain/workorder'               ;
import { Employee                                     } from '../domain/employee'                ;
import { Shift                                        } from '../domain/shift'                   ;
import { PayrollPeriod                                } from '../domain/payroll-period'          ;
import { Message                                      } from '../domain/message'                 ;
import { IonDigitKeyboardCmp, IonDigitKeyboardOptions } from '../components/ion-digit-keyboard/' ;

import * as rxjs from 'rxjs';

@Component({ templateUrl: 'app.html' })
export class OnSiteApp {
  @ViewChild(Nav) nav: Nav;

  public title                   : string  = 'OnSiteHome'      ;
  public rootPage                : any                         ;
  public pouchOptions            : any     = { }               ;
  public backButtonPressedAlready: boolean = false             ;
  public static status           : any     = {bootError: false};
  public static PREFS            : any     = new Preferences() ;
  public prefs                   : any     = OnSiteApp.PREFS   ;
  public status                  : any     = OnSiteApp.status  ;
  public network                 : any                         ;
  public data                    : any                         ;
  private ui                     : any                         ;
  public tech                    : Employee                    ;
  public appLanguages            : Array<string> = ['en','es'] ;
  public keysetup                : any                         ;
  public messageCheckTimeout     : any                         ;

  constructor(
                public platform    : Platform          ,
                public toast       : ToastController   ,
                public statusBar   : StatusBar         ,
                public splashScreen: SplashScreen      ,
                public net         : NetworkStatus     ,
                public push        : Push              ,
                public localNotify : LocalNotifications,
                public storage     : Storage           ,
                public version     : AppVersion        ,
                public db          : DBSrvcs           ,
                public ud          : UserData          ,
                public auth        : AuthSrvcs         ,
                public server      : SrvrSrvcs         ,
                public events      : Events            ,
                public tabs        : TabsComponent     ,
                public app         : App               ,
                public translate   : TranslateService  ,
                public alert       : AlertService      ,
                public audio       : SmartAudio        ,
                public msg         : MessageService    ,
                public appUpdate   : AppUpdate         ,
                // public homepage    : HomePage          ,
  ) {
    window['onsiteapp'] = this;
    window['moment'] = moment;
    window['rxjs'] = rxjs;
    this.initializeApp();
  }

  initializeApp() {
    Log.l("AppComponent: Initializing app...");
    this.keysetup = {visible: false, width: '100%', swipeToHide: true};

    this.platform.ready().then(res => {
      Log.l("OnSite: platform ready returned:\n", res);
      return this.getAppVersion();
    }).then((res) => {
      this.platform.registerBackButtonAction(() => {
        if (this.backButtonPressedAlready) {
          this.platform.exitApp();
        } else {
          this.alert.showToast("Press back again to exit", 2000);
          this.backButtonPressedAlready = true;
          setTimeout(() => { this.backButtonPressedAlready = false; }, 2000)
        }
      });
      this.translate.setDefaultLang('en');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      NetworkStatus.watchForDisconnect();
      // this.pouchOptions = { adapter: 'websql', auto_compaction: true };
      this.pouchOptions = { auto_compaction: true };
      window["PouchDB"] = PouchDBService.PouchInit();
      window["Platform"] = this.platform;
      window["PouchDB" ].defaults(this.pouchOptions);

      // window[ "PouchDB"].debug.enable('*');
      window[ "PouchDB"].debug.disable('*');
      window[ 'moment' ] = moment;
      window[ 'Log'    ] = Log;
      window[ 't1'     ] = CONSOLE.t1;
      window[ 'c1'     ] = CONSOLE.c1;
      this.preloadAudioFiles();

      let callingClass = this;
      // this.checkPreferences().then(() => {
      //   Log.l("OnSite.initializeApp(): Done messing with preferences, now checking login...");
      //   let language = this.prefs.getLanguage();
      //   this.translate.addLangs(this.appLanguages);
      //   if (language !== 'en') {
      //     this.translate.use(language);
      //   }
      this.translate.get(['spinner_app_loading']).subscribe((result) => {
        let lang = result;
        if(!callingClass.ud.isBootError()) {
          callingClass.bootApp().then(res => {
            Log.l("OnSite.initializeApp(): bootApp() returned successfully!");
            callingClass.alert.hideSpinner(0, true).then(res => {
              callingClass.ud.setAppLoaded(true);
              callingClass.rootPage = 'OnSiteHome';
              setTimeout(() => {
                Log.l("OnSite.bootApp(): Publishing startup event after timeout!");
                callingClass.events.publish('startup:finished', true);
              }, 50);
            })
          }).catch(err => {
            Log.l("OnSite.initializeApp(): bootApp() returned error.");
            Log.e(err);
            callingClass.ud.setAppLoaded(true);
            callingClass.rootPage = 'Login';
            setTimeout(() => {
            }, 50);
          });
        } else {
          Log.w("OnSite.initializeApp(): app boot error has been thrown.");
          callingClass.ud.setAppLoaded(true);
          setTimeout(() => {
            callingClass.rootPage = 'Login';
          }, 500);
        }
      });
    }).catch(err => {
      Log.l("initializeApp(): Error in getAppVersion() or platform.ready()! That's bad! Or in checkPreferences or translate.get or something!");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error starting app, please tell developers:<br>\n<br>\n" + err.message);
    });
    // }).catch(err => {
    //   Log.l("initializeApp(): Error with getAppVersion() or platform.ready()! That's bad!");
    //   Log.e(err);
    // });
  }

  bootApp() {
    return new Promise((resolve,reject) => {
      let callingClass = this;
      Log.l("OnSite.bootApp(): Called.")
      this.checkPreferences().then(() => {
        Log.l("OnSite.bootApp(): Done messing with preferences, now checking login...");
        let language = this.prefs.getLanguage();
        if (language !== 'en') {
          this.translate.use(language);
        }
        return this.checkLogin();
      }).then(res => {
        Log.l("OnSite.bootApp(): User passed login check. Should be fine. Checking for Android app update.");
        return this.checkForAndroidUpdate();
      }).then(res => {
        Log.l("OnSite.bootApp(): Done with Android update check. Now getting all data from server.");
        return this.server.getAllData(this.tech);
      }).then(res => {
        this.data = res;
        this.ud.setData(this.data);
        return this.msg.getMessages();
      }).then(res => {
        Log.l("OnSite.bootApp(): Got new messages.");
        return this.ud.checkPhoneInfo();
      }).then(res => {
        let tech = this.ud.getData('employee')[0];
        this.checkForNewMessages();
        let pp = this.ud.createPayrollPeriods(this.data.employee[0], this.prefs.getPayrollPeriodCount());
        if(res) {
          Log.l("OnSite.bootApp(): Got phone data:\n", res);
          this.server.savePhoneInfo(tech, res).then(res => {
            resolve(true);
          }).catch(err => {
            Log.l("OnSite.bootApp(): Error saving phone info to server!");
            Log.e(err);
            reject(err);
          });
        } else {
          resolve(true);
        }
      }).catch(err => {
        Log.l("OnSite.bootApp(): Error with login or with publishing startup:finished event!");
        Log.e(err);
        reject(false);
      });
    });
  }

  finishStartup() {
    return new Promise((resolve,reject) => {
      try {
        Log.l("finishStartup(): Now attempting to publish startup:finished event and set home page...");
        this.events.publish('startup:finished', HomePage);
        resolve(true);
      } catch(err) {
        Log.l("finishStartup(): Error publishing startup:finished event, and/or seting root page!");
        Log.e(err);
        reject(false);
      }
    });
  }

  public checkForNewMessages() {
    let interval = this.prefs.getMessageCheckInterval();
    this.messageCheckTimeout = setInterval(() => {
      Log.l("checkForNewMessages(): Fetching new messages...");
      this.msg.getMessages().then(res => {
        Log.l("checkForNewMessages(): Checked sucessfully.");
      }).catch(err => {
        Log.l("checkForNewMessages(): Caught error. Silently dying.");
        Log.e(err);
      });
    // }, 1000 * 60 * 15);
    // }, 1000 * 60 * 1);
    }, 1000 * 60 * interval);
  }

  showToast(text: string) {
    let toast = this.toast.create({
      message: text,
      duration: 3000
    });
    toast.present();
  }

  checkPreferences() {
    return new Promise((resolve,reject) => {
      this.storage.get('PREFS').then((storedPrefs) => {
        let updatePrefs = storedPrefs;
        if(storedPrefs !== null && storedPrefs !== undefined && typeof storedPrefs !== 'undefined' && storedPrefs !== 'undefined') {
          updatePrefs = this.prefs.comparePrefs(storedPrefs);
        }
        this.prefs.setPrefs(updatePrefs);
        Log.l("OnSite: Preferences at version %d, saving again.", this.prefs.USER.preferencesVersion);
        this.storage.set('PREFS', updatePrefs).then((res) => {
          Log.l("OnSite: Preferences stored:\n", this.prefs.getPrefs());
          resolve(res);
        }).catch(err => {
          Log.l("OnSite: Error while trying to save preferences.");
          Log.e(err);
          reject(err);
        });
      }).catch((err) => {
        Log.l("OnSite: Error while checking for stored preferences!");
        Log.e(err);
        reject(err);
      });
    });
  }

  checkLogin() {
    return new Promise((resolve,reject) => {
      this.auth.areCredentialsSaved().then((res) => {
        Log.l("checkLogin(): Got saved credentials back:\n", res);
        Log.l("... using them to log in to the server...");
        let loginData = res;
        let u = loginData['username'];
        let p = loginData['password'];
        this.ui = {u:u, p:p};
        return this.server.loginToServer(u, p, '_session');
      }).then((res) => {
        Log.l("checkLogin(): Successfully logged in! Now retrieving config...");
        let profile = this.ud.getTechProfile();
        let tech = new Employee();
        tech.readFromDoc(profile);
        this.tech = tech;
        return this.db.getAllConfigData();
      }).then(res => {
        Log.l("checkLogin(): Successfully retrieved config data...");
        this.ud.setSesaConfig(res);
        resolve(res);
      }).catch((err) => {
        Log.l("checkLogin(): Error checking for saved credentials. User not authenticated properly!");
        Log.e(err);
        reject(err);
      });
    });
  }

  checkMessages() {

  }

  preloadAudioFiles() {
    this.audio.preload('overtime'         , 'assets/audio/nospoilers.mp3' )  ;
    this.audio.preload('deletereport'     , 'assets/audio/nospoilers2.mp3')  ;
    this.audio.preload('help'             , 'assets/audio/nospoilers3.mp3')  ;
    this.audio.preload('dropit'           , 'assets/audio/nospoilers4.mp3')  ;
    this.audio.preload('sorry'            , 'assets/audio/nospoilers5.mp3')  ;
    this.audio.preload('deleteotherreport', 'assets/audio/nospoilers6.mp3')  ;
    this.audio.preload('funny'            , 'assets/audio/nospoilers7.mp3')  ;
    this.audio.preload('laugh'            , 'assets/audio/nospoilers8.mp3')  ;
  }

  getAppVersion() {
    return new Promise((resolve) => {
      if (this.platform.is('cordova')) {
        return this.version.getVersionNumber().then(res => {
          this.ud.appdata.version = res;
          resolve(true);
        }).catch(err => {
          Log.l("Error getting app version!");
          Log.e(err);
          resolve(false);
        });
      } else {
        this.ud.appdata.version += "(b)";
        resolve(true);
      }
    });
  }

  public checkForAndroidUpdate() {
    return new Promise((resolve,reject) => {
      if(this.platform.is('android') && this.platform.is('cordova')) {
        this.appUpdate.checkAppUpdate(this.prefs.SERVER.androidUpdateURL).then(res => {
          Log.l("checkForAndroidUpdate(): Succeeded.");
          resolve(res);
        }).catch(err => {
          Log.l("checkForAndroidUpdate(): Error!");
          Log.e(err);
          reject(err);
        });
      } else {
        Log.l("checkForAndroidUpdate(): Platform is not Android. No need for a check.");
        resolve("Platform is not Android, not running update check");
      }
    });
  }
}

