import { NgModule                         } from   '@angular/core'                                   ;
import { IonicApp, IonicModule            } from   'ionic-angular'                                   ;
import { BrowserModule                    } from   '@angular/platform-browser'                       ;
import { FormsModule, ReactiveFormsModule } from   '@angular/forms'                                  ;
import { HttpModule                       } from   '@angular/http'                                   ;

import { OnSiteX                          } from  './app.component'                                  ;
import { AcctSetupPage                    } from '../pages/acct-setup-page/acct.setup.page'          ;
import { AcctLoginPage                    } from '../pages/acct-login-page/acct.login.page'          ;
import { UserMgmtHomePage                 } from '../pages/user-mgmt-home-page/user.mgmt.home.page'  ;
import { UserMechHomePage                 } from '../pages/user-mech-home-page/user.mech.home.page'  ;
import { UserTechStatsPage                } from '../pages/user-tech-stats-page/user.tech.stats.page';
import { TechMechReport                   } from '../pages/tech-mech-report/tech.mech.report'        ;
import { TechToprReport                   } from '../pages/tech-topr-report/tech.topr.report'        ;
import { AcctSettingsPage                 } from '../pages/acct-settings-page/acct.settings.page'    ;
import { LandingPage                      } from '../pages/landing-page/landing.page'                ;
import { TinoMsgsAlert                    } from '../components/tino.msgs.alert'                     ;
import { UserComponent                    } from '../components/user.component'                      ;
import { AuthSrvc                         } from '../providers/auth.srvc'                            ;
import { DbSrvc                           } from '../providers/db.srvc'                              ;


@NgModule({
  declarations:    [ AcctSetupPage                ,
                     AcctLoginPage                ,
                     UserMgmtHomePage             ,
                     UserMechHomePage             ,
                     UserTechStatsPage            ,
                     TechMechReport               ,
                     TechToprReport               ,
                     AcctSettingsPage             ,
                     LandingPage                  ,
                     OnSiteX                      ,
                     TinoMsgsAlert                ],

  entryComponents: [ AcctSetupPage                ,
                     AcctLoginPage                ,
                     UserMgmtHomePage             ,
                     UserMechHomePage             ,
                     UserTechStatsPage            ,
                     TechMechReport               ,
                     TechToprReport               ,
                     AcctSettingsPage             ,
                     LandingPage                   ],

  imports:         [ IonicModule.forRoot(OnSiteX) ,
                     BrowserModule                ,
                     FormsModule                  ,
                     ReactiveFormsModule          ,
                     HttpModule                    ],

  providers:       [ AuthSrvc                     ,
                     DbSrvc                        ],

  bootstrap:       [ IonicApp                      ]

})

export class AppModule {  }
