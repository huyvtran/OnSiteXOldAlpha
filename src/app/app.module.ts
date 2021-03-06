// import { CustomTranslateLoaderModule                             } from 'config/customTranslateLoader.module'  ;
// import { createJSON5TranslateLoader                              } from 'config/customTranslateLoader'         ;
// import { TabsComponentModule                                     } from 'components/tabs/tabs.module'          ;
// import { Sim                                                     } from '@ionic-native/Sim'                    ;
// import { ClockComponent                                          } from 'components/clock/clock'               ;
// import { MultiPickerModule                                       } from 'ion-multi-picker'                     ;
import 'intl'                                                                                                  ;
import 'intl/locale-data/jsonp/en'                                                                             ;
import { BrowserModule                                           } from '@angular/platform-browser'            ;
import { BrowserAnimationsModule                                 } from '@angular/platform-browser/animations' ;
import { MultiPickerModule                                       } from 'components/ion-multi-picker'          ;
import { HttpModule, Http                                        } from '@angular/http'                        ;
import { HttpClientModule, HttpClient                            } from '@angular/common/http'                 ;
import { ErrorHandler, NgModule, ChangeDetectorRef,              } from '@angular/core'                        ;
import { IonicApp, IonicErrorHandler, IonicModule, NavController } from 'ionic-angular'                        ;
import { IonicPageModule                                         } from 'ionic-angular'                        ;
import { LoadingController, AlertController                      } from 'ionic-angular'                        ;
import { SplashScreen                                            } from '@ionic-native/splash-screen'          ;
import { ClockComponentModule                                    } from 'components/clock/clock.module'        ;
import { StatusBar                                               } from '@ionic-native/status-bar'             ;
import { IonicStorageModule                                      } from '@ionic/storage'                       ;
import { SecureStorage, SecureStorageObject                      } from '@ionic-native/secure-storage'         ;
// import { AppUpdate                                               } from '@ionic-native/app-update'             ;
// import { Push, PushObject, PushOptions                           } from '@ionic-native/push'                   ;
// import { LocalNotifications                                      } from '@ionic-native/local-notifications'    ;
// import { UniqueDeviceID                                          } from '@ionic-native/unique-device-id'       ;
// import { Geofence                                                } from '@ionic-native/geofence'               ;
// import { BackgroundGeolocation, BackgroundGeolocationConfig      } from '@ionic-native/background-geolocation' ;
// import { BackgroundGeolocationResponse                           } from '@ionic-native/background-geolocation' ;
// import { GeolocService                                           } from 'providers/geoloc-service'             ;
// import { IonDigitKeyboard                                        } from 'components/ion-digit-keyboard'        ;
import { Network                                                 } from '@ionic-native/network'                ;
import { Device                                                  } from '@ionic-native/device'                 ;
import { AppVersion                                              } from '@ionic-native/app-version'            ;
import { NativeAudio                                             } from '@ionic-native/native-audio'           ;
import { Camera, CameraOptions                                   } from '@ionic-native/camera'                 ;
import { OpenNativeSettings                                      } from '@ionic-native/open-native-settings'   ;
import { Vibration                                               } from '@ionic-native/vibration'              ;
import { TranslateModule, TranslateLoader                        } from '@ngx-translate/core'                  ;
import { TranslateHttpLoader                                     } from '@ngx-translate/http-loader'           ;
import { OnSiteApp                                               } from './app.component'                      ;
import { AuthSrvcs                                               } from 'providers/auth-srvcs'                 ;
import { DBService                                               } from 'providers/db-service'                 ;
import { UserData                                                } from 'providers/user-data'                  ;
import { ServerService                                           } from 'providers/server-service'             ;
import { NetworkStatus                                           } from 'providers/network-status'             ;
import { DispatchService                                         } from 'providers/dispatch-service'           ;
import { AlertService                                            } from 'providers/alerts'                     ;
import { PouchDBService                                          } from 'providers/pouchdb-service'            ;
import { StorageService                                          } from 'providers/storage-service'            ;
import { createTranslateLoader                                   } from 'config/customTranslateLoader'         ;
import { TabsComponent                                           } from 'components/tabs/tabs'                 ;
import { PipesModule                                             } from 'pipes/pipes.module'                   ;
import { Preferences                                             } from 'providers/preferences'                ;
import { SmartAudio                                              } from 'providers/smart-audio'                ;
import { MessageService                                          } from 'providers/message-service'            ;
import { CommentService                                          } from 'providers/comment-service'            ;
import { TabsService                                             } from 'providers/tabs-service'               ;
import { Keyboard                                                } from '@ionic-native/keyboard'               ;
import { ColorService                                            } from 'providers/color-service'              ;

@NgModule({
  declarations: [
    OnSiteApp,
    TabsComponent,
    // ClockComponent,
  ],
  entryComponents: [
    OnSiteApp,
    TabsComponent,
    // ClockComponent,
  ],
  bootstrap: [
    IonicApp,
  ],
  imports: [
    BrowserModule,
    // BrowserAnimationsModule,
    // TabsComponentModule,
    IonicModule.forRoot(OnSiteApp),
    IonicStorageModule.forRoot({
      name: '__onsitestorage',
      driverOrder: ['localstorage'],
    }),
    HttpClientModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        // useFactory: (createJSON5TranslateLoader),
        deps: [
          HttpClient,
        ],
      }
    }),
    // IonDigitKeyboard,
    PipesModule,
    ClockComponentModule,
    // MultiPickerModule,
  ],

  providers: [
    StatusBar,
    SplashScreen,
    SecureStorage,
    TabsService,
    LoadingController,
    Keyboard,
    ColorService,
    AlertController,
    DispatchService,
    AlertService,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler,
    },
    AuthSrvcs,
    DBService,
    UserData,
    ServerService,
    NetworkStatus,
    // AppUpdate,
    // UniqueDeviceID,
    // Push,
    // LocalNotifications,
    // Geofence,
    // BackgroundGeolocation,
    Network,
    Device,
    // Sim,
    NativeAudio,
    OpenNativeSettings,
    Vibration,
    Camera,
    // GeolocService,
    PouchDBService,
    StorageService,
    // TabsComponent,
    AppVersion,
    Preferences,
    SmartAudio,
    MessageService,
    CommentService,
  ]
})

export class AppModule {}
