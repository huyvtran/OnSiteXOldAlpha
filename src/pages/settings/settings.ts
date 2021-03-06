// import { IonDigitKeyboardCmp, IonDigitKeyboardOptions                        } from 'components/ion-digit-keyboard' ;
import { Component, OnInit, NgZone, OnDestroy, AfterViewInit                 } from '@angular/core'             ;
import { IonicPage, NavController, Platform, ModalController, ViewController } from 'ionic-angular'             ;
import { DBService                                                           } from 'providers/db-service'      ;
import { Login                                                               } from 'pages/login/login'         ;
import { Log, moment, Moment                                                 } from 'domain/onsitexdomain'      ;
import { Employee, PayrollPeriod                                             } from 'domain/onsitexdomain'      ;
import { AuthSrvcs                                                           } from 'providers/auth-srvcs'      ;
import { ServerService                                                       } from 'providers/server-service'  ;
import { AlertService                                                        } from 'providers/alerts'          ;
import { TranslateService                                                    } from '@ngx-translate/core'       ;
import { AppVersion                                                          } from '@ionic-native/app-version' ;
import { StorageService                                                      } from 'providers/storage-service' ;
import { Preferences                                                         } from 'providers/preferences'     ;
import { UserData                                                            } from 'providers/user-data'       ;
import { Vibration                                                           } from '@ionic-native/vibration'   ;
import { TabsService                                                         } from 'providers/tabs-service'    ;
import { Pages                                                               } from 'domain/onsitexdomain'      ;


@IonicPage({ name: 'Settings' })
@Component({
  selector: 'page-settings'   ,
  templateUrl: 'settings.html',
})

export class Settings implements OnInit,OnDestroy,AfterViewInit {
  public title           : string     = "App Settings"    ;
  public lang            : any                            ;
  public confirmTitle    : string     = ""                ;
  public logOutMsg       : string     = ""                ;
  public languages       : Array<any> = []                ;
  public selectedLanguage: any                            ;
  public language        : any        = null              ;
  public appName         : string     = "SESA OnSiteX"    ;
  public appVersion      : string     = "?.?.?"           ;
  public sounds          : boolean    = false             ;
  public stayInReports   : boolean    = true              ;
  public dataReady       : boolean    = false             ;
  // public static PREFS    : any        = new Preferences() ;
  // public prefs           : any        = Settings.PREFS    ;
  public keysetup        : any                            ;
  public advanced        : boolean    = false             ;
  public weeksToShowList : Array<number> = []             ;
  public weeksToShow     : number        = this.prefs.getUserPayrollPeriodCount();

  constructor(
    public navCtrl   : NavController    ,
    public platform  : Platform         ,
    public vibration : Vibration        ,
    public prefs     : Preferences      ,
    public auth      : AuthSrvcs        ,
    public server    : ServerService        ,
    public alert     : AlertService     ,
    // public tabs      : TabsComponent    ,
    public tabServ   : TabsService      ,
    public translate : TranslateService ,
    public version   : AppVersion       ,
    public storage   : StorageService   ,
    public modalCtrl : ModalController  ,
    public ud        : UserData         ,
    public zone      : NgZone           ,
  ) {
    window["onsitesettings"] = this;
    this.keysetup = { visible: false, width: '100%', swipeToHide: true };
  }

  ionViewDidEnter() {
    Log.l("Settings: ionViewDidEnter() called");
  }

  ngOnInit() {
    Log.l("Settings: ngOnInit() called");
    if (!(this.ud.isAppLoaded() && this.ud.isHomePageReady())) {
      this.tabServ.goToPage('OnSiteHome');
    } else {
      this.runFromInit();
    }
  }

  ngOnDestroy() {
    Log.l("Settings: ngOnDestroy() fired");
  }

  ngAfterViewInit() {
    Log.l("Settings: ngAfterViewInit() fired");
    this.tabServ.setPageLoaded(Pages.Settings);
  }

  public runFromInit() {
    let translations = [
      'confirm_logout_title',
      'confirm_logout_message',
      'confirm_app_restart_title',
      'confirm_app_restart_text',
      'show_clock',
      'show_clock_help',
      'sync_data',
      'sync_data_help',
      'spinner_sending_reports_to_server',
      'manual_sync_error',
      'manual_sync_success',
      'error',
      'success',
    ]
    this.lang = this.translate.instant(translations);
    for(let i = 1; i < 9; i++) {
      this.weeksToShowList.push(i);
    }
    let en = { value: 'en', display: 'English' };
    let es = { value: 'es', display: 'Español' };
    this.languages = [en, es];
    let currentLang = this.translate.currentLang;
    for (let language of this.languages) {
      if (currentLang === language.value) {
        this.selectedLanguage = language;
        this.language = language;
        break;
      }
    }
    if (this.language === null) {
      this.translate.use('en');
      this.language = this.languages[0];
    }

    this.sounds = this.prefs.USER.audio;

    if(this.platform.is('cordova')) {
      this.version.getAppName().then(res => {
        this.appName = res;
        return this.version.getVersionNumber();
      }).then(res => {
        this.appVersion = res;
        Log.l(`Settings: got app name '${this.appName}' and version '${this.appVersion}'.`);
        this.dataReady = true;
      }).catch(err => {
        Log.l(`Settings: unable to get app name and version, cordova probably not available.`);
        Log.e(err);
        this.dataReady = true;
      });
    } else {
      this.appVersion = this.ud.appdata.version;
      this.appName    = this.ud.appdata.title;
      this.dataReady = true;
    }
  }

  public terminateApp() { this.platform.exitApp(); }

  public logoutOfApp() {
    Log.l("User clicked logout button.");
    this.auth.logout().then((res) => {
      Log.l("Done logging out. Reloading app.");
      this.ud.reloadApp();
      // this.tabs.goToPage('Login', {mode: 'page'});
    });
  }

  public confirmLogout() {
    let lang = this.lang;
    let title = lang['confirm_logout_title'];
    let text  = lang['confirm_logout_message'];
    this.alert.showConfirm(title, text).then((leave) => {
      if(leave) {
        this.logoutOfApp();
      }
    }).catch(err => {
      Log.l("confirmLogout(): Error confirming logout!");
      Log.e(err);
    });
  }

  public updateLanguage(language:any) {
    this.selectedLanguage = language;
    if(language.value === 'es') {
      this.translate.use('es');
    } else {
      this.translate.use('en');
    }
    this.prefs.setUserPref('language', language.value);
    this.savePreferences().then(res => {
      Log.l("updateLanguage(): Saved language setting.");
    }).catch(err => {
      Log.l("updateLanguage(): Error saving language setting.");
      Log.e(err);
    })
  }

  public sendComment() {
    // let lang = this.translate.instant(['send_comment_title', 'send_comment_message'])
    // this.alert.showAlert(lang['send_comment_title'], lang['send_comment_message']);
    let commentModal = this.modalCtrl.create('Comment', {}, {enableBackdropDismiss: true, cssClass: 'comment-modal'});
    commentModal.onDidDismiss(data => {
      Log.l("sendComment(): Comment modal dismissed.");
      if(data) {
        Log.l(data);
      }
    });
    commentModal.present();
  }

  public toggleSounds() {
    this.prefs.USER.audio = this.sounds;
    this.savePreferences().then(res => {
      Log.l("toggleSounds(): Sounds turned to '%s' and preferences saved:\n", this.prefs.USER.audio);
      Log.l(this.prefs);
    }).catch(err => {
      Log.l("toggleSounds(): Error saving preferences.");
      Log.e(err);
    });
  }

  public async toggleVibration(evt?:any) {
    try {
      let res:any = await this.savePreferences();
      Log.l(`toggleVibration(): vibration toggled to '${this.prefs.USER.vibration}'.`)
      if(this.prefs.USER.vibration) {
        this.vibration.vibrate(50);
      }
      return res;
    } catch(err) {
      Log.l(`toggleVibration(): Error toggling vibration.`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public toggleStayInReports() {
    Log.l("toggleStayInReports(): set to '%s'", this.stayInReports);
    this.prefs.USER.stayInReports = this.stayInReports;
    this.savePreferences().then(res => {
      Log.l("toggleStayInReports(): StayInReports turned to '%s' and preferences saved:\n", this.prefs.USER.stayInReports);
      Log.l(this.prefs);
    }).catch(err => {
      Log.l("toggleSounds(): Error saving preferences.");
      Log.e(err);
    });
  }

  public savePreferences() {
    let prefsObj = { DB: this.prefs.DB, SERVER: this.prefs.SERVER, USER: this.prefs.USER, DEVELOPER: this.prefs.DEVELOPER };
    return new Promise((resolve, reject) => {
      this.storage.persistentSet('PREFS', prefsObj).then(res => {
        Log.l("savePreferences(): Saved preferences successfully.\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("savePreferences(): Error saving preferences!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public toggleClock() {
    this.dataReady = !this.dataReady;
  }

  public clockHelp() {
    let lang = this.lang;
    this.alert.showAlert(lang['show_clock'], lang['show_clock_help']);
  }

  public confirmAppReload() {
    let lang = this.lang;
    let title = lang['confirm_app_restart_title'];
    let text = lang['confirm_app_restart_text'];
    // let msg   = sprintf("%s<br>\n<br>\n%s", text, window.location.href)
    this.alert.showConfirm(title, text).then((restart) => {
      if(restart) {
        Log.l("RELOADING ONSITEX....");
        this.dataReady = false;
        this.ud.reloadApp();
      }
    }).catch(err => {
      Log.l("confirmAppReload(): Error confirming reload!");
      Log.e(err);
    });
  }

  public async syncData() {
    let lang = this.lang;
    let spinnerID;
    try {
      Log.l("syncData(): Started...");
      let db = this.prefs.getDB();
      spinnerID = await this.alert.showSpinnerPromise(lang['spinner_sending_reports_to_server']);
      let res:any = await this.server.syncToServer(db.reports, db.reports);
      Log.l("syncData(): Successfully synchronized to server.");
      let out = await this.alert.hideSpinnerPromise(spinnerID);
      out = await this.alert.showAlert(lang['success'], lang['manual_sync_success']);
    } catch(err) {
      Log.l("syncData(): Error with server sync.");
      Log.e(err);
      let out = await this.alert.hideSpinnerPromise(spinnerID);
      out = await this.alert.showAlert(lang['error'], lang['manual_sync_error']);
    }
  }

  public syncHelp() {
    let lang = this.lang;
    this.alert.showAlert(lang['sync_data'], lang['sync_data_help']);
  }

  public showAdvanced(event?:any) {
    Log.l(`showAdvanced(): Toggling advanced options. Event was:\n`, event);
    this.advanced = !this.advanced;
  }

  public updateWeeksToShow(weeks:number) {
    let lang = this.lang;
    let count = Number(weeks);
    this.prefs.setUserPayrollPeriodCount(weeks);
    this.savePreferences().then(res => {
      Log.l("saved weeks to show.");
      // this.ud.reloadApp();
      let tech:Employee = this.ud.getTechProfile();
      let pp:PayrollPeriod[] = this.ud.createPayrollPeriods(tech, count);
    }).catch(err => {
      Log.l("updateWeeksToShow(): error saving weeks to show.");
      Log.e(err);
      this.alert.showAlert(lang['error'], err.message);
    });
  }

}
