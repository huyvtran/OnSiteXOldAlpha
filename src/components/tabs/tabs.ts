import { Component, OnInit } from '@angular/core';
import { App, Platform     } from 'ionic-angular';
// import { AuthSrvcs         } from '../../providers/auth-srvcs';
import { NgZone            } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserData } from '../../providers/user-data';
import { AlertService } from '../../providers/alerts';
import { Log          } from '../../config/config.functions';

enum Pages {
  'OnSiteHome'    = 0,
  'Report'        = 1,
  'ReportHistory' = 2,
  'User'          = 3,
  'Settings'      = 4,
  'DevPage'       = 5,
}

@Component({
  selector: 'onsite-tabs',
  templateUrl: 'tabs.html'
})
export class TabsComponent implements OnInit {

  static nav:any;
  nav:any = TabsComponent.nav;
  static tabClass: Array<boolean> = [ false, false, false, false, false, false ];
  tabClass:Array<boolean> = TabsComponent.tabClass;
  static allTabs:any = {'disabled': false};
  allTabs:any = TabsComponent.allTabs;
  static tabInfo:any = [
    { name: 'OnSiteHome'    , fullName: 'OnSite Home'        , icon: 'home'     , active: false } ,
    { name: 'Report'        , fullName: 'Report'             , icon: 'document' , active: false } ,
    { name: 'ReportHistory' , fullName: 'Report History'     , icon: 'folder'   , active: false } ,
    { name: 'User'          , fullName: 'User'               , icon: 'contact'  , active: false } ,
    { name: 'Settings'      , fullName: 'Settings'           , icon: 'settings' , active: false } ,
  ];
  tabInfo:any = TabsComponent.tabInfo;
  static developerTab: any = { name: 'DevPage', fullName: 'Developer Settings', icon: 'options', active: false };
  developerTab:any = TabsComponent.developerTab;
  static tab:any = {
    'OnSiteHome': {}
  };
  onSitePage: any;
  userLoggedIn: boolean;
  userIsDeveloper:boolean = false;
  enumPages:any;
  enumPagesDef:any;

  constructor( public app: App, public platform: Platform, public zone: NgZone, public translate: TranslateService, public ud:UserData, public alert:AlertService) {
    this.getActiveNav();
    window['onSiteTabs'] = this;
    this.enumPages = Pages.OnSiteHome;
    this.enumPagesDef = Pages;
  }

  ngOnInit() {
    window['onSiteTabs'] = this;
    if (this.onSitePage === 'Login') { this.setTabDisable(true); }
    if(this.isDeveloper()) {
      if(this.tabInfo[this.tabInfo.length - 1].name !== 'DevPage') {
        this.tabInfo.push(this.developerTab);
      }
    } else if(this.tabInfo[this.tabInfo.length - 1].name === 'DevPage') {
      this.tabInfo.pop();
    }
  }

  getActiveNav() {
    TabsComponent.nav = this.app.getActiveNav();
    this.nav = TabsComponent.nav;
  }

  goToPage(page:string|number, params?:any) {
    let tabs = this.tabInfo;
    let pagename = "OnSiteHome";
    if(typeof page === 'number') {
      pagename = tabs[page].name;
    } else {
      pagename = page;
    }
    Log.l(`Tabs: entering page '${pagename}'`);

    this.highlightPageTab(pagename);
    Log.l(`Tabs: found page ${pagename} at index ${Pages[pagename]}...`);
    this.getActiveNav();
    if(params) {
      this.nav.setRoot(pagename, params);
    } else {
      this.nav.setRoot(pagename);
    }
  }

  highlightPageTab(page:string|number) {
    let tabs = this.tabInfo;
    let pagename = "OnSiteHome";
    if(typeof page === 'number') {
      pagename = tabs[page].name;
    } else {
      pagename = page;
    }
    for(let tab of tabs) {
      tab.active = false;
    }
    let pageNum = Pages[pagename];
    if(pageNum !== undefined) {
      tabs[pageNum].active = true;
    }
  }

  setTabDisable(val:boolean) {
    TabsComponent.allTabs.disabled = val;
  }

  goHome() {
    console.log('entering page: OnSite Home' );
    this.goToPage('OnSiteHome');
  }

  goReport(params?:any) {
    console.log('entering page: Report' );
    this.goToPage('Report');
  }

  goHistory() {
    console.log('entering page: ReportHistory' );
    this.goToPage('ReportHistory');
  }

  goUser() {
    console.log('entering page: User' );
    this.goToPage('User');
  }

  goSettings() {
    console.log('entering page: Settings' );
    this.goToPage('Settings');
  }

  goDev() {
    console.log('entering page: DevPage' );
    this.goToPage('DevPage');
  }

  highlightStatus(i: number) {
    let ngClass = {'hlght': this.tabClass[i]};
    return ngClass;
  }

  highlightTab(tabIndx: number) {
    /* For SHAME! An array .length call in the second clause of a for loop! If we add hundreds of tabs, there will be hell to pay, performance-wise! */
    for( let i = 0; i < this.tabClass.length; i++ ) {
      if( i === tabIndx ) { this.tabClass[i] = true; }
      else { this.tabClass[i] = false; }
    }
  }

  isDeveloper() {
    let un = this.ud.getUsername();
    if( un === 'Chorpler' || un === 'Hachero' || un === 'mike' || un === 'admin' ) {
      this.userIsDeveloper = true;
      return true;
    } else {
      this.userIsDeveloper = false;
      return false;
    }
  }

  terminateApp() {
    let lang = this.translate.instant(['confirm_exit_title', 'confirm_exit_message']);
    this.alert.showConfirm(lang['confirm_exit_title'], lang['confirm_exit_message']).then(res => {
      if(res) {
       Log.l("terminateApp(): User confirmed, exiting app.");
       this.platform.exitApp();
      }
    }).catch(err => {
      Log.l("terminateApp(): Error attempting to exit app.");
    });
  }
}
