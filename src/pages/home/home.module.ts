import { NgModule                         } from '@angular/core'                        ;
import { HomePage                         } from './home'                               ;
import { IonicPageModule                  } from 'ionic-angular'                        ;
import { HttpClient                       } from '@angular/common/http'                 ;
// import { ClockComponentModule             } from 'components/clock/clock.module'        ;
// import { TabsComponentModule              } from 'components/tabs/tabs.module'          ;
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'                  ;
import { TranslateHttpLoader              } from '@ngx-translate/http-loader'           ;
import { createTranslateLoader            } from 'config/customTranslateLoader'         ;
import { PipesModule                      } from 'pipes/pipes.module'                   ;

@NgModule({
  declarations: [HomePage],
  imports: [
    IonicPageModule.forChild(HomePage),
    PipesModule,
    // TabsComponentModule,
    // ClockComponentModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
  // ],
  // entryComponents: [
  //   HomePage
  ],
  exports: [
    HomePage,
    // TabsComponentModule,
   ]
})
export class HomePageModule { }
