import { SharedModule } from './../../others/shared.module';
import { LoaderComponent } from './../../global-components/loader/loader.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild } from '@angular/core';
import { FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective } from '@coreui/angular';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { ModuleAPIService } from '../../apis/module.service';
import { DatePipe } from '@angular/common';
import { Badge } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToggleButton } from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { GlobalAPIService } from '../../apis/global.service';
import { ForceLoadState } from '../../signals/force-load.state';

@Component({
  selector: 'app-modules',
  imports: [
    SharedModule, LoaderComponent, DatePipe,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, ToggleButton, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormSelectDirective, FormControlDirective, FormDirective, FormLabelDirective],
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModulesComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  module = inject(ModuleAPIService);
  global = inject(GlobalAPIService);
  forceLoadState = inject(ForceLoadState);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  loaderMessage = '';
  forceLoadRoles = this.forceLoadState.forceLoadRoles;
  forceLoadModules = this.forceLoadState.forceLoadModules;

  // table & list
  @ViewChild('dt') table!: Table;
  modules: any[] = [];
  showSelectAll = false;
  moderators: any[] = [];
  selectedModerator?: string;
  statuses = this.helperService.getStatusItems();

  // new / update module
  @ViewChild('moduleModal') moduleModal!: any;
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  moduleForm: any = {};

  // new / update module type
  @ViewChild('moduleModal') typeModuleModal!: any;
  moduleTypes: any[] = [];
  showTypeModal = false;
  isTypeModalForUpdate = false;
  typeModuleForm: any = {};

  ngOnInit() {
    this.getModulesComponentData();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getModulesComponentData() {
    this.moderators = this.modules = [];
    this.loading = true;
    this.loaderMessage = 'Loading modules...';
    this.global.getModulesComponentData(this.forceLoadModules()).subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.modules = res.data.modules;
        this.moderators = res.data.moderators;
        this.moduleTypes = res.data.moduleTypes;
        this.forceLoadState.clearModulesForceLoad();
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  //#region Table action functions

  getModuleChangedStatus(module: any) {
    this.module.updateModule(module._id, { isActive: module.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Module Status');
        this.forceLoadState.setForceLoadRoles(true);
        this.forceLoadState.setForceLoadPermissions(true);
      }
      else {
        this.toastService.info(res.message, 'Module Status');
        module.isActive = !module.isActive;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Module Status');
      module.isActive = !module.isActive;
    })
  }

  moduleDeleteConfirmation(moduleData: any, index: number) {
    const alertPayload = {
      header: 'Delete Module',
      message: 'Are you sure you want to delete this module?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (accepted: any) => {
      if (accepted)
        this.deleteModule(moduleData._id, index);
    })
  }

  deleteModule(id: string, index: number) {
    this.module.deleteModule(id).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message);
        this.modules.splice(index, 1);
        this.forceLoadState.setForceLoadRoles(true);
        this.forceLoadState.setForceLoadPermissions(true);
        this.table.reset();
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.toastService.error(err.error.message);
    })
  }

  //#endregion

  //#region new / update module

  process() {
    this.isModalForUpdate ? this.updateModule() : this.createModule();
  }

  createModule() {
    if (!this.moduleForm.name)
      return this.toastService.error('Please enter name');
    else if (this.moduleForm.name.length < this.config.nameMinLength)
      return this.toastService.error('Name should be minimum 3 characters');
    const key = this.helperService.toCapsWithUnderscore(this.moduleForm.name);
    this.moduleForm.key = key;
    this.submitting = true;
    this.loaderMessage = 'Creating module...';
    this.module.createModule(this.moduleForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewModuleToList(res.data);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created module to the list without call the API
  pushNewModuleToList(moduleData: any) {
    this.modules.push(moduleData); // this will add the new module to the list also send through signal
    this.updateModule();
  }

  updateModule() {
    this.forceLoadState.setForceLoadRoles(true);
    this.forceLoadState.setForceLoadPermissions(true);
  }

  clearForm() {
    this.moduleForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion

  //#region new / update module type

  processType() {
    !this.isTypeModalForUpdate ? this.createModuleType() : '';
  }

  createModuleType() {
    if (!this.typeModuleForm.name)
      return this.toastService.error('Please enter name');
    else if (this.typeModuleForm.name.length < this.config.nameMinLength)
      return this.toastService.error('Name should be minimum 3 characters');
    const key = this.helperService.toCapsWithUnderscore(this.typeModuleForm.name);
    this.typeModuleForm.key = key;
    this.submitting = true;
    this.loaderMessage = 'Creating module type...';
    this.module.createModuleType(this.typeModuleForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeTypeModal(true);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  clearTypeForm() {
    this.typeModuleForm = {};
  }

  closeTypeModal(clearForm?: boolean) {
    clearForm ? this.clearTypeForm() : '';
    this.showTypeModal = false;
  }

  //#endregion

}