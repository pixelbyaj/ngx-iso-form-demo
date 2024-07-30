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
    const jsonSchemaURL = `/iso20022/camt.053.001.10.json`;
    this.httpClient.get(jsonSchemaURL).subscribe((data) => {
      this.schema = data as SchemaElement
    });
    
    const jsonModelURL = `/iso20022/model.json`;
    this.httpClient.get(jsonModelURL).subscribe((data)=>{
      this.form = new IsoForm(data);
    });

  }

}
