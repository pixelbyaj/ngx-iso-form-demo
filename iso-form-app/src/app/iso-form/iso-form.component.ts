import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IsoForm, SchemaElement } from 'ngx-iso-form';

@Component({
  selector: 'app-iso-form',
  templateUrl: './iso-form.component.html',
  styleUrl: './iso-form.component.scss'
})
export class IsoFormComponent implements OnInit {
  schema: SchemaElement;
  form: IsoForm;

  constructor(private httpClient: HttpClient) {
    
  }
  ngOnInit(): void {
    const jsonURL = `/iso20022/camt.053.001.10.json`;
    this.httpClient.get(jsonURL).subscribe((data) => {
      this.schema = data as SchemaElement
      this.form = new IsoForm(null);
    });
  }

}
