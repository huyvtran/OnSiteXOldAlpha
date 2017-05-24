import 'intl';
import 'intl/locale-data/jsonp/en';
import { BrowserModule                                           } from '@angular/platform-browser'            ;
import { HttpModule                                              } from '@angular/http'                        ;
import { ErrorHandler , NgModule                                 } from '@angular/core'                        ;
import { IonicApp, IonicErrorHandler, IonicModule, NavController } from 'ionic-angular'                        ;
import { IonicPageModule                                         } from 'ionic-angular'                        ;
import { LoadingController, AlertController                      } from 'ionic-angular'                        ;
import { SplashScreen                                            } from '@ionic-native/splash-screen'          ;
import { StatusBar                                               } from '@ionic-native/status-bar'             ;
import { IonicStorageModule                                      } from '@ionic/storage'                       ;
import { SecureStorage, SecureStorageObject                      } from '@ionic-native/secure-storage'         ;
import { OnSiteApp                                               } from './app.component.ts'                   ;
import { ProfileSettings                                         } from '../providers/profile-settings.ts'     ;
import * as PouchDB                                                from 'pouchdb'                              ;
import * as moment                                                 from 'moment'                               ;
import { AuthSrvcs                                               } from '../providers/auth-srvcs'              ;
import { DBSrvcs                                                 } from '../providers/db-srvcs'                ;
import { TimeSrvc                                                } from '../providers/time-parse-srvc'         ;
import { ReportBuildSrvc                                         } from '../providers/report-build-srvc'       ;
import { UserData                                                } from '../providers/user-data'               ;
import { SrvrSrvcs                                               } from '../providers/srvr-srvcs'              ;
import { DbBulkuploadSrvc                                        } from '../providers/db-bulkupload-srvc'      ;
import { NetworkStatus                                           } from '../providers/network-status'          ;
import { Geofence                                                } from '@ionic-native/geofence'               ;
import { BackgroundGeolocation, BackgroundGeolocationConfig      } from '@ionic-native/background-geolocation' ;
import { BackgroundGeolocationResponse                           } from '@ionic-native/background-geolocation' ;
import { Network                                                 } from '@ionic-native/network'                ;
import { Push, PushObject, PushOptions                           } from '@ionic-native/push'                   ;
import { LocalNotifications                                      } from '@ionic-native/local-notifications'    ;
import { Log, CONSOLE                                            } from '../config/config.functions'           ;
import { AlertsProvider                                          } from '../providers/alerts'                  ;
import { GeolocService                                           } from '../providers/geoloc-service'          ;
// import { HomePage      } from '../pages/home/home'                     ;
// import { Login         } from '../pages/login/login'                   ;
// import { Settings      } from '../pages/settings/settings'             ;
// import { WorkOrder     } from '../pages/work-order/work-order'         ;
// import { ReportHistory } from '../pages/report-history/report-history' ;
// import { EditReport    } from '../pages/edit-report/edit-report'       ;
// import { DeveloperPage } from '../pages/developer/developer'           ;
// import { HomePage      } from '../pages/home/home'                     ;

@NgModule({
  declarations   : [ OnSiteApp  ], 

  entryComponents: [ OnSiteApp], 

  bootstrap      : [ IonicApp                                    ], 
  
  imports        : [
                      BrowserModule,
                      HttpModule,
                      // IonicPageModule.forChild(HomePage),
                      IonicStorageModule.forRoot({
                        name: '__onsitestorage',
                        driverOrder: ['localstorage']
                      }),
                      IonicModule.forRoot(OnSiteApp)
                                                                            ],

  providers      : [
                      StatusBar,
                      SplashScreen,
                      SecureStorage,
                      NavController,
                      LoadingController,
                      AlertController,
                      AlertsProvider,
                      {provide: ErrorHandler, useClass: IonicErrorHandler}   ,
                      ProfileSettings,
                      AuthSrvcs,
                      DBSrvcs,
                      TimeSrvc,
                      ReportBuildSrvc,
                      UserData,
                      SrvrSrvcs,
                      DbBulkuploadSrvc,
                      NetworkStatus,
                      Geofence,
                      BackgroundGeolocation,
                      Network,
                      Push,
                      LocalNotifications,
                      GeolocService           
                                                                            ]
})

export class AppModule {}
