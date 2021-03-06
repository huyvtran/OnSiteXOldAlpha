import { NgModule                         } from '@angular/core'                ;
import { IonicPageModule                  } from 'ionic-angular'                ;
import { DeveloperPage                    } from './developer'                  ;
import { HttpClient                       } from '@angular/common/http'         ;
// import { TabsComponentModule              } from 'components/tabs/tabs.module'  ;
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'          ;
import { TranslateHttpLoader              } from '@ngx-translate/http-loader'   ;
import { createTranslateLoader            } from 'config/customTranslateLoader' ;



@NgModule({
  declarations: [
    DeveloperPage,
  ],
  imports: [
    IonicPageModule.forChild(DeveloperPage),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        // useFactory: createTranslateLoader,
        deps: [HttpClient],
      }
    }),
    // TabsComponentModule,
  ],
  exports: [
    DeveloperPage,
    // TabsComponentModule,
]
})
export class DeveloperPageModule {}
