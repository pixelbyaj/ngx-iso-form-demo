import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { HttpClient } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  inject,
  Injector,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { StepperOrientation } from '@angular/material/stepper';
import { IsoForm, SchemaElement } from 'ngx-iso-form';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-iso-form',
  templateUrl: './iso-form.component.html',
  styleUrl: './iso-form.component.scss',
})
export class IsoFormComponent implements OnInit {
  stepperOrientation: Observable<StepperOrientation>;
  schema: SchemaElement;
  form: IsoForm;
  xmlMessage: string;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  targetNamespace: string = 'urn:iso:std:iso:20022:tech:xsd:camt.053.001.10';
  selectedFile: File;
  validationMessage: string;
  isError:boolean;
  private apiUrl: string = 'https://www.pixelbyaj.com/api';
  private _injector = inject(Injector);

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  constructor(
    private httpClient: HttpClient,
    private _formBuilder: FormBuilder
  ) {
    this.firstFormGroup = this._formBuilder.group({
      fileCtrl: [''],
      validCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      jsonCtrl: ['', Validators.required],
      validCtrl: ['', Validators.required],
    });
  }

  triggerResize() {
    // Wait for content to render, then trigger textarea resize.
    afterNextRender(
      () => {
        this.autosize.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      }
    );
  }

  ngOnInit(): void {
    if (this.selectedFile == null) {
      const jsonSchemaURL = `https://pixelbyaj.com/iso20022/demo/iso20022/camt.053.001.10.json`;
      this.httpClient.get(jsonSchemaURL).subscribe((data: any) => {
        this.targetNamespace = data.namespace;
        this.schema = data.schemaElement as SchemaElement;
      });

      const jsonModelURL = `https://pixelbyaj.com/iso20022/demo/iso20022/model.json`;
      this.httpClient.get(jsonModelURL).subscribe((data: any) => {
        this.form = new IsoForm(data);
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clearForm();
      const fileCtrl = this.firstFormGroup.get('fileCtrl');
      fileCtrl?.patchValue(input.files[0].name);
      this.selectedFile = input.files[0];
      
      const xsdUrl = `${this.apiUrl}/xsdtojson`;
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
      this.httpClient.post(xsdUrl, formData).subscribe((data: any) => {
        this.targetNamespace = data.namespace;
        this.schema = data.schemaElement as SchemaElement;
      });
    }
  }

  public onIsoFormNext($event: any): void {
    if(this.isError){
      this.clearValidation();
    }
    const validCtrl = this.firstFormGroup.get('validCtrl');
    const validCtrl2 = this.secondFormGroup.get('validCtrl');
    const jsonCtrl = this.secondFormGroup.get('jsonCtrl');
    const jsonModel = JSON.stringify(this.form.getFormModel());
    validCtrl2?.patchValue('');
    this.validationMessage = '';
    if (jsonModel && Object.keys(JSON.parse(jsonModel)).length > 0 && validCtrl?.invalid) {
      validCtrl?.patchValue('true');
      jsonCtrl?.patchValue(jsonModel);
      $event.target.click();
    }
  }

  public onJsonFormNext($event: any): void {
    const validCtrl = this.secondFormGroup.get('validCtrl');
    const jsonModel = JSON.stringify(this.form.getFormModel());
    if (this.secondFormGroup.invalid) {
      const formData = new FormData();
      if (this.selectedFile != null)
      {
        formData.append('file', this.selectedFile, this.selectedFile.name);
      }
      formData.append('jsonModel', jsonModel);
      const url = `${this.apiUrl}/jsontoiso20022/${this.targetNamespace}`;
      this.httpClient
        .post(url, formData, { responseType: 'text' })
        .subscribe({next: (data) => {
          this.isError = false;
          this.xmlMessage = data;
          validCtrl?.patchValue('true');
          $event.target.click();
        },error: (errorData)=>{
          const error = JSON.parse(errorData.error);
          this.xmlMessage = error.xmlMessage;
          this.validationMessage = error.validationMessage;
          validCtrl?.patchValue('true');
          $event.target.click();
        }});
    }
  }

  private clearForm(){
    const fileCtrl = this.firstFormGroup.get('fileCtrl');
    const jsonCtrl = this.secondFormGroup.get('jsonCtrl');    
    fileCtrl?.patchValue('');
    jsonCtrl?.patchValue('');
    this.clearValidation();
  }

  private clearValidation(){    
    const validCtrl = this.firstFormGroup.get('validCtrl');
    const validCtrl2 = this.secondFormGroup.get('validCtrl');    
    validCtrl?.patchValue('');
    validCtrl2?.patchValue('');
  }
}
