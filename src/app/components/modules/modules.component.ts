import { SharedModule } from './../../others/shared.module';
import { LoaderComponent } from './../../global-components/loader/loader.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild } from '@angular/core';
import { TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective, BadgeComponent } from '@coreui/angular';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { ModuleAPIService } from '../../apis/module.service';
import { DatePipe } from '@angular/common';
import { ModuleState } from '../../../signals/module-state';

@Component({
  selector: 'app-modules',
  imports: [SharedModule, LoaderComponent, TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, BadgeComponent, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormCheckComponent, FormCheckInputDirective, FormDirective, FormLabelDirective, DatePipe],
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModulesComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  module = inject(ModuleAPIService);
  moduleState = inject(ModuleState)

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  loaderMessage = '';

  // table & list
  modules: any[] = [];
  paginatedData: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  // new / update permission
  @ViewChild('moduleModal') moduleModal!: any;
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  moduleForm = {
    name: '',
    key: '',
    description: '',
    isSystemModule: false
  }

  ngOnInit() {
    this.getModules();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getModules() {
    this.modules = [];
    this.loading = true;
    this.loaderMessage = 'Loading modules...';
    this.module.getAllModules().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.modules = res.data;
        this.moduleState.setModule(this.modules);
        this.prepareModules();
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  prepareModules() {
    this.totalPages = Math.ceil(this.modules.length / this.pageSize);
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.modules.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages });
  }

  //#region Table action functions

  onCheckboxChange(module: any) {
    module.isActive = !module.isActive;
  }

  //#endregion

  //#region new / update module

  process() {
    this.isModalForUpdate ? this.updateModule() : this.createModule();
  }

  createModule() {
    const key = this.helperService.toCapsWithUnderscore(this.moduleForm.name);
    this.moduleForm.key = key;
    if (!this.moduleForm.name)
      return this.toastService.error('Please enter name');
    else if (this.moduleForm.name.length < this.config.nameMinLength)
      return this.toastService.error('Name should be minimum 3 characters');
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
      console.log('err : ', err);
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created module to the list without call the API
  pushNewModuleToList(module: any) {
    this.modules.push(module); // this will add the new module to the list also send through signal
    this.prepareModules();
  }

  updateModule() {

  }

  clearForm() {
    this.moduleForm = {
      name: '',
      description: '',
      key: '',
      isSystemModule: false
    };
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion

}