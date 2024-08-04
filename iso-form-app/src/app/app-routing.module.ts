import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsoFormComponent } from './components/iso-form/iso-form.component';

const routes: Routes = [
  { path: '**', component: IsoFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
